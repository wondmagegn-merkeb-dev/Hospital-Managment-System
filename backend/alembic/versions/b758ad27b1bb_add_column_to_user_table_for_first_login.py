"""add column to user table for first login 

Revision ID: b758ad27b1bb
Revises: c_add_is_verified
Create Date: 2026-02-27 11:34:16.380307

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b758ad27b1bb'
down_revision: Union[str, Sequence[str], None] = 'c_add_is_verified'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 🔐 Add new columns with safe defaults for existing users
    op.add_column(
        'users',
        sa.Column('is_first_login', sa.Boolean(), nullable=False, server_default=sa.text('true'))
    )
    op.add_column(
        'users',
        sa.Column('is_password_changed', sa.Boolean(), nullable=False, server_default=sa.text('false'))
    )

    # 🧹 Remove server defaults after backfilling old rows (clean schema)
    op.alter_column('users', 'is_first_login', server_default=None)
    op.alter_column('users', 'is_password_changed', server_default=None)

    # 🗑️ Apply your deletes AFTER safe columns are added
    op.drop_column('roles', 'deleted_at')
    op.drop_column('users', 'deleted_at')


def downgrade() -> None:
    # 🔙 Restore deleted columns
    op.add_column(
        'users',
        sa.Column('deleted_at', postgresql.TIMESTAMP(timezone=True), nullable=True)
    )
    op.add_column(
        'roles',
        sa.Column('deleted_at', postgresql.TIMESTAMP(timezone=True), nullable=True)
    )

    # 🔻 Drop new columns
    op.drop_column('users', 'is_password_changed')
    op.drop_column('users', 'is_first_login')