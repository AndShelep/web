<template>
  <div class="admin-page">
    <header class="site-header">
      <router-link to="/" class="site-title">The Fox River</router-link>
    </header>

    <main class="form-section">
      <h2>Edit Room Type</h2>

      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
      <div v-if="successMsg" class="success">{{ successMsg }}</div>

      <form v-if="roomType" @submit.prevent="saveChanges" class="form-container">
        <div class="form-group">
          <label>Name</label>
          <input v-model="roomType.name" type="text" required />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="roomType.description" rows="4" required></textarea>
        </div>

        <div class="form-group">
          <label>Beds</label>
          <input v-model.number="roomType.beds" type="number" min="1" required />
        </div>

        <div class="form-group">
          <label>Price per Night</label>
          <input v-model.number="roomType.price_per_night" type="number" min="1" required />
        </div>

        <div class="form-group">
          <label>Image Path (relative)</label>
          <input v-model="roomType.image" type="text" placeholder="/img/room_types/example.jpg" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save</button>
          <router-link to="/rooms" class="btn btn-outline">Cancel</router-link>
        </div>
      </form>
    </main>

    <footer class="site-footer">
      <p>&copy; 2025 The Fox River Hotel. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const route = useRoute()
const router = useRouter()

const roomType = ref(null)
const errorMsg = ref(null)
const successMsg = ref(null)

const fetchRoomType = async () => {
  try {
    const res = await fetch(`${BASE_URL}/room-types/id/${route.params.id}/`)
    if (!res.ok) throw new Error('Failed to load room type')
    roomType.value = await res.json()
  } catch (err) {
    errorMsg.value = err.message
  }
}

const saveChanges = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${BASE_URL}/room-types/id/${roomType.value.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(roomType.value)
    })

    if (!res.ok) throw new Error('Failed to save changes')
    successMsg.value = 'Room type updated successfully!'
  } catch (err) {
    errorMsg.value = err.message
  }
}

onMounted(fetchRoomType)
</script>

<style scoped>
@import '../../public/css/fh.css';
@import '../../public/css/edit-room-type.css';
</style>
