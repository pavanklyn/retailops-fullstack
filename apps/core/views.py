from django.db import models, transaction
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Category,
    Supplier,
    Warehouse,
    Product,
    Customer,
    Inventory,
    StockMovement,
    OrderItem,
    Order,
    Payment,
    Shipment,
    AuditEvent,
)

from .serializers import (
    CategorySerializer,
    SupplierSerializer,
    WarehouseSerializer,
    ProductSerializer,
    CustomerSerializer,
    InventorySerializer,
    StockMovementSerializer,
    OrderItemSerializer,
    OrderSerializer,
    PaymentSerializer,
    ShipmentSerializer,
    AuditEventSerializer,
)


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]


class CategoryViewSet(BaseViewSet):
    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer
    filterset_fields = ["name"]


class SupplierViewSet(BaseViewSet):
    queryset = Supplier.objects.all().order_by("id")
    serializer_class = SupplierSerializer
    filterset_fields = ["name", "email"]


class WarehouseViewSet(BaseViewSet):
    queryset = Warehouse.objects.all().order_by("id")
    serializer_class = WarehouseSerializer
    filterset_fields = ["name", "code", "active"]


class ProductViewSet(BaseViewSet):
    queryset = Product.objects.select_related(
        "category",
        "supplier",
    ).all().order_by("id")

    serializer_class = ProductSerializer

    filterset_fields = [
        "sku",
        "name",
        "category",
        "supplier",
        "active",
    ]

    @action(detail=True, methods=["get"])
    def stock(self, request):
        product = self.get_object()

        inventory = (
            Inventory.objects
            .select_related("warehouse", "product")
            .filter(product=product)
            .order_by("warehouse_id")
        )

        serializer = InventorySerializer(
            inventory,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)


class CustomerViewSet(BaseViewSet):
    queryset = Customer.objects.all().order_by("id")
    serializer_class = CustomerSerializer
    filterset_fields = ["name", "email"]


class InventoryViewSet(BaseViewSet):
    queryset = Inventory.objects.select_related(
        "product",
        "warehouse",
    ).all().order_by("id")

    serializer_class = InventorySerializer

    filterset_fields = [
        "product",
        "warehouse",
    ]

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        inventory = (
            Inventory.objects
            .select_related("product", "warehouse")
            .filter(
                quantity__lte=models.F("product__reorder_level")
            )
            .order_by("quantity")
        )

        serializer = InventorySerializer(
            inventory,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)


class StockMovementViewSet(BaseViewSet):
    queryset = StockMovement.objects.select_related(
        "product",
        "warehouse",
        "created_by",
    ).all().order_by("-id")

    serializer_class = StockMovementSerializer

    filterset_fields = [
        "product",
        "warehouse",
        "movement_type",
    ]

    def perform_create(self, serializer):
        with transaction.atomic():
            movement_type = serializer.validated_data["movement_type"]
            quantity = serializer.validated_data["quantity"]
            product = serializer.validated_data["product"]
            warehouse = serializer.validated_data["warehouse"]

            if quantity <= 0:
                raise serializers.ValidationError(
                    {
                        "quantity": "Quantity must be greater than 0."
                    }
                )

            inventory, _ = (
                Inventory.objects
                .select_for_update()
                .get_or_create(
                    product=product,
                    warehouse=warehouse,
                    defaults={"quantity": 0},
                )
            )

            if movement_type == "OUT":
                if quantity > inventory.quantity:
                    raise serializers.ValidationError(
                        {
                            "quantity": (
                                f"Insufficient stock. "
                                f"Available stock: {inventory.quantity}, "
                                f"requested: {quantity}."
                            )
                        }
                    )

                inventory.quantity -= quantity

            elif movement_type == "IN":
                inventory.quantity += quantity

            elif movement_type == "ADJUST":
                inventory.quantity = quantity

            serializer.save(created_by=self.request.user)

            inventory.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )


class OrderViewSet(BaseViewSet):
    queryset = Order.objects.select_related(
        "customer",
    ).prefetch_related(
        "items",
    ).all().order_by("-id")

    serializer_class = OrderSerializer

    filterset_fields = [
        "customer",
        "status",
    ]

    @action(detail=True, methods=["post"])
    def confirm(self, _request):
        order = self.get_object()

        if order.status != "PENDING":
            return Response(
                {
                    "detail": (
                        "Only pending orders can be confirmed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "CONFIRMED"
        order.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "detail": "Order confirmed successfully.",
                "status": order.status,
            }
        )

    @action(detail=True, methods=["post"])
    def cancel(self, _request):
        order = self.get_object()

        if order.status in ["SHIPPED", "CANCELLED"]:
            return Response(
                {
                    "detail": (
                        "This order cannot be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "CANCELLED"
        order.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "detail": "Order cancelled successfully.",
                "status": order.status,
            }
        )


class OrderItemViewSet(BaseViewSet):
    queryset = OrderItem.objects.select_related(
        "order",
        "product",
    ).all().order_by("id")

    serializer_class = OrderItemSerializer

    filterset_fields = [
        "order",
        "product",
    ]


class PaymentViewSet(BaseViewSet):
    queryset = Payment.objects.select_related(
        "order",
    ).all().order_by("id")

    serializer_class = PaymentSerializer

    filterset_fields = [
        "order",
        "method",
        "paid",
    ]


class ShipmentViewSet(BaseViewSet):
    queryset = Shipment.objects.select_related(
        "order",
    ).all().order_by("id")

    serializer_class = ShipmentSerializer

    filterset_fields = [
        "order",
        "carrier",
    ]


class AuditEventViewSet(BaseViewSet):
    queryset = AuditEvent.objects.select_related(
        "actor",
    ).all().order_by("-id")

    serializer_class = AuditEventSerializer

    filterset_fields = [
        "actor",
        "action",
        "entity",
        "entity_id",
    ]

