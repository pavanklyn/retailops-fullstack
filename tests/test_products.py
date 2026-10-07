import pytest
from apps.core.models import Product,Inventory,Warehouse

@pytest.mark.django_db
def test_product_list(client,product):
    r=client.get("/api/products/")
    assert r.status_code==200
    assert r.data["count"]==1

@pytest.mark.django_db
def test_product_create(client,product):
    payload={"sku":"NEW-001","name":"New Product","category":product.category_id,"supplier":product.supplier_id,"price":"200.00","cost_price":"120.00","reorder_level":5}
    r=client.post("/api/products/",payload,format="json")
    assert r.status_code==201

@pytest.mark.django_db
def test_product_search(client,product):
    r=client.get("/api/products/?search=Test")
    assert r.status_code==200
    assert r.data["count"]==1

@pytest.mark.django_db
def test_product_stock_action(client,product):
    Warehouse.objects.create(name="WH",code="WH-X")
    r=client.get(f"/api/products/{product.id}/stock/")
    assert r.status_code==200
