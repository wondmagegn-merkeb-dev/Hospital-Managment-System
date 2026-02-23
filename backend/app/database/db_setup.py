from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from typing import Generator
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables from .env file
load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "MNSizone@789")  # raw password
DB_HOST = os.getenv("DB_HOST", "93.127.203.106")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "izone_hospital")

encode_password = quote_plus(DB_PASSWORD)  # Encode special characters in password

DATABASE_URL =f"postgresql://{DB_USER}:{encode_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
