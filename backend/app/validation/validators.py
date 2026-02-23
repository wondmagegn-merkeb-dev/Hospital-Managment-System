import re
from typing import Optional, Tuple
from pydantic import field_validator, ValidationError


def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    if len(password) > 128:
        return False, "Password must be less than 128 characters"
    
    # Check for at least one letter and one number (optional enhancement)
    # has_letter = re.search(r'[a-zA-Z]', password)
    # has_number = re.search(r'[0-9]', password)
    # if not (has_letter and has_number):
    #     return False, "Password must contain at least one letter and one number"
    
    return True, None


def validate_email_format(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email format
    
    Args:
        email: Email to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email:
        return False, "Email is required"
    
    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    if len(email) > 100:
        return False, "Email must be less than 100 characters"
    
    return True, None


def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """
    Validate username format
    
    Args:
        username: Username to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not username:
        return False, "Username is required"
    
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    
    if len(username) > 50:
        return False, "Username must be less than 50 characters"
    
    # Username should only contain alphanumeric characters, underscores, and hyphens
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"
    
    # Username should start with a letter or number
    if not re.match(r'^[a-zA-Z0-9]', username):
        return False, "Username must start with a letter or number"
    
    return True, None


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


def validate_uuid_format(uuid_string: str) -> Tuple[bool, Optional[str]]:
    """
    Validate UUID format
    
    Args:
        uuid_string: UUID string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not uuid_string:
        return False, "UUID is required"
    
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    
    if not re.match(uuid_pattern, uuid_string.lower()):
        return False, "Invalid UUID format"
    
    return True, None


def validate_role_name(role_name: str) -> Tuple[bool, Optional[str]]:
    """
    Validate role name format
    
    Args:
        role_name: Role name to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not role_name:
        return False, "Role name is required"
    
    if len(role_name) < 1:
        return False, "Role name cannot be empty"
    
    if len(role_name) > 50:
        return False, "Role name must be less than 50 characters"
    
    # Role name should only contain alphanumeric characters, spaces, underscores, and hyphens
    if not re.match(r'^[a-zA-Z0-9\s_-]+$', role_name):
        return False, "Role name can only contain letters, numbers, spaces, underscores, and hyphens"
    
    return True, None
