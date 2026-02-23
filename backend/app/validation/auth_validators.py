import re
from typing import Optional, Tuple
from .user_validators import validate_email_format, validate_password_strength


def validate_otp_code(otp_code: str) -> Tuple[bool, Optional[str]]:
    """
    Validate OTP code format
    
    Args:
        otp_code: OTP code to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not otp_code:
        return False, "OTP code is required"
    
    if len(otp_code) != 6:
        return False, "OTP code must be exactly 6 digits"
    
    if not otp_code.isdigit():
        return False, "OTP code must contain only digits"
    
    return True, None


def validate_login_credentials(email: str, password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate login credentials
    
    Args:
        email: Email address
        password: Password
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate email
    is_valid, error = validate_email_format(email)
    if not is_valid:
        return False, error
    
    # Validate password
    is_valid, error = validate_password_strength(password)
    if not is_valid:
        return False, error
    
    return True, None


def validate_forgot_password_request(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate forgot password request
    
    Args:
        email: Email address
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate email
    is_valid, error = validate_email_format(email)
    if not is_valid:
        return False, error
    
    return True, None


def validate_reset_password_request(email: str, otp_code: str, new_password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate reset password request
    
    Args:
        email: Email address
        otp_code: OTP code
        new_password: New password
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate email
    is_valid, error = validate_email_format(email)
    if not is_valid:
        return False, error
    
    # Validate OTP code
    is_valid, error = validate_otp_code(otp_code)
    if not is_valid:
        return False, error
    
    # Validate new password
    is_valid, error = validate_password_strength(new_password)
    if not is_valid:
        return False, error
    
    return True, None


def validate_verify_email_request(email: str, otp_code: str) -> Tuple[bool, Optional[str]]:
    """
    Validate verify email request
    
    Args:
        email: Email address
        otp_code: OTP code
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate email
    is_valid, error = validate_email_format(email)
    if not is_valid:
        return False, error
    
    # Validate OTP code
    is_valid, error = validate_otp_code(otp_code)
    if not is_valid:
        return False, error
    
    return True, None


def validate_resend_verification_request(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate resend verification request
    
    Args:
        email: Email address
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate email
    is_valid, error = validate_email_format(email)
    if not is_valid:
        return False, error
    
    return True, None
