"""seed super_admin role

Revision ID: d_seed_super_admin
Revises: b758ad27b1bb
Create Date: 2026-02-27

"""
from typing import Sequence, Union
import json

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd_seed_super_admin'
down_revision: Union[str, Sequence[str], None] = 'b758ad27b1bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Fixed UUID for super_admin role - never created via frontend
SUPER_ADMIN_ROLE_ID = '00000000-0000-0000-0000-000000000001'

# All permissions: supports both "read"/"view" for compatibility
ALL_PERMISSIONS = {
    "user": ["create", "update", "delete", "read", "view"],
    "role": ["create", "update", "delete", "read", "view"],
    "patient": ["create", "update", "delete", "read", "view"],
    "appointment": ["create", "update", "delete", "read", "view"],
    "medicine": ["create", "update", "delete", "read", "view"],
}


def upgrade() -> None:
    """Insert super_admin role if it does not exist."""
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT id FROM roles WHERE name = 'super_admin'"))
    if result.fetchone() is None:
        conn.execute(
            sa.text("""
                INSERT INTO roles (id, name, permissions, description, created_at, updated_at)
                VALUES (:id, 'super_admin', CAST(:permissions AS jsonb),
                    'System role with full access. Cannot be created, edited, or deleted via UI.',
                    now(), now())
            """),
            {"id": SUPER_ADMIN_ROLE_ID, "permissions": json.dumps(ALL_PERMISSIONS)},
        )


def downgrade() -> None:
    """Remove super_admin role."""
    op.execute(sa.text("DELETE FROM roles WHERE name = 'super_admin'"))
