from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from ..database.db_setup import get_db
from ..schemas.role import (
    RoleCreate, RoleUpdate, RoleResponse,
    PaginatedRolesResponse, UserRoleResponse
)
from ..services.role_service import RoleService

roleRouter = APIRouter(
    prefix="/api/v1/role",
    tags=["role"],
)


# Role CRUD operations
@roleRouter.get("/", summary="Get all roles", description="Get a paginated list of roles with optional search", response_model=PaginatedRolesResponse)
def get_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_column: Optional[str] = Query(None),
    sort_direction: Optional[str] = Query(None, pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get paginated list of roles"""
    return RoleService.get_roles(page, page_size, search, sort_column, sort_direction, db)


@roleRouter.get("/all", summary="Get all roles (no pagination)", description="Get all roles without pagination")
def get_all_roles(db: Session = Depends(get_db)):
    """Get all roles without pagination"""
    return RoleService.get_all_roles(db)


# User-Role mapping - MUST be before /{role_id} (otherwise "user" matches role_id and causes 422)
@roleRouter.get("/user/{user_id}/roles", summary="Get user roles", description="Get all roles assigned to a user")
def get_user_roles(user_id: UUID, db: Session = Depends(get_db)):
    """Get all roles assigned to a user"""
    return RoleService.get_user_roles(user_id, db)


@roleRouter.post("/user/{user_id}/role/{role_id}", summary="Assign role to user", description="Assign a role to a user", response_model=UserRoleResponse)
def assign_role_to_user(user_id: UUID, role_id: UUID, db: Session = Depends(get_db)):
    """Assign role to a user"""
    return RoleService.assign_role_to_user(user_id, role_id, db)


@roleRouter.delete("/user/{user_id}/role/{role_id}", summary="Remove role from user", description="Remove a role from a user")
def remove_role_from_user(user_id: UUID, role_id: UUID, db: Session = Depends(get_db)):
    """Remove role from a user"""
    return RoleService.remove_role_from_user(user_id, role_id, db)


@roleRouter.get("/{role_id}", summary="Get role by ID", description="Get a specific role by its ID", response_model=RoleResponse)
def get_role_by_id(role_id: UUID, db: Session = Depends(get_db)):
    """Get role by ID"""
    return RoleService.get_role_by_id(role_id, db)


@roleRouter.post("/", summary="Create role", description="Create a new role", response_model=RoleResponse)
def create_role(role_data: RoleCreate, db: Session = Depends(get_db)):
    """Create a new role"""
    return RoleService.create_role(role_data, db)


@roleRouter.put("/{role_id}", summary="Update role", description="Update an existing role", response_model=RoleResponse)
def update_role(role_id: UUID, role_data: RoleUpdate, db: Session = Depends(get_db)):
    """Update role"""
    return RoleService.update_role(role_id, role_data, db)


@roleRouter.delete("/{role_id}", summary="Delete role", description="Delete a role")
def delete_role(role_id: UUID, db: Session = Depends(get_db)):
    """Delete role"""
    return RoleService.delete_role(role_id, db)

