# Backend Scripts

## Create Super Admin User

Creates a new user with the `super_admin` role. This user has full access to all features.

**Prerequisites:** Run migrations first (`alembic upgrade head`) so the `super_admin` role exists.

### Usage

From the `backend` directory:

```bash
# With command-line arguments (use a real email domain, e.g. gmail.com, yourdomain.com)
python scripts/create_super_admin.py \
  --email admin@yourdomain.com \
  --username superadmin \
  --password YourSecurePassword123

# With optional full name
python scripts/create_super_admin.py \
  --email admin@yourdomain.com \
  --username superadmin \
  --password YourSecurePassword123 \
  --full-name "System Administrator"
```

### Environment Variables (for CI/non-interactive)

```bash
export SUPER_ADMIN_EMAIL=admin@yourdomain.com
export SUPER_ADMIN_USERNAME=superadmin
export SUPER_ADMIN_PASSWORD=YourSecurePassword123
python scripts/create_super_admin.py
```

### Notes

- Password must be at least 6 characters
- The user is created with `is_verified=True` and `is_first_login=False` so they can log in immediately
- If a user with the same email or username exists, the script will exit with an error
