# API Surface

The core router exposes standard CRUD operations for:
- categories
- suppliers
- warehouses
- products
- customers
- inventory
- stock-movements
- orders
- order-items
- payments
- shipments
- audit-events

Additional actions include:
- product stock lookup
- inventory low-stock report
- order confirmation
- order cancellation
- JWT token and refresh
- user profile
- user listing

The OpenAPI schema at `/api/schema/` is the source of truth for the generated API contract.
