#!/bin/sh
set -e

echo "Running database migrations..."
python manage.py migrate

echo "Ensuring admin user exists..."

python manage.py shell <<'PY'
import os
from apps.accounts.models import User

username = os.environ.get("ADMIN_USERNAME")
password = os.environ.get("ADMIN_PASSWORD")

if not username or not password:
    print("ADMIN_USERNAME or ADMIN_PASSWORD is not configured.")
else:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": username,
            "is_active": True,
            "is_staff": True,
            "is_superuser": True,
        },
    )

    user.set_password(password)
    user.is_active = True
    user.is_staff = True
    user.is_superuser = True
    user.save()

    if created:
        print("Admin user created successfully.")
    else:
        print("Admin user already exists and password was updated.")
PY

echo "Starting Gunicorn..."

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3