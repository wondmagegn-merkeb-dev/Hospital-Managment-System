from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import logging

from app.database import get_db
from app.schemas.patient import (
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
from app.services.patient_service import PatientService
from app.dependencies.auth import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

patientRouter = APIRouter(
    prefix="/api/v1/patient",
    tags=["patient"],
)


# Patient CRUD Operations
@patientRouter.post("/", summary="Create patient", description="Register a new patient", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new patient"""
    try:
        return PatientService.create_patient(patient_data, db, created_by=current_user.id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Patient creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@patientRouter.get("/", summary="Get all patients", description="Get a paginated list of patients with optional search and sorting", response_model=PaginatedPatientsResponse)
def get_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_column: Optional[str] = Query(None),
    sort_direction: Optional[str] = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get paginated list of patients"""
    return PatientService.get_patients_paginated(page, page_size, sort_column, sort_direction, search, db)


@patientRouter.get("/{patient_id}", summary="Get patient by ID", description="Get a specific patient by their ID", response_model=PatientResponse)
def get_patient_by_id(patient_id: UUID, db: Session = Depends(get_db)):
    """Get patient by ID"""
    patient = PatientService.get_patient_by_id(patient_id, db)
    return PatientService._create_patient_response(patient, db)


@patientRouter.put("/{patient_id}", summary="Update patient", description="Update an existing patient", response_model=PatientResponse)
def update_patient(
    patient_id: UUID,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update patient"""
    return PatientService.update_patient(patient_id, patient_data, db, updated_by=current_user.id)


@patientRouter.delete("/{patient_id}", summary="Delete patient", description="Soft delete a patient (sets is_active=False)")
def delete_patient(patient_id: UUID, db: Session = Depends(get_db)):
    """Delete patient (soft delete)"""
    PatientService.delete_patient(patient_id, db)
    return {"message": "Patient deleted successfully"}


# Emergency Contact Operations
@patientRouter.post("/{patient_id}/emergency-contacts", summary="Add emergency contact", description="Add an emergency contact to a patient", response_model=EmergencyContactResponse, status_code=status.HTTP_201_CREATED)
def add_emergency_contact(
    patient_id: UUID,
    contact_data: EmergencyContactCreate,
    db: Session = Depends(get_db)
):
    """Add emergency contact to patient"""
    return PatientService.add_emergency_contact(patient_id, contact_data, db)


@patientRouter.put("/emergency-contacts/{contact_id}", summary="Update emergency contact", description="Update an emergency contact", response_model=EmergencyContactResponse)
def update_emergency_contact(
    contact_id: UUID,
    contact_data: EmergencyContactUpdate,
    db: Session = Depends(get_db)
):
    """Update emergency contact"""
    return PatientService.update_emergency_contact(contact_id, contact_data, db)


@patientRouter.delete("/emergency-contacts/{contact_id}", summary="Delete emergency contact", description="Delete an emergency contact")
def delete_emergency_contact(contact_id: UUID, db: Session = Depends(get_db)):
    """Delete emergency contact"""
    PatientService.delete_emergency_contact(contact_id, db)
    return {"message": "Emergency contact deleted successfully"}


# Insurance Operations
@patientRouter.post("/{patient_id}/insurances", summary="Add insurance", description="Add an insurance policy to a patient", response_model=InsuranceResponse, status_code=status.HTTP_201_CREATED)
def add_insurance(
    patient_id: UUID,
    insurance_data: InsuranceCreate,
    db: Session = Depends(get_db)
):
    """Add insurance to patient"""
    return PatientService.add_insurance(patient_id, insurance_data, db)


@patientRouter.put("/insurances/{insurance_id}", summary="Update insurance", description="Update an insurance policy", response_model=InsuranceResponse)
def update_insurance(
    insurance_id: UUID,
    insurance_data: InsuranceUpdate,
    db: Session = Depends(get_db)
):
    """Update insurance"""
    return PatientService.update_insurance(insurance_id, insurance_data, db)


@patientRouter.delete("/insurances/{insurance_id}", summary="Delete insurance", description="Delete an insurance policy")
def delete_insurance(insurance_id: UUID, db: Session = Depends(get_db)):
    """Delete insurance"""
    PatientService.delete_insurance(insurance_id, db)
    return {"message": "Insurance deleted successfully"}


# Document Operations
@patientRouter.post("/{patient_id}/documents", summary="Add document", description="Add a document to a patient", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def add_document(
    patient_id: UUID,
    document_data: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add document to patient"""
    return PatientService.add_document(patient_id, document_data, db, uploaded_by=current_user.id)


@patientRouter.delete("/documents/{document_id}", summary="Delete document", description="Delete a patient document")
def delete_document(document_id: UUID, db: Session = Depends(get_db)):
    """Delete document"""
    PatientService.delete_document(document_id, db)
    return {"message": "Document deleted successfully"}


# Status History Operations
@patientRouter.post("/{patient_id}/status", summary="Update patient status", description="Update patient status and add to history", response_model=StatusHistoryResponse, status_code=status.HTTP_201_CREATED)
def update_patient_status(
    patient_id: UUID,
    status_data: StatusHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update patient status"""
    return PatientService.update_patient_status(patient_id, status_data.status, db, changed_by=current_user.id)
