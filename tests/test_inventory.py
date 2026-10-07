import pytest
from apps.core.models import Warehouse,Inventory,StockMovement

@pytest.mark.django_db
def test_stock_in_updates_inventory(client,product,user):
    wh=Warehouse.objects.create(name="Main",code="MAIN")
    r=client.post("/api/stock-movements/",{"product":product.id,"warehouse":wh.id,"movement_type":"IN","quantity":25,"reference":"PO-1"},format="json")
    assert r.status_code==201
    inv=Inventory.objects.get(product=product,warehouse=wh)
    assert inv.quantity==25

@pytest.mark.django_db
def test_low_stock_endpoint(client,product):
    wh=Warehouse.objects.create(name="Low",code="LOW")
    Inventory.objects.create(product=product,warehouse=wh,quantity=2)
    r=client.get("/api/inventory/low_stock/")
    assert r.status_code==200
    assert len(r.data)>=1

@pytest.mark.django_db
def test_inventory_filter(client,product):
    wh=Warehouse.objects.create(name="Main",code="MAIN2")
    Inventory.objects.create(product=product,warehouse=wh,quantity=20)
    r=client.get(f"/api/inventory/?warehouse={wh.id}")
    assert r.status_code==200
    assert r.data["count"]==1
