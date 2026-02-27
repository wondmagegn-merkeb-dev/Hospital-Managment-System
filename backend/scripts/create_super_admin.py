#!/usr/bin/env python3
"""
Create a super_admin user. Run from backend directory:
    python scripts/create_super_admin.py --email admin@example.com --username superadmin --password YourSecurePass123

Or with env vars (for CI/non-interactive):
    SUPER_ADMIN_EMAIL=admin@example.com SUPER_ADMIN_USERNAME=superadmin SUPER_ADMIN_PASSWORD=xxx python scripts/create_super_admin.py
"""
import argparse
import os
import sys

# Add backend to path so app imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.db_setup import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.role import Role
from app.utils.password import hash_password
from app.config.constants import SUPER_ADMIN_ROLE_NAME


def create_super_admin_user(
    email: str,
    username: str,
    password: str,
    full_name: str | None = None,
) -> User:
    """Create a user with super_admin role. Returns the created user."""
    db = SessionLocal()
    try:
        # Check if super_admin role exists
        super_admin_role = db.query(Role).filter(Role.name == SUPER_ADMIN_ROLE_NAME).first()
        if not super_admin_role:
            raise SystemExit("Error: super_admin role not found. Run 'alembic upgrade head' first.")

        # Check if user already exists
        existing = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()
        if existing:
            raise SystemExit(
                f"Error: User with email '{email}' or username '{username}' already exists."
            )

        # Create user - verified and not first login so they can log in immediately
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            full_name=full_name or username,
            status=UserStatus.ACTIVE,
            is_verified=True,
            is_first_login=False,
            is_password_changed=True,
        )
        db.add(user)
        db.flush()

        # Assign super_admin role
        user_role = UserRole(user_id=user.id, role_id=super_admin_role.id)
        db.add(user_role)

        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(
        description="Create a super_admin user (run from backend directory)"
    )
    parser.add_argument(
        "--email",
        default=os.getenv("SUPER_ADMIN_EMAIL"),
        required=not os.getenv("SUPER_ADMIN_EMAIL"),
        help="Email for the super_admin user (or set SUPER_ADMIN_EMAIL env var)",
    )
    parser.add_argument(
        "--username",
        default=os.getenv("SUPER_ADMIN_USERNAME"),
        required=not os.getenv("SUPER_ADMIN_USERNAME"),
        help="Username for the super_admin user (or set SUPER_ADMIN_USERNAME env var)",
    )
    parser.add_argument(
        "--password",
        default=os.getenv("SUPER_ADMIN_PASSWORD"),
        required=not os.getenv("SUPER_ADMIN_PASSWORD"),
        help="Password for the super_admin user (or set SUPER_ADMIN_PASSWORD env var)",
    )
    parser.add_argument(
        "--full-name",
        default=os.getenv("SUPER_ADMIN_FULL_NAME"),
        help="Full name (optional)",
    )
    args = parser.parse_args()

    if len(args.password) < 6:
        print("Error: Password must be at least 6 characters.")
        sys.exit(1)

    try:
        user = create_super_admin_user(
            email=args.email,
            username=args.username,
            password=args.password,
            full_name=args.full_name or None,
        )
        print("Super admin user created successfully!")
        print(f"  Email:    {user.email}")
        print(f"  Username: {user.username}")
        print(f"  Full name: {user.full_name or '-'}")
        print("\nYou can now log in with these credentials.")
    except SystemExit as e:
        print(str(e))
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
