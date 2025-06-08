from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from api.models import Booking

User = get_user_model()

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Додаткові поля', {'fields': ('phone',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Додаткові поля', {'fields': ('phone',)}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'phone', 'is_staff')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('guest_name', 'guest_email', 'guest_phone', 'check_in_date', 'check_out_date', 'user')
    list_filter = ('check_in_date', 'user')
    search_fields = ('guest_name', 'guest_email', 'user__username')