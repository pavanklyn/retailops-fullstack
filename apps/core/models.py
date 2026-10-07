from django.conf import settings
from django.db import models

class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Category(TimeStamped):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    def __str__(self): return self.name

class Supplier(TimeStamped):
    name = models.CharField(max_length=160)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    def __str__(self): return self.name

class Warehouse(TimeStamped):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=30, unique=True)
    address = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    def __str__(self): return self.name

class Product(TimeStamped):
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=180)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name="products")
    price = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    reorder_level = models.PositiveIntegerField(default=10)
    active = models.BooleanField(default=True)
    class Meta:
        indexes = [models.Index(fields=["sku"]), models.Index(fields=["name"])]
    def __str__(self): return f"{self.sku} - {self.name}"

class Customer(TimeStamped):
    name = models.CharField(max_length=160)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    def __str__(self): return self.name

class Inventory(TimeStamped):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="inventory")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="inventory")
    quantity = models.IntegerField(default=0)
    reserved = models.PositiveIntegerField(default=0)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["product","warehouse"], name="unique_product_warehouse")]

class StockMovement(TimeStamped):
    TYPES = [("IN","Stock In"),("OUT","Stock Out"),("ADJUST","Adjustment")]
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="movements")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name="movements")
    movement_type = models.CharField(max_length=10, choices=TYPES)
    quantity = models.IntegerField()
    reference = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

class Order(TimeStamped):
    STATUS = [("PENDING","Pending"),("CONFIRMED","Confirmed"),("SHIPPED","Shipped"),("CANCELLED","Cancelled")]
    order_number = models.CharField(max_length=40, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS, default="PENDING")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

class OrderItem(TimeStamped):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_items")
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

class Payment(TimeStamped):
    METHODS = [("CARD","Card"),("UPI","UPI"),("COD","Cash on Delivery"),("BANK","Bank")]
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    method = models.CharField(max_length=10, choices=METHODS)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid = models.BooleanField(default=False)

class Shipment(TimeStamped):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="shipment")
    carrier = models.CharField(max_length=100)
    tracking_number = models.CharField(max_length=100, unique=True)
    shipped_at = models.DateTimeField(null=True, blank=True)

class AuditEvent(TimeStamped):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=100)
    entity = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=50)
    details = models.JSONField(default=dict, blank=True)
