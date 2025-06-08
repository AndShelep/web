from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView,
    ProfileView, MyBookingsView,
    UsersListView, UserDetailView, RoomTypeListView, RoomTypeDetailByNameView, RoomTypeDetailByIdView,
    AvailableRoomTypesView, CreateBookingView, PayBookingView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',    LoginView.as_view(),    name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/',   LogoutView.as_view(),   name='logout'),
    path('profile/',  ProfileView.as_view(),  name='profile'),
    path('bookings/', MyBookingsView.as_view(), name='my_bookings'),
    path('bookings/<int:pk>/', MyBookingsView.as_view(), name='cancel-booking'),
    path('bookings/<int:pk>/pay/', PayBookingView.as_view(), name='pay-booking'),
    path('users/', UsersListView.as_view(), name='users_list'),
    path('users/<int:id>/', UserDetailView.as_view(), name='user_detail'),
    path('room-types/', RoomTypeListView.as_view(), name='room-type-list'),
    path('room-types/<str:name>/', RoomTypeDetailByNameView.as_view(), name='room-type-detail-by-name'),
    path('room-types/id/<int:id>/', RoomTypeDetailByIdView.as_view(), name='room-type-detail-by-id'),
    path('available-room-types/', AvailableRoomTypesView.as_view(), name='available-room-types'),
    path('bookings/create/', CreateBookingView.as_view(), name='create-booking'),

]
