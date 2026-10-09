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

echo "Seeding demo data..."

python manage.py shell <<'PY'
from decimal import Decimal
from apps.core.models import (
    Category,
    Supplier,
    Warehouse,
    Product,
    Customer,
    Inventory,
)
    
# Category
category, _ = Category.objects.get_or_create(
    name="Electronics",
    defaults={
        "description": "Consumer electronics and accessories"
    },
)

# Supplier
supplier, _ = Supplier.objects.get_or_create(
    name="Demo Supplier",
    defaults={
        "email": "supplier@retailops.com",
        "phone": "9000000000",
    },
)

# Warehouse
warehouse, _ = Warehouse.objects.get_or_create(
    code="WH-MAIN",
    defaults={
        "name": "Main Warehouse",
        "address": "Vijayawada, Andhra Pradesh",
        "active": True,
    },
)

# 50 Products + Inventory
for i in range(1, 51):
    product, _ = Product.objects.get_or_create(
        sku=f"SKU-{i:04d}",
        defaults={
            "name": f"Demo Product {i}",
            "category": category,
            "supplier": supplier,
            "price": Decimal("1499.00") + (i * Decimal("100.00")),
            "cost_price": Decimal("999.00") + (i * Decimal("50.00")),
            "reorder_level": 10,
            "active": True,
        },
    )

    Inventory.objects.get_or_create(
        product=product,
        warehouse=warehouse,
        defaults={
            "quantity": 100,
            "reserved": 0,
        },
    )

# Demo Customer
customer, _ = Customer.objects.get_or_create(
    email="customer@retailops.com",
    defaults={
        "name": "Demo Customer",
        "phone": "9000000001",
        "address": "Vijayawada, Andhra Pradesh",
    },
)

print("Demo data seeding completed.")
print(f"Products: {Product.objects.count()}")
print(f"Inventory records: {Inventory.objects.count()}")
print(f"Customers: {Customer.objects.count()}")
print(f"Categories: {Category.objects.count()}")
print(f"Suppliers: {Supplier.objects.count()}")
print(f"Warehouses: {Warehouse.objects.count()}")
PY

echo "Starting Gunicorn..."

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3