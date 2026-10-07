from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self): return self.request.user

class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
