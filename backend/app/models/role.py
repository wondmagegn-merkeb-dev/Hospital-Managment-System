from sqlalchemy import Column, String, DateTime, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from app.database import Base
import uuid


class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    permissions = Column(JSONB, nullable=True, server_default=text("'{}'::jsonb"))
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    users = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")
