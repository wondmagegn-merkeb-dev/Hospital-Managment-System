from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.db_setup import get_db
from ..dependencies.auth import get_current_user
from ..models.user import User
from ..schemas.auth import (
    LoginRequest, LoginResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
    VerifyEmailRequest, VerifyEmailResponse,
    ResendVerificationRequest, ResendVerificationResponse,
    ProfileUpdate,
)
from ..services.auth_service import AuthService

authRouter = APIRouter(
    prefix="/api/v1/auth",
    tags=["auth"],
)


@authRouter.get("/me", summary="Get current user", description="Get the current logged in user details")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return current user info (same format as login response)."""
    return AuthService.get_me_user_info(user, db)


@authRouter.put("/profile", summary="Update profile", description="Update current user's full name and/or password")
def update_profile(
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update own profile: full_name and/or password (requires current_password for password change)."""
    return AuthService.update_profile(user, data, db)


@authRouter.post("/login", summary="Login a user", description="Login a user with email and password and get access token", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login a user and return access token"""
    return AuthService.login(login_data, db)


@authRouter.post("/forgot-password", summary="Forgot password", description="Send a password reset OTP code to the user's email", response_model=ForgotPasswordResponse)
def forgot_password(forgot_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset OTP code to user's email"""
    return AuthService.forgot_password(forgot_data, db)


@authRouter.post("/reset-password", summary="Reset password", description="Reset the user's password using the OTP code sent in the email", response_model=ResetPasswordResponse)
def reset_password(reset_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password using OTP code"""
    return AuthService.reset_password(reset_data, db)


@authRouter.post("/verify-email", summary="Verify email", description="Verify user email address using the OTP code sent during registration", response_model=VerifyEmailResponse)
def verify_email(verify_data: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify user email address using OTP code"""
    return AuthService.verify_email(verify_data, db)


@authRouter.post("/resend-verification", summary="Resend verification", description="Resend email verification OTP code to user's email", response_model=ResendVerificationResponse)
def resend_verification(resend_data: ResendVerificationRequest, db: Session = Depends(get_db)):
    """Resend email verification OTP code"""
    return AuthService.resend_verification(resend_data, db)