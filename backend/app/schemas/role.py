from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
from datetime import datetime
from uuid import UUID

PermissionAction = Literal["create", "read", "update", "delete"]

class RoleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    permissions: Optional[Dict[str, List[PermissionAction]]] = Field(
        default={}, 
        description="Permissions as a dictionary where keys are resource names and values are arrays of permission actions. Example: {'users': ['create', 'delete'], 'patients': ['read', 'update']}"
    )


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    permissions: Optional[Dict[str, List[str]]] = Field(
        None, 
        description="Permissions as a dictionary where keys are resource names and values are arrays of permission actions. Example: {'users': ['create', 'delete'], 'patients': ['read', 'update']}"
    )


class RoleResponse(RoleBase):
    id: UUID
    permissions: Optional[Dict[str, List[str]]] = Field(
        default={}, 
        description="Permissions as a dictionary where keys are resource names and values are arrays of permission actions"
    )
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedRolesResponse(BaseModel):
    data: List[RoleResponse]
    total: int


class UserRoleResponse(BaseModel):
    user_id: UUID
    role_id: UUID
    assigned_at: datetime
    role: Optional[RoleResponse] = None

    class Config:
        from_attributes = True
