<template>
  <div class="checkout-page">
    <h1>Enter Payment Details</h1>
    <form @submit.prevent="submitPayment" class="card-form">
      <div class="form-group">
        <label for="cardNumber">Card Number</label>
        <input
            id="cardNumber"
            v-model="cardNumber"
            type="text"
            maxlength="16"
            pattern="\d{16}"
            placeholder="1234567812345678"
            required
        />
      </div>

      <div class="form-group">
        <label for="expiry">Expiry (MM/YY)</label>
        <input
            id="expiry"
            v-model="expiry"
            type="text"
            maxlength="5"
            @input="formatExpiry"
            placeholder="MM/YY"
            required
        />
      </div>

      <div class="form-group">
        <label for="cvv">CVV</label>
        <input
            id="cvv"
            v-model="cvv"
            type="password"
            maxlength="4"
            pattern="\d{3,4}"
            placeholder="***"
            required
        />
      </div>

      <button type="submit" class="btn btn-primary">Pay</button>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const bookingId = route.query.booking_id
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const cardNumber = ref('')
const expiry = ref('')
const cvv = ref('')
const errorMsg = ref('')
const successMsg = ref('')

function formatExpiry(e) {
  let value = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
  if (value.length >= 3) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  expiry.value = value
}

async function submitPayment() {
  errorMsg.value = ''
  successMsg.value = ''

  if (cardNumber.value.length !== 16) {
    errorMsg.value = 'Card number must be 16 digits.'
    return
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry.value)) {
    errorMsg.value = 'Expiry must be in MM/YY format.'
    return
  }

  if (!/^\d{3,4}$/.test(cvv.value)) {
    errorMsg.value = 'CVV must be 3 or 4 digits.'
    return
  }

  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/pay/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.detail || 'Payment failed.')
    }

    successMsg.value = 'Payment successful! Booking confirmed.'
    setTimeout(() => router.push('/user/bookings'), 2000)
  } catch (err) {
    errorMsg.value = err.message
  }
}
</script>

<style scoped>
.checkout-page {
  max-width: 400px;
  margin: 4rem auto;
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  display: block;
}

.form-group input {
  width: 92.5%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.btn {
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  background-color: #000;
  color: #fff;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn:hover {
  background-color: #333;
}

.error {
  color: #c00;
  font-weight: 600;
}

.success {
  color: green;
  font-weight: 600;
}
</style>
