from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class RoleInfo(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., max_length=100)
    full_name: Optional[str] = Field(None, max_length=150)


class UserCreate(BaseModel):
    """Username and password are optional - backend auto-generates them and emails credentials to user"""
    email: EmailStr = Field(..., max_length=100)
    full_name: Optional[str] = Field(None, max_length=150)
    password: Optional[str] = Field(None, min_length=6)  # Optional: backend generates if not provided
    status: str = Field(default="active", pattern="^(active|inactive|suspended)$")
    role_ids: Optional[List[UUID]] = Field(default=None)
    username: Optional[str] = Field(None, min_length=3, max_length=50)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(None, max_length=100)
    full_name: Optional[str] = Field(None, max_length=150)
    password: Optional[str] = Field(None, min_length=6)
    status: Optional[str] = Field(None, pattern="^(active|inactive|suspended)$")
    role_ids: Optional[List[UUID]] = None


class UserResponse(UserBase):
    id: UUID
    email: str = Field(..., max_length=100)  # Override: use str to allow .local and internal domains
    status: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    roles: Optional[List[RoleInfo]] = []

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    data: List[UserResponse]
    total: int


class PaginatedUsersResponse(BaseModel):
    data: List[UserResponse]
    total: int
