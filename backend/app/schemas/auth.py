from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")


class LoginResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: dict = Field(..., description="User information")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")


class ForgotPasswordResponse(BaseModel):
    message: str = Field(..., description="Response message")
    email: str = Field(..., description="Email where OTP was sent")


class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")
    new_password: str = Field(..., min_length=6, description="New password")


class ResetPasswordResponse(BaseModel):
    message: str = Field(..., description="Response message")


class VerifyEmailRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")


class VerifyEmailResponse(BaseModel):
    message: str = Field(..., description="Response message")


class ResendVerificationRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")


class ResendVerificationResponse(BaseModel):
    message: str = Field(..., description="Response message")
    email: str = Field(..., description="Email where verification code was sent")
