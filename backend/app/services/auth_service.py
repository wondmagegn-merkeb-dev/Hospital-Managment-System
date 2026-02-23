from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import random

from ..models.user import User, UserRole
from ..utils.password import verify_password, hash_password
from ..utils.jwt import create_access_token
from ..utils.email import send_password_reset_email, send_verification_email
from ..schemas.auth import (
    LoginRequest, LoginResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
    VerifyEmailRequest, VerifyEmailResponse,
    ResendVerificationRequest, ResendVerificationResponse
)


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def login(login_data: LoginRequest, db: Session) -> LoginResponse:
        """
        Authenticate a user and return access token
        
        Args:
            login_data: Login credentials (email and password)
            db: Database session
            
        Returns:
            LoginResponse with access token and user information
            
        Raises:
            HTTPException: If credentials are invalid or user is inactive
        """
        # Find user by email
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if user.status.value != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User account is {user.status.value}"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Load user roles
        user_roles = db.query(UserRole).filter(UserRole.user_id == user.id).all()
        roles = [{"id": str(ur.role.id), "name": ur.role.name} for ur in user_roles]
        
        # Create access token
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username
        }
        access_token = create_access_token(data=token_data)
        
        # Prepare user information
        user_info = {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "status": user.status.value,
            "roles": roles
        }
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_info
        )
    
    @staticmethod
    def _generate_otp() -> str:
        """Generate a 6-digit OTP code"""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def forgot_password(forgot_data: ForgotPasswordRequest, db: Session) -> ForgotPasswordResponse:
        """
        Send password reset OTP to user's email
        
        Args:
            forgot_data: Email address for password reset
            db: Database session
            
        Returns:
            ForgotPasswordResponse with confirmation message
            
        Raises:
            HTTPException: If user not found
        """
        # Find user by email
        user = db.query(User).filter(User.email == forgot_data.email).first()
        
        # For security, don't reveal if email exists or not
        # But we still need to check if user exists to avoid errors
        if not user:
            # Return success message even if user doesn't exist (security best practice)
            return ForgotPasswordResponse(
                message="If an account with that email exists, a password reset code has been sent.",
                email=forgot_data.email
            )
        
        # Generate 6-digit OTP
        otp_code = AuthService._generate_otp()
        
        # Set OTP and expiration (5 minutes from now)
        user.reset_otp = otp_code
        user.reset_otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
        db.commit()
        
        # Send email with OTP
        email_sent = send_password_reset_email(user.email, otp_code)
        
        if not email_sent:
            # If email fails, still return success (security best practice)
            # Log the error for admin review
            print(f"Failed to send password reset email to {user.email}")
        
        return ForgotPasswordResponse(
            message="If an account with that email exists, a password reset code has been sent.",
            email=forgot_data.email
        )
    
    @staticmethod
    def reset_password(reset_data: ResetPasswordRequest, db: Session) -> ResetPasswordResponse:
        """
        Reset user password using OTP code
        
        Args:
            reset_data: Email, OTP code, and new password
            db: Database session
            
        Returns:
            ResetPasswordResponse with success message
            
        Raises:
            HTTPException: If OTP is invalid, expired, or user not found
        """
        # Find user by email
        user = db.query(User).filter(User.email == reset_data.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if OTP exists
        if not user.reset_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No password reset request found. Please request a new code."
            )
        
        # Check if OTP is expired
        if user.reset_otp_expires_at and user.reset_otp_expires_at < datetime.utcnow():
            # Clear expired OTP
            user.reset_otp = None
            user.reset_otp_expires_at = None
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP code has expired. Please request a new code."
            )
        
        # Verify OTP code
        if user.reset_otp != reset_data.otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code. Please try again."
            )
        
        # Reset password
        user.password_hash = hash_password(reset_data.new_password)
        user.reset_otp = None
        user.reset_otp_expires_at = None
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return ResetPasswordResponse(
            message="Password has been reset successfully. You can now login with your new password."
        )
    
    @staticmethod
    def verify_email(verify_data: VerifyEmailRequest, db: Session) -> VerifyEmailResponse:
        """
        Verify user email using OTP code
        
        Args:
            verify_data: Email and OTP code
            db: Database session
            
        Returns:
            VerifyEmailResponse with success message
            
        Raises:
            HTTPException: If OTP is invalid, expired, or user not found
        """
        # Find user by email
        user = db.query(User).filter(User.email == verify_data.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if email is already verified
        if not user.verfication_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already verified"
            )
        
        # Verify OTP code
        if user.verfication_otp != verify_data.otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code. Please try again."
            )
        
        # Clear verification OTP (email is now verified)
        user.verfication_otp = None
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return VerifyEmailResponse(
            message="Email has been verified successfully. You can now login to your account."
        )
    
    @staticmethod
    def resend_verification(resend_data: ResendVerificationRequest, db: Session) -> ResendVerificationResponse:
        """
        Resend email verification OTP to user's email
        
        Args:
            resend_data: Email address for verification
            db: Database session
            
        Returns:
            ResendVerificationResponse with confirmation message
            
        Raises:
            HTTPException: If user not found or email already verified
        """
        # Find user by email
        user = db.query(User).filter(User.email == resend_data.email).first()
        
        if not user:
            # Return success message even if user doesn't exist (security best practice)
            return ResendVerificationResponse(
                message="If an account with that email exists and is not verified, a verification code has been sent.",
                email=resend_data.email
            )
        
        # Check if email is already verified
        if not user.verfication_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already verified"
            )
        
        # Generate new verification OTP
        otp_code = AuthService._generate_otp()
        
        # Set new OTP
        user.verfication_otp = otp_code
        user.updated_at = datetime.utcnow()
        db.commit()
        
        # Send email with OTP
        email_sent = send_verification_email(user.email, otp_code)
        
        if not email_sent:
            # If email fails, still return success (security best practice)
            # Log the error for admin review
            print(f"Failed to send verification email to {user.email}")
        
        return ResendVerificationResponse(
            message="If an account with that email exists and is not verified, a verification code has been sent.",
            email=resend_data.email
        )
