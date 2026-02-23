from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime
from uuid import UUID

from ..models.role import Role
from ..models.user import User, UserRole
from ..schemas.role import (
    RoleCreate, RoleUpdate, RoleResponse,
    PaginatedRolesResponse, UserRoleResponse
)


class RoleService:
    """Service for role operations"""
    
    @staticmethod
    def get_roles(
        page: int,
        page_size: int,
        search: Optional[str],
        sort_column: Optional[str],
        sort_direction: Optional[str],
        db: Session
    ) -> PaginatedRolesResponse:
        """Get paginated list of roles"""
        query = db.query(Role)
        
        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Role.name.ilike(search_pattern),
                    Role.description.ilike(search_pattern)
                )
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        if sort_column and sort_direction:
            column = getattr(Role, sort_column, None)
            if column is not None:
                if sort_direction == "desc":
                    query = query.order_by(column.desc())
                else:
                    query = query.order_by(column.asc())
        
        # Apply pagination
        offset = (page - 1) * page_size
        roles = query.offset(offset).limit(page_size).all()
        
        return PaginatedRolesResponse(
            data=[RoleResponse.model_validate(role) for role in roles],
            total=total
        )
    
    @staticmethod
    def get_all_roles(db: Session) -> list[RoleResponse]:
        """Get all roles without pagination"""
        roles = db.query(Role).all()
        return [RoleResponse.model_validate(role) for role in roles]
    
    @staticmethod
    def get_role_by_id(role_id: UUID, db: Session) -> RoleResponse:
        """Get role by ID"""
        role = db.query(Role).filter(Role.id == role_id).first()
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        return RoleResponse.model_validate(role)
    
    @staticmethod
    def create_role(role_data: RoleCreate, db: Session) -> RoleResponse:
        """Create a new role"""
        # Check if role name already exists
        existing_role = db.query(Role).filter(
            Role.name == role_data.name,
        ).first()
        
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists"
            )
        
        # Create new role
        new_role = Role(
            name=role_data.name,
            description=role_data.description,
            permissions=role_data.permissions if role_data.permissions is not None else {}
        )
        
        db.add(new_role)
        db.commit()
        db.refresh(new_role)
        
        return RoleResponse.model_validate(new_role)
    
    @staticmethod
    def update_role(role_id: UUID, role_data: RoleUpdate, db: Session) -> RoleResponse:
        """Update role"""
        role = db.query(Role).filter(Role.id == role_id).first()
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        # Check if role name already exists (excluding current role)
        if role_data.name:
            existing_role = db.query(Role).filter(
                Role.name == role_data.name,
                Role.id != role_id
            ).first()
            
            if existing_role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Role name already exists"
                )
        
        # Update role fields
        if role_data.name is not None:
            role.name = role_data.name
        if role_data.description is not None:
            role.description = role_data.description
        if role_data.permissions is not None:
            role.permissions = role_data.permissions
        
        role.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(role)
        
        return RoleResponse.model_validate(role)
    
    @staticmethod
    def delete_role(role_id: UUID, db: Session) -> dict:
        """Delete role"""
        role = db.query(Role).filter(Role.id == role_id).first()
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        db.delete(role)
        db.commit()
        
        return {"message": "Role deleted successfully"}
    
    @staticmethod
    def get_user_roles(user_id: UUID, db: Session) -> list[UserRoleResponse]:
        """Get all roles assigned to a user"""
        user_roles = db.query(UserRole).filter(UserRole.user_id == user_id).all()
        return [UserRoleResponse.model_validate(ur) for ur in user_roles]
    
    @staticmethod
    def assign_role_to_user(user_id: UUID, role_id: UUID, db: Session) -> UserRoleResponse:
        """Assign a role to a user"""
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if role exists
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        # Check if already assigned
        existing = db.query(UserRole).filter(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id
        ).first()
        
        if existing:
            return UserRoleResponse.model_validate(existing)
        
        # Create new assignment
        user_role = UserRole(user_id=user_id, role_id=role_id)
        db.add(user_role)
        db.commit()
        db.refresh(user_role)
        
        return UserRoleResponse.model_validate(user_role)
    
    @staticmethod
    def remove_role_from_user(user_id: UUID, role_id: UUID, db: Session) -> dict:
        """Remove a role from a user"""
        user_role = db.query(UserRole).filter(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id
        ).first()
        
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User role assignment not found"
            )
        
        db.delete(user_role)
        db.commit()
        
        return {"message": "Role removed from user successfully"}
