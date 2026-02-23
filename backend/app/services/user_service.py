from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime
from uuid import UUID

from ..models.user import User, UserRole, UserStatus
from ..models.role import Role
from ..schemas.user import UserCreate, UserUpdate, UserResponse, PaginatedUsersResponse
from ..utils.password import hash_password
from ..utils.email import send_verification_email
import random
from datetime import timedelta


class UserService:
    """Service for user operations"""
    
    @staticmethod
    def _load_user_roles(user_id: UUID, db: Session) -> list:
        """Helper method to load user roles"""
        user_roles = db.query(UserRole).filter(UserRole.user_id == user_id).all()
        return [{"id": ur.role.id, "name": ur.role.name} for ur in user_roles]
    
    @staticmethod
    def _create_user_response(user: User, db: Session) -> UserResponse:
        """Helper method to create user response with roles"""
        roles = UserService._load_user_roles(user.id, db)
        response = UserResponse.model_validate(user)
        response.roles = roles
        return response
    
    @staticmethod
    def _generate_otp() -> str:
        """Generate a 6-digit OTP code"""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def register_user(user_data: UserCreate, db: Session) -> UserResponse:
        """Register a new user"""
        # Check if username or email already exists
        existing_user = db.query(User).filter(
            or_(User.username == user_data.username, User.email == user_data.email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists"
            )
        
        # Create new user
        hashed_password = hash_password(user_data.password)
        
        # Generate verification OTP
        verification_otp = UserService._generate_otp()
        
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name,
            status=UserStatus(user_data.status),
            verfication_otp=verification_otp
        )
        
        db.add(new_user)
        db.flush()  # Flush to get the user ID
        
        # Assign roles if provided
        if user_data.role_ids:
            for role_id in user_data.role_ids:
                role = db.query(Role).filter(Role.id == role_id).first()
                if not role:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Role with id {role_id} not found"
                    )
                user_role = UserRole(user_id=new_user.id, role_id=role_id)
                db.add(user_role)
        
        db.commit()
        db.refresh(new_user)
        
        # Send verification email
        email_sent = send_verification_email(new_user.email, verification_otp)
        if not email_sent:
            print(f"Failed to send verification email to {new_user.email}")
        
        return UserService._create_user_response(new_user, db)
    
    @staticmethod
    def get_users(
        page: int,
        page_size: int,
        search: Optional[str],
        sort_column: Optional[str],
        sort_direction: Optional[str],
        role_filter: Optional[str],
        db: Session
    ) -> PaginatedUsersResponse:
        """Get paginated list of users"""
        query = db.query(User)
        
        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    User.username.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    User.full_name.ilike(search_pattern)
                )
            )
        
        # Apply role filter
        if role_filter and role_filter != "all":
            query = query.join(UserRole).join(Role).filter(
                Role.name.ilike(f"%{role_filter}%")
            )
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        if sort_column and sort_direction:
            column = getattr(User, sort_column, None)
            if column is not None:
                if sort_direction == "desc":
                    query = query.order_by(column.desc())
                else:
                    query = query.order_by(column.asc())
        
        # Apply pagination
        offset = (page - 1) * page_size
        users = query.offset(offset).limit(page_size).all()
        
        # Load roles for each user
        user_responses = []
        for user in users:
            user_responses.append(UserService._create_user_response(user, db))
        
        return PaginatedUsersResponse(data=user_responses, total=total)
    
    @staticmethod
    def get_user_by_id(user_id: UUID, db: Session) -> UserResponse:
        """Get user by ID"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserService._create_user_response(user, db)
    
    @staticmethod
    def update_user(user_id: UUID, user_data: UserUpdate, db: Session) -> UserResponse:
        """Update user"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if username or email already exists (excluding current user)
        if user_data.username or user_data.email:
            conditions = []
            if user_data.username:
                conditions.append(User.username == user_data.username)
            if user_data.email:
                conditions.append(User.email == user_data.email)
            
            if conditions:
                existing_user = db.query(User).filter(
                    or_(*conditions),
                    User.id != user_id
                ).first()
                
                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Username or email already exists"
                    )
        
        # Update user fields
        if user_data.username is not None:
            user.username = user_data.username
        if user_data.email is not None:
            user.email = user_data.email
        if user_data.full_name is not None:
            user.full_name = user_data.full_name
        if user_data.password is not None:
            user.password_hash = hash_password(user_data.password)
        if user_data.status is not None:
            user.status = UserStatus(user_data.status)
        
        user.updated_at = datetime.utcnow()
        
        # Update roles if provided
        if user_data.role_ids is not None:
            # Remove existing roles
            db.query(UserRole).filter(UserRole.user_id == user_id).delete()
            
            # Add new roles
            for role_id in user_data.role_ids:
                role = db.query(Role).filter(Role.id == role_id).first()
                if not role:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Role with id {role_id} not found"
                    )
                user_role = UserRole(user_id=user_id, role_id=role_id)
                db.add(user_role)
        
        db.commit()
        db.refresh(user)
        
        return UserService._create_user_response(user, db)
    
    @staticmethod
    def delete_user(user_id: UUID, db: Session) -> dict:
        """Delete user"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db.delete(user)
        db.commit()
        
        return {"message": "User deleted successfully"}
