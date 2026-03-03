"""create patient management tables

Revision ID: e_create_patient_tables
Revises: d_seed_super_admin
Create Date: 2026-03-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e_create_patient_tables'
down_revision: Union[str, Sequence[str], None] = 'd_seed_super_admin'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create Gender enum (check if it exists first)
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender')"))
    enum_exists = result.scalar()
    
    if not enum_exists:
        gender_enum = sa.Enum('Male', 'Female', 'Other', name='gender')
        gender_enum.create(conn)
        gender_type = gender_enum
    else:
        # Use existing enum type
        gender_type = postgresql.ENUM('Male', 'Female', 'Other', name='gender', create_type=False)
    
    # Create patients table
    op.create_table('patients',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_code', sa.String(length=30), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('middle_name', sa.String(length=100), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),  # Using String instead of Enum to match model
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('blood_group', sa.String(length=10), nullable=True),
        sa.Column('marital_status', sa.String(length=20), nullable=True),
        sa.Column('nationality', sa.String(length=100), nullable=True),
        sa.Column('national_id', sa.String(length=50), nullable=True),
        sa.Column('passport_number', sa.String(length=50), nullable=True),
        sa.Column('email', sa.String(length=150), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('postal_code', sa.String(length=20), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('registered_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for patients
    op.create_index('idx_patient_code', 'patients', ['patient_code'], unique=True)
    op.create_index('idx_patient_name', 'patients', ['first_name', 'last_name'], unique=False)
    op.create_index('idx_patient_phone', 'patients', ['phone'], unique=False)
    op.create_index(op.f('ix_patients_id'), 'patients', ['id'], unique=False)
    
    # Create patient_emergency_contacts table
    op.create_table('patient_emergency_contacts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contact_name', sa.String(length=150), nullable=False),
        sa.Column('contact_relationship', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patient_emergency_contacts_id'), 'patient_emergency_contacts', ['id'], unique=False)
    op.create_index('idx_emergency_contact_patient', 'patient_emergency_contacts', ['patient_id'], unique=False)
    
    # Create patient_insurances table
    op.create_table('patient_insurances',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('provider_name', sa.String(length=150), nullable=False),
        sa.Column('policy_number', sa.String(length=100), nullable=False),
        sa.Column('coverage_percentage', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('coverage_limit', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('valid_from', sa.Date(), nullable=True),
        sa.Column('valid_to', sa.Date(), nullable=True),
        sa.Column('is_primary', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patient_insurances_id'), 'patient_insurances', ['id'], unique=False)
    op.create_index('idx_patient_insurance_patient', 'patient_insurances', ['patient_id'], unique=False)
    
    # Create unique partial index for one primary insurance per patient
    op.execute("""
        CREATE UNIQUE INDEX one_primary_insurance 
        ON patient_insurances(patient_id) 
        WHERE is_primary = TRUE
    """)
    
    # Create patient_documents table
    op.create_table('patient_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_type', sa.String(length=100), nullable=True),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('uploaded_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patient_documents_id'), 'patient_documents', ['id'], unique=False)
    op.create_index('idx_patient_document_patient', 'patient_documents', ['patient_id'], unique=False)
    
    # Create patient_status_history table
    op.create_table('patient_status_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('changed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['changed_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patient_status_history_id'), 'patient_status_history', ['id'], unique=False)
    op.create_index('idx_patient_status_patient', 'patient_status_history', ['patient_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index('idx_patient_status_patient', table_name='patient_status_history')
    op.drop_index(op.f('ix_patient_status_history_id'), table_name='patient_status_history')
    op.drop_table('patient_status_history')
    
    op.drop_index('idx_patient_document_patient', table_name='patient_documents')
    op.drop_index(op.f('ix_patient_documents_id'), table_name='patient_documents')
    op.drop_table('patient_documents')
    
    op.execute('DROP INDEX IF EXISTS one_primary_insurance')
    op.drop_index('idx_patient_insurance_patient', table_name='patient_insurances')
    op.drop_index(op.f('ix_patient_insurances_id'), table_name='patient_insurances')
    op.drop_table('patient_insurances')
    
    op.drop_index('idx_emergency_contact_patient', table_name='patient_emergency_contacts')
    op.drop_index(op.f('ix_patient_emergency_contacts_id'), table_name='patient_emergency_contacts')
    op.drop_table('patient_emergency_contacts')
    
    op.drop_index(op.f('ix_patients_id'), table_name='patients')
    op.drop_index('idx_patient_phone', table_name='patients')
    op.drop_index('idx_patient_name', table_name='patients')
    op.drop_index('idx_patient_code', table_name='patients')
    op.drop_table('patients')
    
    # Drop enum
    sa.Enum(name='gender').drop(op.get_bind(), checkfirst=True)
