from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProfileView, UserListView

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("users/", UserListView.as_view(), name="users"),
]
