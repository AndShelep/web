<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const editedUser = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: ''
})
const loading = ref(true)
const errorMsg = ref(null)

const userId = route.params.id

onMounted(() => {
  const token = localStorage.getItem('access_token')
  fetch(`${BASE_URL}/users/${userId}/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load user')
        return res.json()
      })
      .then(data => {
        user.value = data
        editedUser.value = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone
        }
      })
      .catch(err => {
        errorMsg.value = err.message
      })
      .finally(() => {
        loading.value = false
      })
})

const saveChanges = () => {
  const token = localStorage.getItem('access_token')
  fetch(`${BASE_URL}/users/${userId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(editedUser.value)
  })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update user')
        return res.json()
      })
      .then(data => {
        alert('User updated successfully')
        router.push('/admin/users')
      })
      .catch(err => {
        alert('Error: ' + err.message)
      })
}
</script>

<template>
  <div class="admin-edit-page">
    <header class="site-header">
      <router-link to="/" class="site-title">The Fox River</router-link>
    </header>

    <main class="profile-wrapper">
      <div class="profile-container">
        <div v-if="loading" class="loading">Loading…</div>
        <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
        <div v-else class="profile-card">
          <div class="avatar-wrapper">
            <img src="/img/profile/avatar.png" alt="User Avatar" class="avatar" />
          </div>
          <h2 class="username">{{ user.username }}</h2>
          <p class="joined">Joined on {{ new Date(user.date_joined).toLocaleDateString() }}</p>

          <div class="info-grid">
            <div>
              <strong>First Name:</strong>
              <input v-model="editedUser.first_name" type="text" />
            </div>
            <div>
              <strong>Last Name:</strong>
              <input v-model="editedUser.last_name" type="text" />
            </div>
            <div>
              <strong>Email:</strong>
              <input v-model="editedUser.email" type="email" />
            </div>
            <div>
              <strong>Phone:</strong>
              <input v-model="editedUser.phone" type="tel" />
            </div>
          </div>

          <div class="profile-actions" style="justify-content: flex-end">
            <button class="btn btn-secondary" @click="saveChanges">Save Changes</button>
            <router-link to="/admin/users" class="btn btn-outline-dark">Cancel</router-link>
          </div>
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <p>&copy; 2025 The Fox River Hotel. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
@import '../../public/css/profile.css';
@import '../../public/css/fh.css';

.info-grid input {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}
</style>
