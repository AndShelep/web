from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer, LoginSerializer,
    LogoutSerializer, UserSerializer, BookingSerializer, RoomTypeSerializer
)
from .models import Booking, RoomType, Room
from django.shortcuts import get_object_or_404
from datetime import date, datetime
from django.db.models import Q

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data['refresh']).blacklist()
        except Exception:
            return Response({"detail":"Не вдалось заблокувати токен"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MyBookingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, user=request.user)
        booking.delete()
        return Response({"detail": "Booking cancelled."}, status=status.HTTP_204_NO_CONTENT)

class PayBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, user=request.user)

        if booking.status == 'confirmed':
            return Response({"detail": "Booking is already confirmed."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'confirmed'
        booking.save()

        return Response({"detail": "Booking confirmed successfully."}, status=status.HTTP_200_OK)

class UsersListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class UserDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, id):
        user = get_object_or_404(User, id=id)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, id):
        user = get_object_or_404(User, id=id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        user = get_object_or_404(User, id=id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RoomTypeListView(APIView):
    def get(self, request):
        room_types = RoomType.objects.all()
        serializer = RoomTypeSerializer(room_types, many=True)
        return Response(serializer.data)

class RoomTypeDetailByNameView(APIView):
    def get(self, request, name):
        room_type = get_object_or_404(RoomType, name=name)
        serializer = RoomTypeSerializer(room_type)
        return Response(serializer.data)

class RoomTypeDetailByIdView(APIView):
    #permission_classes = [permissions.IsAdminUser]

    def get(self, request, id):
        room_type = get_object_or_404(RoomType, id=id)
        serializer = RoomTypeSerializer(room_type)
        return Response(serializer.data)

    def put(self, request, id):
        room_type = get_object_or_404(RoomType, id=id)
        serializer = RoomTypeSerializer(room_type, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvailableRoomTypesView(APIView):
    def get(self, request):
        check_in = request.query_params.get('check_in_date')
        check_out = request.query_params.get('check_out_date')

        if not check_in or not check_out:
            return Response(
                {"detail": "Both check_in_date and check_out_date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            check_in_date = date.fromisoformat(check_in)
            check_out_date = date.fromisoformat(check_out)
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booked_rooms = Booking.objects.filter(
            Q(check_in_date__lt=check_out_date) & Q(check_out_date__gt=check_in_date)
        ).values_list('room_id', flat=True)

        available_rooms = Room.objects.exclude(id__in=booked_rooms)

        available_room_type_ids = available_rooms.values_list('room_type_id', flat=True).distinct()
        room_types = RoomType.objects.filter(id__in=available_room_type_ids)

        serializer = RoomTypeSerializer(room_types, many=True)
        return Response(serializer.data)


class CreateBookingView(APIView):
    def post(self, request):
        data = request.data
        room_type_id = data.get("room_type_id")
        check_in = data.get("check_in_date")
        check_out = data.get("check_out_date")

        if not all([room_type_id, check_in, check_out]):
            return Response({"detail": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        room_type = get_object_or_404(RoomType, id=room_type_id)
        rooms = Room.objects.filter(room_type=room_type)

        # Знаходимо першу вільну кімнату
        available_room = None
        for room in rooms:
            overlapping = Booking.objects.filter(
                room=room,
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            ).exists()
            if not overlapping:
                available_room = room
                break

        if not available_room:
            return Response({"detail": "No available rooms for selected dates."}, status=status.HTTP_400_BAD_REQUEST)

        # Обчислюємо total_price
        from datetime import datetime
        nights = (datetime.fromisoformat(check_out) - datetime.fromisoformat(check_in)).days
        total_price = nights * float(room_type.price_per_night)

        booking = Booking.objects.create(
            guest_name=data.get("guest_name"),
            guest_email=data.get("guest_email"),
            guest_phone=data.get("guest_phone"),
            check_in_date=check_in,
            check_out_date=check_out,
            room=available_room,
            user=request.user if request.user.is_authenticated else None,
            total_price=total_price,
        )

        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)