from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=12)

    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'phone']

    def __str__(self):
        return self.username

class RoomType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    beds = models.PositiveIntegerField()
    image = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class Room(models.Model):
    number = models.CharField(max_length=10, unique=True)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name='rooms')

    def __str__(self):
        return f"Room {self.number} ({self.room_type.name})"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('paid', 'Paid'),
    ]
    guest_name = models.CharField(max_length=255)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=12)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings',
        blank=True,
        null=True
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )

    def __str__(self):
        return f"{self.guest_name} ({self.check_in_date} – {self.check_out_date})"