from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


# Emergency Contact Schemas
class EmergencyContactBase(BaseModel):
    contact_name: str = Field(..., min_length=1, max_length=150)
    contact_relationship: Optional[str] = Field(None, max_length=100)
    phone: str = Field(..., min_length=1, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=150)
    address: Optional[str] = None


class EmergencyContactCreate(EmergencyContactBase):
    pass


class EmergencyContactUpdate(BaseModel):
    contact_name: Optional[str] = Field(None, min_length=1, max_length=150)
    contact_relationship: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, min_length=1, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=150)
    address: Optional[str] = None


class EmergencyContactResponse(EmergencyContactBase):
    id: UUID
    patient_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Insurance Schemas
class InsuranceBase(BaseModel):
    provider_name: str = Field(..., min_length=1, max_length=150)
    policy_number: str = Field(..., min_length=1, max_length=100)
    coverage_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    coverage_limit: Optional[Decimal] = Field(None, ge=0)
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    is_primary: bool = Field(default=False)

    @field_validator('valid_to')
    @classmethod
    def validate_dates(cls, v, info):
        if v and 'valid_from' in info.data and info.data['valid_from']:
            if v < info.data['valid_from']:
                raise ValueError('valid_to must be after valid_from')
        return v


class InsuranceCreate(InsuranceBase):
    pass


class InsuranceUpdate(BaseModel):
    provider_name: Optional[str] = Field(None, min_length=1, max_length=150)
    policy_number: Optional[str] = Field(None, min_length=1, max_length=100)
    coverage_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    coverage_limit: Optional[Decimal] = Field(None, ge=0)
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    is_primary: Optional[bool] = None


class InsuranceResponse(InsuranceBase):
    id: UUID
    patient_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Document Schemas
class DocumentBase(BaseModel):
    document_type: Optional[str] = Field(None, max_length=100)
    file_url: str = Field(..., min_length=1)


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    document_type: Optional[str] = Field(None, max_length=100)
    file_url: Optional[str] = Field(None, min_length=1)


class DocumentResponse(DocumentBase):
    id: UUID
    patient_id: UUID
    uploaded_by: Optional[UUID] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# Status History Schemas
class StatusHistoryBase(BaseModel):
    status: str = Field(..., min_length=1, max_length=50)


class StatusHistoryCreate(StatusHistoryBase):
    pass


class StatusHistoryResponse(StatusHistoryBase):
    id: UUID
    patient_id: UUID
    changed_by: Optional[UUID] = None
    changed_at: datetime

    class Config:
        from_attributes = True


# Patient Schemas
class PatientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, pattern="^(Male|Female|Other)$")
    date_of_birth: date
    blood_group: Optional[str] = Field(None, max_length=10)
    marital_status: Optional[str] = Field(None, max_length=20)
    nationality: Optional[str] = Field(None, max_length=100)
    national_id: Optional[str] = Field(None, max_length=50)
    passport_number: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    user_id: Optional[UUID] = None


class PatientCreate(PatientBase):
    emergency_contacts: Optional[List[EmergencyContactCreate]] = []
    insurances: Optional[List[InsuranceCreate]] = []


class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    gender: Optional[str] = Field(None, pattern="^(Male|Female|Other)$")
    date_of_birth: Optional[date] = None
    blood_group: Optional[str] = Field(None, max_length=10)
    marital_status: Optional[str] = Field(None, max_length=20)
    nationality: Optional[str] = Field(None, max_length=100)
    national_id: Optional[str] = Field(None, max_length=50)
    passport_number: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    user_id: Optional[UUID] = None


class PatientResponse(PatientBase):
    id: UUID
    patient_code: str
    is_active: bool
    registered_at: datetime
    updated_at: datetime
    emergency_contacts: List[EmergencyContactResponse] = []
    insurances: List[InsuranceResponse] = []
    documents: List[DocumentResponse] = []
    status_history: List[StatusHistoryResponse] = []

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    data: List[PatientResponse]
    total: int


class PaginatedPatientsResponse(BaseModel):
    data: List[PatientResponse]
    total: int
