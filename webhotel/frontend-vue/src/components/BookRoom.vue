<template>
  <div class="book-room-page">
    <header class="site-header">
      <router-link to="/" class="site-title">The Fox River</router-link>
    </header>

    <section class="booking-form">
      <form @submit.prevent="searchAvailable" class="booking-form__inner">
        <div class="booking-form__item">
          <label for="checkin" class="booking-form__label">Check-in</label>
          <input type="date" id="checkin" v-model="checkin" required class="booking-form__control">
        </div>
        <div class="booking-form__item">
          <label for="checkout" class="booking-form__label">Check-out</label>
          <input type="date" id="checkout" v-model="checkout" required class="booking-form__control">
        </div>
        <div class="booking-form__item">
          <label class="booking-form__label">Guests</label>
          <div class="guest-counter">
            <button type="button" class="guest-btn" @click="guests = Math.max(1, guests - 1)">−</button>
            <input type="number" v-model="guests" min="1" max="10" readonly>
            <button type="button" class="guest-btn" @click="guests++">+</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary booking-form__btn">Search</button>
      </form>
    </section>

    <section class="room-list" v-if="roomTypes.length">
      <div
          class="room-card"
          v-for="room in roomTypes"
          :key="room.id"
      >
        <img :src="room.image" :alt="room.name" class="room-card__image" />
        <div class="room-card__content">
          <h3 class="room-card__title">{{ room.name }} Room</h3>
          <p class="room-card__description">{{ room.description }}</p>
          <div class="room-card__footer">
            <span class="room-card__price">${{ room.price_per_night }} / night</span>
            <router-link
                :to="{
                  path: `/book-room/${room.id}`,
                  query: {
                    check_in: checkin,
                    check_out: checkout,
                    guests: guests,
                    name: room.name,
                    image: room.image,
                    total: calculateTotal(room.price_per_night),
                    room_type_id: room.id
                  }
                }"
                class="btn btn-outline"
            >
              Book
            </router-link>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { API_BASE } from '@/config/api'

const checkin = ref('')
const checkout = ref('')
const guests = ref(2)
const roomTypes = ref([])

const searchAvailable = async () => {
  if (!checkin.value || !checkout.value) return

  try {
    const res = await fetch(`${API_BASE}/available-room-types/?check_in_date=${checkin.value}&check_out_date=${checkout.value}`)
    if (!res.ok) throw new Error('Failed to fetch available room types')
    roomTypes.value = await res.json()
  } catch (err) {
    alert(err.message)
  }
}

const calculateTotal = (pricePerNight) => {
  const checkIn = new Date(checkin.value)
  const checkOut = new Date(checkout.value)
  const nights = Math.max(1, (checkOut - checkIn) / (1000 * 60 * 60 * 24))
  return nights * pricePerNight
}
</script>

<style scoped>
@import '../../public/css/fh.css';
@import '../../public/css/book-room.css';
</style>
