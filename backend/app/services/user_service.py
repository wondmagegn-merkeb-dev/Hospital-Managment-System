from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime
from uuid import UUID
import logging

from ..models.user import User, UserRole, UserStatus

logger = logging.getLogger(__name__)
from ..models.role import Role
from ..config.constants import SUPER_ADMIN_ROLE_NAME
from ..schemas.user import UserCreate, UserUpdate, UserResponse, PaginatedUsersResponse
from ..utils.password import hash_password
from ..utils.email import send_credentials_email, send_verification_email
import random
import secrets
import string


class UserService:
    """Service for user operations"""
    
    @staticmethod
    def _load_user_roles(user_id: UUID, db: Session) -> list:
        """Helper method to load user roles"""
        user_roles = db.query(UserRole).filter(UserRole.user_id == user_id).all()
        return [{"id": ur.role.id, "name": ur.role.name} for ur in user_roles]
    
    @staticmethod
    def _create_user_response(user: User, db: Session) -> UserResponse:
        """Helper method to create user response with roles.
        Build manually to avoid Pydantic validating User.roles (UserRole objects) as RoleInfo."""
        roles = UserService._load_user_roles(user.id, db)
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            status=user.status.value if hasattr(user.status, "value") else str(user.status),
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login=user.last_login,
            roles=roles,
        )
    
    @staticmethod
    def _generate_otp() -> str:
        """Generate a 6-digit OTP code"""
        return str(random.randint(100000, 999999))

    @staticmethod
    def _generate_password(length: int = 12) -> str:
        """Generate a secure random password with letters and digits"""
        alphabet = string.ascii_letters + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

    @staticmethod
    def _generate_username(email: str, db: Session) -> str:
        """Generate unique username from email (part before @)"""
        base = email.split("@")[0].lower()
        base = "".join(c if c.isalnum() or c in "._-" else "_" for c in base)
        base = base.replace(".", "_")[:47]
        if len(base) < 3:
            base = base + str(random.randint(100, 999))

        username = base
        counter = 1
        while db.query(User).filter(User.username == username).first():
            suffix = str(counter)
            username = f"{base}_{suffix}" if len(base) + len(suffix) + 1 <= 50 else f"{base[:49 - len(suffix)]}{suffix}"
            counter += 1
        return username

    @staticmethod
    def register_user(user_data: UserCreate, db: Session) -> UserResponse:
        """Register a new user"""
        # Check if email already exists
        if db.query(User).filter(User.email == user_data.email).first():
            logger.info(f"Registration rejected: email already exists - {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

        # Use provided username or generate from email
        if user_data.username:
            if db.query(User).filter(User.username == user_data.username).first():
                logger.info(f"Registration rejected: username already exists - {user_data.username}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )
            username = user_data.username
        else:
            username = UserService._generate_username(user_data.email, db)
        
        # Generate or use provided password
        if user_data.password:
            plain_password = user_data.password
        else:
            plain_password = UserService._generate_password()

        hashed_password = hash_password(plain_password)

        otp_code = UserService._generate_otp()
        new_user = User(
            username=username,
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name,
            status=UserStatus(user_data.status),
            verfication_otp=otp_code,
            is_verified=False,
        )

        db.add(new_user)
        db.flush()  # Flush to get the user ID

        # Assign roles if provided (super_admin cannot be assigned via UI/API)
        if user_data.role_ids:
            for role_id in user_data.role_ids:
                role = db.query(Role).filter(Role.id == role_id).first()
                if not role:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Role with id {role_id} not found"
                    )
                if role.name == SUPER_ADMIN_ROLE_NAME:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Cannot assign super admin role to a new user."
                    )
                user_role = UserRole(user_id=new_user.id, role_id=role_id)
                db.add(user_role)

        db.commit()
        db.refresh(new_user)

        # Send credentials email (username + password) to user for login
        creds_sent = send_credentials_email(new_user.email, username, plain_password)
        # Send verification email - user must verify before accessing the app
        send_verification_email(new_user.email, otp_code)
        if not creds_sent:
            logger.warning(f"Failed to send credentials email to {new_user.email}")

        return UserService._create_user_response(new_user, db)
    
    @staticmethod
    def _user_has_super_admin_role(user_id: UUID, db: Session) -> bool:
        """Check if user has the super_admin role."""
        return db.query(UserRole).join(Role).filter(
            UserRole.user_id == user_id,
            Role.name == SUPER_ADMIN_ROLE_NAME,
        ).first() is not None

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
        """Get paginated list of users (excludes super_admin users)"""
        # Subquery: user IDs that have super_admin role
        super_admin_user_ids = (
            db.query(UserRole.user_id)
            .join(Role)
            .filter(Role.name == SUPER_ADMIN_ROLE_NAME)
            .subquery()
        )
        query = db.query(User).filter(~User.id.in_(super_admin_user_ids))
        
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
        if UserService._user_has_super_admin_role(user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot edit super_admin user."
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
        
        # Update roles if provided (super_admin cannot be assigned via UI/API)
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
                if role.name == SUPER_ADMIN_ROLE_NAME:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Cannot assign super admin role to a user."
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
        if UserService._user_has_super_admin_role(user_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot delete super_admin user."
            )
        
        db.delete(user)
        db.commit()
        
        return {"message": "User deleted successfully"}
