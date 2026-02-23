import re
from typing import Optional, Tuple, Dict, List


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


def validate_role_description(description: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Validate role description format
    
    Args:
        description: Role description to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if description is None:
        return True, None  # Description is optional
    
    if len(description) > 255:
        return False, "Description must be less than 255 characters"
    
    return True, None


def validate_permissions(permissions: Optional[Dict[str, List[str]]]) -> Tuple[bool, Optional[str]]:
    """
    Validate permissions structure
    
    Args:
        permissions: Permissions dictionary to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if permissions is None:
        return True, None  # Permissions are optional
    
    if not isinstance(permissions, dict):
        return False, "Permissions must be a dictionary"
    
    # Validate each permission entry
    for resource, actions in permissions.items():
        # Validate resource name
        if not isinstance(resource, str):
            return False, "Resource names must be strings"
        
        if len(resource) == 0:
            return False, "Resource names cannot be empty"
        
        if len(resource) > 100:
            return False, "Resource names must be less than 100 characters"
        
        # Validate actions list
        if not isinstance(actions, list):
            return False, f"Actions for resource '{resource}' must be a list"
        
        # Validate each action
        for action in actions:
            if not isinstance(action, str):
                return False, f"Actions must be strings for resource '{resource}'"
            
            if len(action) == 0:
                return False, f"Actions cannot be empty for resource '{resource}'"
            
            if len(action) > 50:
                return False, f"Actions must be less than 50 characters for resource '{resource}'"
            
            # Validate action format (should be lowercase, alphanumeric with underscores)
            if not re.match(r'^[a-z0-9_]+$', action):
                return False, f"Action '{action}' for resource '{resource}' can only contain lowercase letters, numbers, and underscores"
    
    return True, None


def validate_role_data(name: str, description: Optional[str] = None, permissions: Optional[Dict[str, List[str]]] = None) -> Tuple[bool, Optional[str]]:
    """
    Validate complete role data
    
    Args:
        name: Role name
        description: Role description (optional)
        permissions: Permissions dictionary (optional)
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate name
    is_valid, error = validate_role_name(name)
    if not is_valid:
        return False, error
    
    # Validate description
    is_valid, error = validate_role_description(description)
    if not is_valid:
        return False, error
    
    # Validate permissions
    is_valid, error = validate_permissions(permissions)
    if not is_valid:
        return False, error
    
    return True, None
