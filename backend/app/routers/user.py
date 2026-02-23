from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse, PaginatedUsersResponse
from app.services.user_service import UserService

userRouter = APIRouter(
    prefix="/api/v1/user",
    tags=["user"],
)


@userRouter.post("/register", summary="Register a new user", description="Register a new user with email and password", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    return UserService.register_user(user_data, db)


@userRouter.get("/", summary="Get all users", description="Get a paginated list of users with optional search and filtering", response_model=PaginatedUsersResponse)
def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_column: Optional[str] = Query(None),
    sort_direction: Optional[str] = Query(None, pattern="^(asc|desc)$"),
    role_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get paginated list of users"""
    return UserService.get_users(page, page_size, search, sort_column, sort_direction, role_filter, db)


@userRouter.get("/{user_id}", summary="Get user by ID", description="Get a specific user by their ID", response_model=UserResponse)
def get_user_by_id(user_id: UUID, db: Session = Depends(get_db)):
    """Get user by ID"""
    return UserService.get_user_by_id(user_id, db)


@userRouter.put("/{user_id}", summary="Update user", description="Update an existing user", response_model=UserResponse)
def update_user(user_id: UUID, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update user"""
    return UserService.update_user(user_id, user_data, db)


@userRouter.delete("/{user_id}", summary="Delete user", description="Delete a user")
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """Delete user"""
    return UserService.delete_user(user_id, db)
