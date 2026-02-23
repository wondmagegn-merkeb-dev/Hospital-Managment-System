from pydantic import field_validator
from typing import Any
from .user_validators import (
    validate_password_strength,
    validate_email_format,
    validate_username
)
from .role_validators import validate_role_name
from .auth_validators import validate_otp_code


class PydanticValidators:
    """Pydantic field validators for use in Pydantic models"""
    
    @staticmethod
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        is_valid, error_message = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_message)
        return v
    
    @staticmethod
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format"""
        is_valid, error_message = validate_email_format(v)
        if not is_valid:
            raise ValueError(error_message)
        return v
    
    @staticmethod
    @field_validator('username')
    @classmethod
    def validate_username_field(cls, v: str) -> str:
        """Validate username format"""
        is_valid, error_message = validate_username(v)
        if not is_valid:
            raise ValueError(error_message)
        return v
    
    @staticmethod
    @field_validator('otp_code')
    @classmethod
    def validate_otp(cls, v: str) -> str:
        """Validate OTP code format"""
        is_valid, error_message = validate_otp_code(v)
        if not is_valid:
            raise ValueError(error_message)
        return v
    
    @staticmethod
    @field_validator('name')
    @classmethod
    def validate_role_name_field(cls, v: str) -> str:
        """Validate role name format"""
        is_valid, error_message = validate_role_name(v)
        if not is_valid:
            raise ValueError(error_message)
        return v
