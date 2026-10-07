from rest_framework import serializers  # pyright: ignore[reportMissingImports]

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


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_sku = serializers.CharField(
        source="product.sku",
        read_only=True,
    )

    reorder_level = serializers.IntegerField(
        source="product.reorder_level",
        read_only=True,
    )

    warehouse_name = serializers.CharField(
        source="warehouse.name",
        read_only=True,
    )

    available_stock = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = [
            "id",
            "created_at",
            "updated_at",
            "product",
            "product_name",
            "product_sku",
            "warehouse",
            "warehouse_name",
            "quantity",
            "reserved",
            "available_stock",
            "reorder_level",
        ]

    def get_available_stock(self, obj):
        return max(obj.quantity - obj.reserved, 0)


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Order
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = "__all__"


class AuditEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditEvent
        fields = "__all__"