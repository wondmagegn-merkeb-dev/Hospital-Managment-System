from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from fastapi import HTTPException, status
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
import logging

from ..models.patient import (
    Patient,
    PatientEmergencyContact,
    PatientInsurance,
    PatientDocument,
    PatientStatusHistory
)
from ..schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PaginatedPatientsResponse,
    EmergencyContactCreate,
    EmergencyContactUpdate,
    EmergencyContactResponse,
    InsuranceCreate,
    InsuranceUpdate,
    InsuranceResponse,
    DocumentCreate,
    DocumentResponse,
    StatusHistoryCreate,
    StatusHistoryResponse,
)

logger = logging.getLogger(__name__)


class PatientService:
    """Service for patient operations"""

    @staticmethod
    def _generate_patient_code(db: Session) -> str:
        """Generate unique patient code in format HSP-YYYY-XXXX"""
        current_year = datetime.now().year
        
        # Get the highest patient code for this year
        last_patient = (
            db.query(Patient)
            .filter(Patient.patient_code.like(f"HSP-{current_year}-%"))
            .order_by(desc(Patient.patient_code))
            .first()
        )
        
        if last_patient:
            # Extract the number part and increment
            try:
                last_number = int(last_patient.patient_code.split("-")[-1])
                next_number = last_number + 1
            except (ValueError, IndexError):
                next_number = 1
        else:
            next_number = 1
        
        # Format with leading zeros (4 digits)
        patient_code = f"HSP-{current_year}-{next_number:04d}"
        return patient_code

    @staticmethod
    def create_patient(patient_data: PatientCreate, db: Session, created_by: Optional[UUID] = None) -> PatientResponse:
        """Create a new patient with emergency contacts and insurances"""
        try:
            # Generate patient code
            patient_code = PatientService._generate_patient_code(db)
            
            # Create patient
            patient = Patient(
                patient_code=patient_code,
                first_name=patient_data.first_name,
                last_name=patient_data.last_name,
                middle_name=patient_data.middle_name,
                gender=patient_data.gender,
                date_of_birth=patient_data.date_of_birth,
                blood_group=patient_data.blood_group,
                marital_status=patient_data.marital_status,
                nationality=patient_data.nationality,
                national_id=patient_data.national_id,
                passport_number=patient_data.passport_number,
                email=patient_data.email,
                phone=patient_data.phone,
                address=patient_data.address,
                city=patient_data.city,
                state=patient_data.state,
                country=patient_data.country,
                postal_code=patient_data.postal_code,
                user_id=patient_data.user_id,
                is_active=True,
            )
            
            db.add(patient)
            db.flush()  # Flush to get patient.id
            
            # Add emergency contacts
            if patient_data.emergency_contacts:
                for contact_data in patient_data.emergency_contacts:
                    contact = PatientEmergencyContact(
                        patient_id=patient.id,
                        contact_name=contact_data.contact_name,
                        contact_relationship=contact_data.contact_relationship,
                        phone=contact_data.phone,
                        email=contact_data.email,
                        address=contact_data.address,
                    )
                    db.add(contact)
            
            # Add insurances
            if patient_data.insurances:
                primary_count = sum(1 for ins in patient_data.insurances if ins.is_primary)
                if primary_count > 1:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Only one insurance can be marked as primary"
                    )
                
                for insurance_data in patient_data.insurances:
                    insurance = PatientInsurance(
                        patient_id=patient.id,
                        provider_name=insurance_data.provider_name,
                        policy_number=insurance_data.policy_number,
                        coverage_percentage=insurance_data.coverage_percentage,
                        coverage_limit=insurance_data.coverage_limit,
                        valid_from=insurance_data.valid_from,
                        valid_to=insurance_data.valid_to,
                        is_primary=insurance_data.is_primary,
                    )
                    db.add(insurance)
            
            # Add initial status history
            status_history = PatientStatusHistory(
                patient_id=patient.id,
                status="Registered",
                changed_by=created_by,
            )
            db.add(status_history)
            
            db.commit()
            db.refresh(patient)
            
            return PatientService._create_patient_response(patient, db)
            
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating patient: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create patient: {str(e)}"
            )

    @staticmethod
    def get_patient_by_id(patient_id: UUID, db: Session) -> Patient:
        """Get patient by ID"""
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        return patient

    @staticmethod
    def get_patients_paginated(
        page: int = 1,
        page_size: int = 10,
        sort_column: Optional[str] = None,
        sort_direction: Optional[str] = "asc",
        search: Optional[str] = None,
        db: Session = None
    ) -> PaginatedPatientsResponse:
        """Get paginated list of patients with search and sorting"""
        query = db.query(Patient)
        
        # Apply search filter
        if search:
            search_filter = or_(
                Patient.first_name.ilike(f"%{search}%"),
                Patient.last_name.ilike(f"%{search}%"),
                Patient.patient_code.ilike(f"%{search}%"),
                Patient.email.ilike(f"%{search}%"),
                Patient.phone.ilike(f"%{search}%"),
                Patient.national_id.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)
        
        # Apply sorting
        if sort_column:
            column = getattr(Patient, sort_column, None)
            if column:
                if sort_direction == "desc":
                    query = query.order_by(desc(column))
                else:
                    query = query.order_by(column)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        patients = query.offset((page - 1) * page_size).limit(page_size).all()
        
        # Convert to response
        patient_responses = [PatientService._create_patient_response(p, db) for p in patients]
        
        return PaginatedPatientsResponse(data=patient_responses, total=total)

    @staticmethod
    def update_patient(
        patient_id: UUID,
        patient_data: PatientUpdate,
        db: Session,
        updated_by: Optional[UUID] = None
    ) -> PatientResponse:
        """Update patient information"""
        patient = PatientService.get_patient_by_id(patient_id, db)
        
        # Update fields
        update_data = patient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(patient, field, value)
        
        # Track status change if is_active changed
        if "is_active" in update_data:
            status_value = "Active" if update_data["is_active"] else "Inactive"
            status_history = PatientStatusHistory(
                patient_id=patient.id,
                status=status_value,
                changed_by=updated_by,
            )
            db.add(status_history)
        
        db.commit()
        db.refresh(patient)
        
        return PatientService._create_patient_response(patient, db)

    @staticmethod
    def delete_patient(patient_id: UUID, db: Session) -> None:
        """Delete patient (soft delete by setting is_active=False)"""
        patient = PatientService.get_patient_by_id(patient_id, db)
        patient.is_active = False
        
        # Add status history
        status_history = PatientStatusHistory(
            patient_id=patient.id,
            status="Deactivated",
            changed_by=None,  # System action
        )
        db.add(status_history)
        
        db.commit()

    @staticmethod
    def _create_patient_response(patient: Patient, db: Session) -> PatientResponse:
        """Create patient response with all related data"""
        return PatientResponse(
            id=patient.id,
            patient_code=patient.patient_code,
            first_name=patient.first_name,
            last_name=patient.last_name,
            middle_name=patient.middle_name,
            gender=patient.gender,
            date_of_birth=patient.date_of_birth,
            blood_group=patient.blood_group,
            marital_status=patient.marital_status,
            nationality=patient.nationality,
            national_id=patient.national_id,
            passport_number=patient.passport_number,
            email=patient.email,
            phone=patient.phone,
            address=patient.address,
            city=patient.city,
            state=patient.state,
            country=patient.country,
            postal_code=patient.postal_code,
            user_id=patient.user_id,
            is_active=patient.is_active,
            registered_at=patient.registered_at,
            updated_at=patient.updated_at,
            emergency_contacts=[
                EmergencyContactResponse(
                    id=ec.id,
                    patient_id=ec.patient_id,
                    contact_name=ec.contact_name,
                    contact_relationship=ec.contact_relationship,
                    phone=ec.phone,
                    email=ec.email,
                    address=ec.address,
                    created_at=ec.created_at,
                )
                for ec in patient.emergency_contacts
            ],
            insurances=[
                InsuranceResponse(
                    id=ins.id,
                    patient_id=ins.patient_id,
                    provider_name=ins.provider_name,
                    policy_number=ins.policy_number,
                    coverage_percentage=ins.coverage_percentage,
                    coverage_limit=ins.coverage_limit,
                    valid_from=ins.valid_from,
                    valid_to=ins.valid_to,
                    is_primary=ins.is_primary,
                    created_at=ins.created_at,
                )
                for ins in patient.insurances
            ],
            documents=[
                DocumentResponse(
                    id=doc.id,
                    patient_id=doc.patient_id,
                    document_type=doc.document_type,
                    file_url=doc.file_url,
                    uploaded_by=doc.uploaded_by,
                    uploaded_at=doc.uploaded_at,
                )
                for doc in patient.documents
            ],
            status_history=[
                StatusHistoryResponse(
                    id=sh.id,
                    patient_id=sh.patient_id,
                    status=sh.status,
                    changed_by=sh.changed_by,
                    changed_at=sh.changed_at,
                )
                for sh in patient.status_history
            ],
        )

    # Emergency Contact Methods
    @staticmethod
    def add_emergency_contact(
        patient_id: UUID,
        contact_data: EmergencyContactCreate,
        db: Session
    ) -> EmergencyContactResponse:
        """Add emergency contact to patient"""
        patient = PatientService.get_patient_by_id(patient_id, db)
        
        contact = PatientEmergencyContact(
            patient_id=patient.id,
            **contact_data.model_dump()
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
        
        return EmergencyContactResponse(
            id=contact.id,
            patient_id=contact.patient_id,
            contact_name=contact.contact_name,
            contact_relationship=contact.contact_relationship,
            phone=contact.phone,
            email=contact.email,
            address=contact.address,
            created_at=contact.created_at,
        )

    @staticmethod
    def update_emergency_contact(
        contact_id: UUID,
        contact_data: EmergencyContactUpdate,
        db: Session
    ) -> EmergencyContactResponse:
        """Update emergency contact"""
        contact = db.query(PatientEmergencyContact).filter(
            PatientEmergencyContact.id == contact_id
        ).first()
        
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency contact not found"
            )
        
        update_data = contact_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(contact, field, value)
        
        db.commit()
        db.refresh(contact)
        
        return EmergencyContactResponse(
            id=contact.id,
            patient_id=contact.patient_id,
            contact_name=contact.contact_name,
            contact_relationship=contact.contact_relationship,
            phone=contact.phone,
            email=contact.email,
            address=contact.address,
            created_at=contact.created_at,
        )

    @staticmethod
    def delete_emergency_contact(contact_id: UUID, db: Session) -> None:
        """Delete emergency contact"""
        contact = db.query(PatientEmergencyContact).filter(
            PatientEmergencyContact.id == contact_id
        ).first()
        
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency contact not found"
            )
        
        db.delete(contact)
        db.commit()

    # Insurance Methods
    @staticmethod
    def add_insurance(
        patient_id: UUID,
        insurance_data: InsuranceCreate,
        db: Session
    ) -> InsuranceResponse:
        """Add insurance to patient"""
        patient = PatientService.get_patient_by_id(patient_id, db)
        
        # Check if setting as primary and another primary exists
        if insurance_data.is_primary:
            existing_primary = db.query(PatientInsurance).filter(
                PatientInsurance.patient_id == patient_id,
                PatientInsurance.is_primary == True
            ).first()
            
            if existing_primary:
                existing_primary.is_primary = False
        
        insurance = PatientInsurance(
            patient_id=patient.id,
            **insurance_data.model_dump()
        )
        db.add(insurance)
        db.commit()
        db.refresh(insurance)
        
        return InsuranceResponse(
            id=insurance.id,
            patient_id=insurance.patient_id,
            provider_name=insurance.provider_name,
            policy_number=insurance.policy_number,
            coverage_percentage=insurance.coverage_percentage,
            coverage_limit=insurance.coverage_limit,
            valid_from=insurance.valid_from,
            valid_to=insurance.valid_to,
            is_primary=insurance.is_primary,
            created_at=insurance.created_at,
        )

    @staticmethod
    def update_insurance(
        insurance_id: UUID,
        insurance_data: InsuranceUpdate,
        db: Session
    ) -> InsuranceResponse:
        """Update insurance"""
        insurance = db.query(PatientInsurance).filter(
            PatientInsurance.id == insurance_id
        ).first()
        
        if not insurance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Insurance not found"
            )
        
        # Handle primary insurance change
        if insurance_data.is_primary is True and not insurance.is_primary:
            # Unset other primary insurances for this patient
            db.query(PatientInsurance).filter(
                PatientInsurance.patient_id == insurance.patient_id,
                PatientInsurance.id != insurance_id,
                PatientInsurance.is_primary == True
            ).update({"is_primary": False})
        
        update_data = insurance_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(insurance, field, value)
        
        db.commit()
        db.refresh(insurance)
        
        return InsuranceResponse(
            id=insurance.id,
            patient_id=insurance.patient_id,
            provider_name=insurance.provider_name,
            policy_number=insurance.policy_number,
            coverage_percentage=insurance.coverage_percentage,
            coverage_limit=insurance.coverage_limit,
            valid_from=insurance.valid_from,
            valid_to=insurance.valid_to,
            is_primary=insurance.is_primary,
            created_at=insurance.created_at,
        )

    @staticmethod
    def delete_insurance(insurance_id: UUID, db: Session) -> None:
        """Delete insurance"""
        insurance = db.query(PatientInsurance).filter(
            PatientInsurance.id == insurance_id
        ).first()
        
        if not insurance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Insurance not found"
            )
        
        db.delete(insurance)
        db.commit()

    # Document Methods
    @staticmethod
    def add_document(
        patient_id: UUID,
        document_data: DocumentCreate,
        db: Session,
        uploaded_by: Optional[UUID] = None
    ) -> DocumentResponse:
        """Add document to patient"""
        patient = PatientService.get_patient_by_id(patient_id, db)
        
        document = PatientDocument(
            patient_id=patient.id,
            document_type=document_data.document_type,
            file_url=document_data.file_url,
            uploaded_by=uploaded_by,
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return DocumentResponse(
            id=document.id,
            patient_id=document.patient_id,
            document_type=document.document_type,
            file_url=document.file_url,
            uploaded_by=document.uploaded_by,
            uploaded_at=document.uploaded_at,
        )

    @staticmethod
    def delete_document(document_id: UUID, db: Session) -> None:
        """Delete document"""
        document = db.query(PatientDocument).filter(
            PatientDocument.id == document_id
        ).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        db.delete(document)
        db.commit()

    # Status History Methods
    @staticmethod
    def update_patient_status(
        patient_id: UUID,
        status: str,
        db: Session,
        changed_by: Optional[UUID] = None
    ) -> StatusHistoryResponse:
        """Update patient status and add to history"""
        patient = PatientService.get_patient_by_id(patient_id, db)
        
        status_history = PatientStatusHistory(
            patient_id=patient.id,
            status=status,
            changed_by=changed_by,
        )
        db.add(status_history)
        db.commit()
        db.refresh(status_history)
        
        return StatusHistoryResponse(
            id=status_history.id,
            patient_id=status_history.patient_id,
            status=status_history.status,
            changed_by=status_history.changed_by,
            changed_at=status_history.changed_at,
        )
