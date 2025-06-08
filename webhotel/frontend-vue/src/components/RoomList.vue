<template>
  <header class="site-header">
    <router-link to="/" class="site-title">The Fox River</router-link>
  </header>
  <div class="user-list-section">
    <h2 style="text-align:center; margin-bottom: 2rem;">Room Types</h2>

    <div
        v-for="(type, index) in roomTypes"
        :key="type.id"
        class="list-preview"
        :class="{ reverse: index % 2 === 1 }"
    >
      <div class="list-text">
        <h2>{{ type.name }} Room</h2>
        <p>
          {{ type.description }}<br />
          <strong>Beds:</strong> {{ type.beds }}<br />
          <strong>Price:</strong> ${{ type.price_per_night }} / night
        </p>
        <div class="list-actions" v-if="isAdmin">
          <button
              class="btn btn-primary small"
              @click="editRoomType(type.id)"
          >
            Edit
          </button>
        </div>
      </div>

      <div class="list-image">
        <img :src="type.image" :alt="type.name" />
      </div>
    </div>

    <hr class="section-divider" v-if="roomTypes.length" />
  </div>
  <footer class="site-footer">
    <p>&copy; 2025 The Fox River Hotel. All rights reserved.</p>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const roomTypes = ref([])
const isAdmin = ref(false)
const router = useRouter()

const fetchRoomTypes = async () => {
  try {
    const res = await fetch(`${BASE_URL}/room-types/`)
    if (!res.ok) throw new Error('Failed to fetch room types')
    roomTypes.value = await res.json()
  } catch (err) {
    console.error('Error fetching room types:', err)
  }
}

const fetchUserInfo = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    isAdmin.value = false
    return
  }

  try {
    const res = await fetch(`${BASE_URL}/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      isAdmin.value = false
      return
    }

    const user = await res.json()
    isAdmin.value = user.is_staff
  } catch (e) {
    console.warn('Could not fetch user info')
    isAdmin.value = false
  }
}

const editRoomType = (id) => {
  router.push(`/admin/room-types/${id}`)
}

onMounted(() => {
  fetchUserInfo()
  fetchRoomTypes()
})
</script>

<style scoped>
@import '../../public/css/fh.css';
@import '../../public/css/list.css';
</style>
