import pytest
from rest_framework.test import APIClient
from django.urls import reverse

@pytest.mark.django_db
def test_jwt_login():
    from django.contrib.auth import get_user_model
    U=get_user_model()
    U.objects.create_user(username="login",email="login@example.com",password="Secret@123")
    r=APIClient().post("/api/auth/token/",{"username":"login","password":"Secret@123"},format="json")
    assert r.status_code==200
    assert "access" in r.data and "refresh" in r.data

@pytest.mark.django_db
def test_profile(client,user):
    r=client.get("/api/auth/profile/")
    assert r.status_code==200
    assert r.data["email"]==user.email
