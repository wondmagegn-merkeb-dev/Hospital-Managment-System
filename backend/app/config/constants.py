"""Application constants."""

# System role - created only by migration, never via frontend
SUPER_ADMIN_ROLE_NAME = "super_admin"

# All resources and actions for super_admin
ALL_PERMISSIONS = {
    "user": ["create", "update", "delete", "read", "view"],
    "role": ["create", "update", "delete", "read", "view"],
    "patient": ["create", "update", "delete", "read", "view"],
    "appointment": ["create", "update", "delete", "read", "view"],
    "medicine": ["create", "update", "delete", "read", "view"],
}
