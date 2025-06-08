<template>
  <div class="admin-page">
    <header class="site-header">
      <router-link to="/" class="site-title">The Fox River</router-link>
    </header>

    <div class="booking-wrapper">
      <div class="booking-wrapper__left">
        <form @submit.prevent="submitBooking" class="info-form">
          <h3 class="info-form__heading">Your Info</h3>

          <div class="info-form__group">
            <label>First Name*</label>
            <input v-model="form.firstName" required />
          </div>
          <div class="info-form__group">
            <label>Last Name*</label>
            <input v-model="form.lastName" required />
          </div>
          <div class="info-form__group">
            <label>Phone Number*</label>
            <input v-model="form.phone" required />
          </div>
          <div class="info-form__group">
            <label>Email*</label>
            <input v-model="form.email" type="email" required />
          </div>

          <button type="submit" class="btn btn-primary">Confirm Booking</button>
          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
          <div v-if="successMsg" class="success">{{ successMsg }}</div>
        </form>
      </div>

      <div class="booking-wrapper__right">
        <h3 class="summary__heading">Your Booking</h3>
        <div class="summary__room">
          <img :src="bookingData.image" alt="Room" />
          <div class="summary__details">
            <div><strong>Room:</strong> {{ bookingData.name }}</div>
            <div><strong>Dates:</strong> {{ bookingData.check_in }} — {{ bookingData.check_out }}</div>
            <div><strong>Guests:</strong> {{ bookingData.guests }}</div>
          </div>
        </div>
        <div class="summary__total">
          <span>Total:</span>
          <strong>${{ bookingData.total }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const route = useRoute()
const router = useRouter()

// bookingData передається через router.query з попередньої сторінки
const bookingData = {
  name: route.query.name || 'Room',
  image: route.query.image || '/img/rooms/default.jpg',
  check_in: route.query.check_in || '',
  check_out: route.query.check_out || '',
  guests: route.query.guests || 1,
  total: route.query.total || 0,
  room_type_id: route.query.room_type_id
}

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: ''
})

const successMsg = ref('')
const errorMsg = ref('')

const submitBooking = async () => {
  const payload = {
    guest_name: `${form.value.firstName} ${form.value.lastName}`,
    guest_email: form.value.email,
    guest_phone: form.value.phone,
    check_in_date: bookingData.check_in,
    check_out_date: bookingData.check_out,
    room_type_id: bookingData.room_type_id,
    total_price: bookingData.total,
  }

  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${BASE_URL}/bookings/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      // отримати детальну помилку для дебагу
      const errTxt = await res.text()
      throw new Error(errTxt || 'Could not create booking.')
    }

    successMsg.value = 'Booking confirmed!'
    errorMsg.value = ''
    router.push('/')
  } catch (err) {
    successMsg.value = ''
    errorMsg.value = err.message
  }
}

const fetchUserInfo = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    const res = await fetch(`${BASE_URL}/profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.ok) {
      const data = await res.json()
      form.value.firstName = data.first_name || ''
      form.value.lastName = data.last_name || ''
      form.value.email = data.email || ''
      form.value.phone = data.phone || ''
    }
  } catch (err) {
    // no-op
  }
}

onMounted(fetchUserInfo)
</script>

<style scoped>
@import '../../public/css/fh.css';
@import '../../public/css/enter-info.css';
</style>
