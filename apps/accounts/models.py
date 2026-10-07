from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [("ADMIN","Admin"),("MANAGER","Manager"),("STAFF","Staff")]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="STAFF")
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username
