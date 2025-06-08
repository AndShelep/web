<template>
  <div class="home-page">
    <header class="site-header">
      <nav class="nav-left">
        <a href="#about">About us</a>
        <a href="#rooms">Rooms</a>
        <a href="#services">Services</a>
        <a href="#contacts">Contacts</a>
      </nav>

      <div class="site-title">The Fox River</div>

      <div class="nav-right">
        <router-link to="/profile" class="menu-link">
          Profile
        </router-link>
      </div>
    </header>

    <section class="hero-section">
      <img src="/img/home/hot.jpg" alt="Hotel building" class="hero-image" />
      <div class="hero-text">Comfort at every moment</div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-value">⭐️ 5.0</div>
          <div class="stat-label">Rating</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">5 minutes</div>
          <div class="stat-label">to the center</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">Top services</div>
          <div class="stat-label">SPA, pool</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">20+</div>
          <div class="stat-label">Rooms</div>
        </div>
      </div>
    </section>

    <section class="about-section section-spacing" id="about">
      <div class="about-text">
        <h2>About Us</h2>
        <p>
          Welcome to <strong>The Fox River</strong> — a sanctuary of comfort and elegance where modern luxury meets timeless charm. Nestled in the heart of the city, our hotel is dedicated to providing exceptional hospitality, personalized service, and unforgettable experiences for every guest.
        </p>
        <p>
          Our rooms are crafted with attention to every detail, offering cozy interiors and stunning views. Enjoy access to our world-class SPA, wellness center, gourmet dining, and personalized concierge service. Whether you're traveling for business, leisure, or a romantic escape, we make sure your stay feels like home.
        </p>
      </div>
      <div class="about-image">
        <img src="/img/home/about.jpg" alt="Hotel lobby" />
      </div>
    </section>

    <hr class="section-divider" />

    <section class="rooms-section section-spacing" id="rooms">
      <h2 class="section-title">Rooms</h2>

      <div class="room-types">
        <button
            v-for="type in roomTypes"
            :key="type"
            :class="['room-type', { active: selectedRoomType === type }]"
            @click="selectRoom(type)"
        >
          {{ type }}
        </button>
      </div>

      <div class="room-content" v-if="roomInfo">
        <div class="room-image">
          <img :src="roomInfo.image" :alt="roomInfo.name" />
        </div>
        <div class="room-description">
          <h3>{{ roomInfo.name }}</h3>
          <p>{{ roomInfo.description }}</p>
          <p><strong>Price:</strong> ${{ roomInfo.price_per_night }} / night</p>
          <div class="room-actions">
            <router-link to="/rooms" class="btn btn-outline">All Rooms</router-link>
            <router-link to="/bookings" class="btn btn-primary">Book Now</router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="services-section section-spacing" id="services">
      <h2>Services</h2>
      <div class="services-grid">
        <div class="service-card">
          <img src="/img/home/spa.jpg" alt="Spa service" />
          <h3>SPA & Wellness</h3>
          <p>Relax your body and mind with our full-service SPA...</p>
        </div>
        <div class="service-card">
          <img src="/img/home/pool.jpg" alt="Swimming pool" />
          <h3>Luxury Pool</h3>
          <p>Enjoy a refreshing swim in our outdoor heated pool...</p>
        </div>
      </div>
      <div class="services-action">
        <router-link to="/services" class="btn btn-outline-light">All Services</router-link>
      </div>
    </section>

    <section class="contacts-section section-spacing" id="contacts">
      <div class="contact-info">
        <h2>Contacts</h2>
        <p><strong>Address:</strong><br /> Sheptytskyi, Lviv Oblast</p>
        <p><strong>Phone:</strong><br /> +380636363636</p>
        <p>
          <strong>E-mail:</strong><br />
          <a href="mailto:thefoxriverhotel@gmail.com">thefoxriverhotel@gmail.com</a>
        </p>
      </div>
      <div class="contact-map">
        <a
            href="https://www.google.com/maps/place/%D0%9A%D0%BE%D0%BC%D1%84%D0%BE%D1%80%D1%82/@50.4034838,24.2252694,4441m/data=!3m1!1e3!4m9!3m8!1s0x4724ded8350e4e1d:0xdc351edb1125cd80!5m2!4m1!1i2!8m2!3d50.401052!4d24.2372668!16s%2Fg%2F11b6d82kdf?entry=ttu&g_ep=EgoyMDI1MDUyMS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener"
        >
          <img src="/img/home/location.jpg" alt="Our Location" />
        </a>
      </div>
    </section>

    <footer class="site-footer">
      <p>&copy; 2025 The Fox River Hotel. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showMenu = ref(false);
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const roomTypes = ref(['Standard', 'Premium', 'Vip'])
const selectedRoomType = ref('Standard')
const roomInfo = ref(null)
const error = ref(null)

const fetchRoomType = async (name) => {
  try {
    const res = await fetch(`http://localhost:8000/api/room-types/${name}/`)
    if (!res.ok) throw new Error('Failed to fetch room type')
    roomInfo.value = await res.json()
  } catch (err) {
    error.value = err.message
    console.error('Error loading room:', err)
  }
}

const selectRoom = (name) => {
  selectedRoomType.value = name
  fetchRoomType(name)
}

onMounted(() => {
  fetchRoomType(selectedRoomType.value)
})
</script>

<style scoped lang="css">
@import '../../public/css/home.css';
</style>

