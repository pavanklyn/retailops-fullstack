
from rest_framework import serializers
class StockMovementViewSet(BaseViewSet):
    queryset = StockMovement.objects.select_related(
        "product",
        "warehouse",
        "created_by",
    ).all()

    serializer_class = StockMovementSerializer
    filterset_fields = ["product", "warehouse", "movement_type"]

    def perform_create(self, serializer):
        with transaction.atomic():
            movement_type = serializer.validated_data["movement_type"]
            quantity = serializer.validated_data["quantity"]
            product = serializer.validated_data["product"]
            warehouse = serializer.validated_data["warehouse"]

            if quantity <= 0:
                raise serializers.ValidationError(
                    {"quantity": "Quantity must be greater than 0."}
                )

            inv, _ = Inventory.objects.select_for_update().get_or_create(
                product=product,
                warehouse=warehouse,
                defaults={"quantity": 0},
            )

            if movement_type == "OUT":
                if quantity > inv.quantity:
                    raise serializers.ValidationError(
                        {
                            "quantity": (
                                f"Insufficient stock. "
                                f"Available stock: {inv.quantity}, "
                                f"requested: {quantity}."
                            )
                        }
                    )

                inv.quantity -= quantity

            elif movement_type == "IN":
                inv.quantity += quantity

            elif movement_type == "ADJUST":
                inv.quantity = quantity

            serializer.save(created_by=self.request.user)

            inv.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )