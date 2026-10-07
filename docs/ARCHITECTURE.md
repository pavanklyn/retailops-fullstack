# Architecture

Client / Browser
      |
      v
Django REST Framework
      |
      +-- JWT Authentication
      +-- Filtering / Search / Pagination
      +-- Business Actions
      |
      v
PostgreSQL
      |
      +-- Products / Categories / Suppliers
      +-- Warehouses / Inventory / Stock Movements
      +-- Customers / Orders / Payments / Shipments
      +-- Audit Events

Docker Compose provides reproducible application + PostgreSQL services.
