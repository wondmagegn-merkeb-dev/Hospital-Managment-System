from logging.config import fileConfig
import os
from dotenv import load_dotenv
from pathlib import Path
import sys
from urllib.parse import quote_plus

from sqlalchemy import create_engine, pool
from alembic import context

# Load environment variables
load_dotenv()

# Add parent directory to path so imports work
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.models.user import User, UserRole
from app.models.role import Role

# Target metadata for 'autogenerate'
target_metadata = Base.metadata

# Build database URL with encoded password
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD", "MNSizone@789"))  # encode special chars
DB_HOST = os.getenv("DB_HOST", "93.127.203.106")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "izone_hospital")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Setup logging
if context.config.config_file_name is not None:
    fileConfig(context.config.config_file_name)

# ---------------- Offline migrations ----------------
def run_migrations_offline() -> None:
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------- Online migrations ----------------
def run_migrations_online() -> None:
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


# Run offline or online depending on mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
