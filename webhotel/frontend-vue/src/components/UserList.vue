<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const users = ref([])
const errorMsg = ref(null)
const router = useRouter()

const fetchUsers = () => {
  const token = localStorage.getItem('access_token')
  fetch(`${BASE_URL}/users/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load users')
        return res.json()
      })
      .then(data => {
        users.value = data
      })
      .catch(err => {
        errorMsg.value = err.message
      })
}

const deleteUser = (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  const token = localStorage.getItem('access_token')
  fetch(`${BASE_URL}/users/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete user')
        users.value = users.value.filter(user => user.id !== id)
      })
      .catch(err => {
        alert('Error: ' + err.message)
      })
}

onMounted(fetchUsers)
</script>

<template>
  <div class="admin-page">
    <header class="site-header">
      <nav class="nav-left">
        <router-link to="/">Home</router-link>
      </nav>
      <div class="site-title">The Fox River</div>
      <div class="nav-right">
        <router-link to="/profile">Profile</router-link>
      </div>
    </header>

    <main class="user-list-section">
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <div
          v-for="(u, index) in users"
          :key="u.id"
          class="list-preview"
          :class="{ reverse: index % 2 === 1 }"
      >
        <div class="list-text">
          <h2>{{ u.first_name }} {{ u.last_name }}</h2>
          <p>
            Email: {{ u.email }}<br />
            Role: {{ u.is_staff ? 'Admin' : 'Regular' }}
          </p>
          <div class="list-actions">
            <button class="btn btn-primary small" @click="router.push(`/admin/users/${u.id}`)">
              Edit
            </button>
            <button class="btn btn-outline small" @click="deleteUser(u.id)">
              Delete
            </button>
          </div>
        </div>
        <div class="list-image">
          <img src="/img/profile/avatar.png" alt="Avatar" />
        </div>
      </div>

      <hr v-if="users.length" class="section-divider" />
    </main>

    <footer class="site-footer">
      <p>&copy; 2025 The Fox River Hotel. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
@import '../../public/css/fh.css';
@import '../../public/css/list.css';

.error {
  color: #c00;
  padding: 1rem;
  text-align: center;
}
</style>
