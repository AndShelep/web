<template>
  <header class="site-header">
    <router-link to="/" class="site-title">The Fox River</router-link>
  </header>

  <div class="user-list-section">
    <!-- Повідомлення про помилку -->
    <div v-if="errorMsg" class="error">
      {{ errorMsg }}
    </div>

    <!-- Якщо нема помилки: -->
    <div v-else>
      <div v-if="bookings.length === 0" class="empty-message">
        You have no bookings yet.
      </div>

      <div
          v-for="(booking, idx) in bookings"
          :key="booking.id"
          :class="['list-preview', { reverse: idx % 2 === 1 }]"
      >
        <div class="list-image">
          <img
              :src="booking.room.room_type.image || '/img/rooms/default.jpg'"
              alt="Room Type"
          />
        </div>

        <div class="list-text">
          <h2>{{ booking.room.room_type.name }}</h2>
          <p>
            <strong>Dates:</strong>
            {{ formatDate(booking.check_in_date) }} – {{ formatDate(booking.check_out_date) }}
          </p>
          <p>
            <strong>Total:</strong> ${{ Number(booking.total_price).toFixed(2) }}
          </p>
          <p>
            <strong>Status:</strong> {{ booking.status }}
          </p>

          <div class="list-actions">
            <button class="btn btn-outline" @click="cancelBooking(booking.id)">Cancel Booking</button>
            <button class="btn btn-primary" @click="payBooking(booking)">Pay</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const bookings = ref([])
const errorMsg = ref(null)
const router = useRouter()

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:8000/api'

async function fetchBookings() {
  errorMsg.value = null
  const token = localStorage.getItem('access_token')
  if (!token) {
    errorMsg.value = 'Please log in to view your bookings.'
    return router.push('/login')
  }

  try {
    const res = await fetch(`${BASE_URL}/bookings/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    bookings.value = await res.json()
  } catch (err) {
    errorMsg.value = err.message || 'Failed to load bookings.'
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return

  try {
    const res = await fetch(`${BASE_URL}/bookings/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
      }
    })

    if (!res.ok) throw new Error('Failed to cancel booking.')

    // Видаляємо з локального списку
    bookings.value = bookings.value.filter(b => b.id !== id)
  } catch (err) {
    alert('Error: ' + err.message)
  }
}

function payBooking(booking) {
  router.push({
    name: 'payment',
    query: {
      room_type_id: booking.room.room_type.id,
      name: booking.room.room_type.name,
      image: booking.room.room_type.image,
      check_in: booking.check_in_date,
      check_out: booking.check_out_date,
      total: booking.total_price,
      booking_id: booking.id
    }
  })
}
onMounted(fetchBookings)
</script>

<style scoped>
@import '../../public/css/list.css';
@import '../../public/css/fh.css';

.error {
  color: #c00;
  font-weight: bold;
  text-align: center;
  padding: 2rem 0;
}

.empty-message {
  font-size: 1.1rem;
  text-align: center;
  color: #444;
  padding: 2rem;
}
</style>
