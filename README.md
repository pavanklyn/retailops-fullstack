# RetailOps — Full-Stack Python Inventory & Order Management Platform

A production-style Django REST Framework application for managing products, warehouses,
inventory, suppliers, customers, orders, payments, shipments, and audit events.

## Tech Stack
- Python 3.12
- Django 5.2
- Django REST Framework
- PostgreSQL 16
- SimpleJWT
- pytest + pytest-django
- Docker + Docker Compose
- drf-spectacular / OpenAPI
- CORS support
- Gunicorn

## Highlights
- JWT authentication with refresh tokens
- Role-aware user model (ADMIN, MANAGER, STAFF)
- 14 normalized PostgreSQL entities
- CRUD REST APIs with filtering, pagination and search
- Inventory stock movement tracking
- Order lifecycle and payment/shipping records
- Audit trail
- Dockerized development environment
- Automated API test suite
- OpenAPI documentation

## Quick Start — Docker

```powershell
docker compose up --build
```

API:
http://localhost:8000/api/

Swagger:
http://localhost:8000/api/docs/

Admin:
http://localhost:8000/admin/

## Local Setup

```powershell
python -m venv .venv
.venv\Scriptsctivate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Run tests:

```powershell
pytest -q
pytest --cov=apps --cov-report=term-missing
```

## Demo Credentials

After `python manage.py seed_demo`:

- admin@example.com / Admin@123
- manager@example.com / Manager@123
- staff@example.com / Staff@123

## Resume Positioning

Suggested project title:

**Full-Stack Python Web Application | Django, PostgreSQL, REST APIs, Docker, pytest**

Suggested bullets:

- Architected a Django REST inventory and order-management platform with JWT authentication,
  normalized PostgreSQL data models, filtering, pagination, audit logging and role-based access.
- Containerized the application with Docker Compose, reducing environment setup from a
  multi-step manual process to a reproducible single-command workflow.
- Built a comprehensive pytest suite covering authentication, CRUD APIs, inventory,
  orders, permissions and edge cases, with 85%+ coverage target.
- Designed 14 relational entities with transactional stock updates and indexed query paths.

Note: Do not claim an exact coverage percentage until you run `pytest --cov=apps`
and verify the number locally.
