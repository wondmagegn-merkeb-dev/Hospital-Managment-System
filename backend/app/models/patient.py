from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Date, Text, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid
from app.database import Base


class Gender(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_code = Column(String(30), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Personal Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)  # Using String instead of Enum for flexibility
    date_of_birth = Column(Date, nullable=False)
    blood_group = Column(String(10), nullable=True)
    marital_status = Column(String(20), nullable=True)
    nationality = Column(String(100), nullable=True)
    
    # Identification
    national_id = Column(String(50), nullable=True)
    passport_number = Column(String(50), nullable=True)
    
    # Contact Information
    email = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True, index=True)
    
    # Address
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    registered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    emergency_contacts = relationship("PatientEmergencyContact", back_populates="patient", cascade="all, delete-orphan")
    insurances = relationship("PatientInsurance", back_populates="patient", cascade="all, delete-orphan")
    documents = relationship("PatientDocument", back_populates="patient", cascade="all, delete-orphan")
    status_history = relationship("PatientStatusHistory", back_populates="patient", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("gender IN ('Male', 'Female', 'Other')", name='check_gender'),
    )


class PatientEmergencyContact(Base):
    __tablename__ = "patient_emergency_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    contact_name = Column(String(150), nullable=False)
    contact_relationship = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=False)
    email = Column(String(150), nullable=True)
    address = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="emergency_contacts")


class PatientInsurance(Base):
    __tablename__ = "patient_insurances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    provider_name = Column(String(150), nullable=False)
    policy_number = Column(String(100), nullable=False)
    coverage_percentage = Column(Numeric(5, 2), nullable=True)
    coverage_limit = Column(Numeric(12, 2), nullable=True)
    valid_from = Column(Date, nullable=True)
    valid_to = Column(Date, nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="insurances")


class PatientDocument(Base):
    __tablename__ = "patient_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    document_type = Column(String(100), nullable=True)  # e.g., 'ID', 'Insurance Card', 'Consent Form', 'Medical Record'
    file_url = Column(Text, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])


class PatientStatusHistory(Base):
    __tablename__ = "patient_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status = Column(String(50), nullable=False)  # e.g., 'Registered', 'Active', 'Admitted', 'Discharged', 'Blacklisted', 'Deceased'
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="status_history")
    changer = relationship("User", foreign_keys=[changed_by])
