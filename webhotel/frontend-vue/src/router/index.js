import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Register from "@/components/Register.vue";
import Login from "@/components/Login.vue";
import Profile from '@/components/Profile.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/register', name: 'Register', component: Register },
    { path: '/login', name: 'Login', component: Login },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/users',
        name: 'AdminUsers',
        component: () => import('@/components/UserList.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/users/:id',
        name: 'AdminUserEdit',
        component: () => import('@/components/UserEdit.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/rooms',
        name: 'Rooms',
        component: () => import('@/components/RoomList.vue'),
    },
    {
        path: '/admin/room-types/:id',
        name: 'EditRoomType',
        component: () => import('@/components/EditRoomType.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/bookings',
        name: 'BookRoom',
        component: () => import('@/components/BookRoom.vue'),
    },
    {
        path: '/book-room/:id',
        name: 'SubmitBooking',
        component: () => import('@/components/SubmitBooking.vue'),
    },
    {
        path: '/user/bookings',
        name: 'UserBookings',
        component: () => import('@/components/UserBookings.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/bookings/payment',
        name: 'payment',
        component: () => import('@/components/Payment.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('access_token')
    console.log('routing to:', to.name, '| token:', token)

    if (to.meta.requiresAuth && !token) {
        console.log('🔒 redirect to login')
        return next({ name: 'Login' })
    }

    if ((to.name === 'Login' || to.name === 'Register') && token) {
        console.log('✅ already logged in — redirect to profile')
        return next({ name: 'Profile' })
    }

    next()
})

export default router
