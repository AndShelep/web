<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const router = useRouter()

const username = ref('')
const password = ref('')

const errorMsg = ref(null)

const onSubmit = () => {
  errorMsg.value = null

  fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            if (data.detail) {
              // Помилка від SimpleJWT
              throw new Error('wrong username or password')
            }

            // Інші помилки (наприклад, поле пусте)
            let message = ''
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                message += `${key}: ${data[key].join(' ')}\n`
              }
            }
            throw new Error(message || 'Login failed')
          })
        }
        return res.json()
      })
      .then(data => {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)

        router.push('/profile')
      })
      .catch(err => {
        errorMsg.value = err.message
      })
}
</script>

<template>
  <div class="register-page">
    <header class="site-header">
      <router-link to="/" class="site-title">The Fox River</router-link>
    </header>

    <main class="login-container">
      <h2>Sign in to your account</h2>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="username">Username</label>
          <input
              id="username"
              v-model="username"
              type="text"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
              id="password"
              v-model="password"
              type="password"
              required
          />
        </div>

        <button type="submit" class="btn-primary">Sign In</button>
      </form>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <p class="login-link">
        Don't have an account
        <router-link to="/register">Sign up</router-link> right now!
      </p>
    </main>

    <footer class="site-footer">
      <p>&copy; 2025 The Fox River Hotel. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
@import '../../public/css/register.css';
@import '../../public/css/fh.css';

.register-container h2 {
  margin-bottom: 1.25rem;
  font-size: 1.8rem;
}

.error {
  color: #c00;
  margin-top: 1rem;
  white-space: pre-wrap;
}
</style>
