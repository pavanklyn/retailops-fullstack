import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.core.models import Category,Supplier,Warehouse,Product

@pytest.fixture
def user(db):
    return get_user_model().objects.create_user(username="tester",email="tester@example.com",password="Test@123",role="MANAGER")

@pytest.fixture
def client(user):
    c=APIClient()
    c.force_authenticate(user=user)
    return c

@pytest.fixture
def product(db):
    cat=Category.objects.create(name="Test Category")
    sup=Supplier.objects.create(name="Test Supplier")
    return Product.objects.create(sku="TEST-001",name="Test Product",category=cat,supplier=sup,price=100,cost_price=70)
