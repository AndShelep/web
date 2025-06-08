<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const router = useRouter()
const user = ref(null)
const errorMsg = ref(null)
const loading = ref(true)

const isEditing = ref(false)
const editedUser = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: ''
})

onMounted(() => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  fetch(`${BASE_URL}/profile/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            router.push('/login')
          }
          throw new Error('Не вдалося завантажити профіль.')
        }
        return res.json()
      })
      .then(data => {
        user.value = data
      })
      .catch(err => {
        errorMsg.value = err.message
      })
      .finally(() => {
        loading.value = false
      })
})

const logout = () => {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) {
    router.push('/')
    return
  }

  fetch(`${BASE_URL}/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    },
    body: JSON.stringify({ refresh })
  })
      .finally(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.push('/')
      })
}

const deleteAccount = () => {
  if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) return

  fetch(`${BASE_URL}/profile/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    }
  })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete account.')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.push('/')
      })
      .catch(err => {
        alert('Error: ' + err.message)
      })
}

const startEditing = () => {
  isEditing.value = true
  editedUser.value = {
    first_name: user.value.first_name,
    last_name: user.value.last_name,
    email: user.value.email,
    phone: user.value.phone
  }
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveChanges = () => {
  fetch(`${BASE_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    },
    body: JSON.stringify(editedUser.value)
  })
      .then(res => {
        if (!res.ok){
          return res.json().then(data => {
            console.error('❌ Backend error:', data)
            throw new Error('Failed to update profile')
          })
        }
        return res.json()
      })
      .then(data => {
        user.value = data
        isEditing.value = false
      })
      .catch(err => {
        alert('Error: ' + err.message)
      })
}

const goToBookings = () => {
  router.push('/user/bookings')
}
</script>

<template>
  <div class="profile-page">
    <header class="site-header">
      <router-link to="/" class="site-title">The Fox River</router-link>
    </header>

    <main class="profile-wrapper">
      <div class="profile-container">
        <div v-if="loading" class="loading">Loading…</div>
        <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
        <div v-else class="profile-card">
          <div class="avatar-wrapper">
            <img
                :src="user.avatarUrl || '/img/profile/avatar.png'"
                alt="User Avatar"
                class="avatar"
            />
          </div>
          <h2 class="username">{{ user.username }}</h2>
          <p class="joined">Joined on {{ new Date(user.date_joined).toLocaleDateString() }}</p>
          <router-link
              v-if="user.is_staff"
              to="/admin/users"
              class="btn btn-outline-dark"
              style="margin-bottom: 1rem; display: inline-block;"
          >
            Manage Users
          </router-link>

          <div class="info-grid">
            <div>
              <strong>First Name:</strong>
              <template v-if="isEditing">
                <input v-model="editedUser.first_name" type="text" />
              </template>
              <template v-else>
                {{ user.first_name }}
              </template>
            </div>

            <div>
              <strong>Last Name:</strong>
              <template v-if="isEditing">
                <input v-model="editedUser.last_name" type="text" />
              </template>
              <template v-else>
                {{ user.last_name }}
              </template>
            </div>

            <div>
              <strong>Email:</strong>
              <template v-if="isEditing">
                <input v-model="editedUser.email" type="email" />
              </template>
              <template v-else>
                {{ user.email }}
              </template>
            </div>

            <div>
              <strong>Phone:</strong>
              <template v-if="isEditing">
                <input v-model="editedUser.phone" type="tel" />
              </template>
              <template v-else>
                {{ user.phone }}
              </template>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn btn-danger" @click="deleteAccount">Delete Account</button>
            <button class="btn btn-outline-dark" @click="goToBookings">Your Bookings</button>
            <div style="flex: 1"></div>

            <template v-if="isEditing">
              <button class="btn btn-secondary" @click="saveChanges">Save Changes</button>
              <button class="btn btn-outline-dark" @click="cancelEditing">Cancel</button>
            </template>
            <template v-else>
              <button class="btn btn-secondary" @click="startEditing">Edit Profile</button>
              <button class="btn btn-outline-dark" @click="logout">Log out</button>
            </template>
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
</style>
