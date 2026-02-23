import re
from typing import Optional, Tuple, List
from uuid import UUID


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


def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
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


def validate_full_name(full_name: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Validate full name format
    
    Args:
        full_name: Full name to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if full_name is None:
        return True, None  # Full name is optional
    
    if len(full_name) > 150:
        return False, "Full name must be less than 150 characters"
    
    # Full name should contain only letters, spaces, hyphens, and apostrophes
    if not re.match(r'^[a-zA-Z\s\'-]+$', full_name):
        return False, "Full name can only contain letters, spaces, hyphens, and apostrophes"
    
    return True, None


def validate_user_status(status: str) -> Tuple[bool, Optional[str]]:
    """
    Validate user status
    
    Args:
        status: User status to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_statuses = ["active", "inactive", "suspended"]
    
    if status not in valid_statuses:
        return False, f"Status must be one of: {', '.join(valid_statuses)}"
    
    return True, None


def validate_role_ids(role_ids: Optional[List[UUID]]) -> Tuple[bool, Optional[str]]:
    """
    Validate role IDs list
    
    Args:
        role_ids: List of role UUIDs to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if role_ids is None:
        return True, None  # Role IDs are optional
    
    if not isinstance(role_ids, list):
        return False, "Role IDs must be a list"
    
    if len(role_ids) == 0:
        return True, None  # Empty list is valid
    
    # Check if all items are valid UUIDs
    for role_id in role_ids:
        if not isinstance(role_id, UUID):
            return False, "All role IDs must be valid UUIDs"
    
    return True, None
