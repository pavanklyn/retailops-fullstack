import pytest
from apps.core.models import Customer,Order

@pytest.fixture
def order(product):
    customer=Customer.objects.create(name="Buyer",email="buyer@example.com")
    return Order.objects.create(order_number="ORD-1001",customer=customer,total=100)

@pytest.mark.django_db
def test_order_list(client,order):
    r=client.get("/api/orders/")
    assert r.status_code==200
    assert r.data["count"]==1

@pytest.mark.django_db
def test_confirm_order(client,order):
    r=client.post(f"/api/orders/{order.id}/confirm/")
    assert r.status_code==200
    assert r.data["status"]=="CONFIRMED"

@pytest.mark.django_db
def test_cancel_order(client,order):
    r=client.post(f"/api/orders/{order.id}/cancel/")
    assert r.status_code==200
    assert r.data["status"]=="CANCELLED"

@pytest.mark.django_db
def test_unauthenticated_is_rejected():
    from rest_framework.test import APIClient
    r=APIClient().get("/api/products/")
    assert r.status_code==401
