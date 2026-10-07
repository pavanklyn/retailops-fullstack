from rest_framework.routers import DefaultRouter
from .views import *

router=DefaultRouter()
router.register("categories",CategoryViewSet)
router.register("suppliers",SupplierViewSet)
router.register("warehouses",WarehouseViewSet)
router.register("products",ProductViewSet)
router.register("customers",CustomerViewSet)
router.register("inventory",InventoryViewSet)
router.register("stock-movements",StockMovementViewSet)
router.register("orders",OrderViewSet)
router.register("order-items",OrderItemViewSet)
router.register("payments",PaymentViewSet)
router.register("shipments",ShipmentViewSet)
router.register("audit-events",AuditEventViewSet)

urlpatterns=router.urls
