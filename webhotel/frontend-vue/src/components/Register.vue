<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE as BASE_URL } from '@/config/api'

const router = useRouter()

const username = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')

const errorMsg = ref(null)

const onSubmit = () => {
  errorMsg.value = null

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username.value,
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      phone: phone.value,
      password: password.value
    })
  })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            let message = ''
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                message += key + ': ' + data[key].join(' ') + '\n'
              }
            }
            throw new Error(message)
          })
        }
        return res.json()
      })
      .then(() => {
        router.push('/login')
      })
      .catch(err => {
        errorMsg.value = err.message || 'Registration failed.'
      })
}
</script>

<template>
  <div class="register-page">
    <header class="site-header">
      <router-link to="/" class="site-title">The Fox River</router-link>
    </header>

    <main class="register-container">
      <h2>Create an account</h2>
      <form class="register-form" @submit.prevent="onSubmit">
        <div class="form-row">
          <div class="form-group half">
            <label for="firstName">First Name</label>
            <input id="firstName" v-model="firstName" type="text" required />
          </div>
          <div class="form-group half">
            <label for="lastName">Last Name</label>
            <input id="lastName" v-model="lastName" type="text" required />
          </div>
        </div>
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="username" type="text" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required />
        </div>
        <div class="form-group">
          <label for="phone">Phone</label>
          <input id="phone" v-model="phone" type="tel" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" required />
        </div>

        <button type="submit" class="btn-primary">Register</button>
      </form>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <p class="login-link">
        Already have an account?
        <router-link to="/login">Sign in</router-link> right now!
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

.error {
  color: #c00;
  margin-top: 1rem;
  white-space: pre-wrap;
}
</style>
