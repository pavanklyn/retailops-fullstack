from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.models import Category,Supplier,Warehouse,Product,Customer,Inventory

class Command(BaseCommand):
    help="Create demo users and sample inventory data"
    def handle(self,*args,**kwargs):
        User=get_user_model()
        for username,password,role in [
            ("admin@example.com","Admin@123","ADMIN"),
            ("manager@example.com","Manager@123","MANAGER"),
            ("staff@example.com","Staff@123","STAFF"),
        ]:
            u,created=User.objects.get_or_create(username=username,defaults={"email":username,"role":role,"is_staff":role=="ADMIN","is_superuser":role=="ADMIN"})
            if created: u.set_password(password); u.save()
        cat,_=Category.objects.get_or_create(name="Electronics")
        sup,_=Supplier.objects.get_or_create(name="Demo Supplier",email="supplier@example.com")
        wh,_=Warehouse.objects.get_or_create(name="Main Warehouse",code="WH-001")
        for i in range(1,51):
            p,_=Product.objects.get_or_create(sku=f"SKU-{i:04d}",defaults={"name":f"Demo Product {i}","category":cat,"supplier":sup,"price":999+i*10,"cost_price":700+i*8,"reorder_level":10})
            Inventory.objects.get_or_create(product=p,warehouse=wh,defaults={"quantity":100})
        Customer.objects.get_or_create(name="Demo Customer",email="customer@example.com")
        self.stdout.write(self.style.SUCCESS("Demo data created."))
