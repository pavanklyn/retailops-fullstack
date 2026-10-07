from django.contrib import admin
from .models import *
for model in [Category,Supplier,Warehouse,Product,Customer,Inventory,StockMovement,Order,OrderItem,Payment,Shipment,AuditEvent]:
    admin.site.register(model)
