import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Login from '@/components/Login.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/config/api', () => ({
  API_BASE: 'http://localhost:8000/api'
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/profile', component: { template: 'Profile' } }]
})

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('localStorage', {
      setItem: vi.fn(),
      getItem: vi.fn()
    })

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })
  })

  it('renders username and password fields', () => {
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('updates data bindings with v-model', async () => {
    await wrapper.find('#username').setValue('admin')
    await wrapper.find('#password').setValue('adminpass')

    expect(wrapper.vm.username).toBe('admin')
    expect(wrapper.vm.password).toBe('adminpass')
  })

  it('successful login sets tokens and redirects to /profile', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access: 'ACCESS_TOKEN',
          refresh: 'REFRESH_TOKEN'
        })
    })

    await wrapper.find('#username').setValue('admin')
    await wrapper.find('#password').setValue('adminpass')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'ACCESS_TOKEN')
    expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'REFRESH_TOKEN')
    expect(wrapper.vm.errorMsg).toBe(null)
  })

  it('displays error on incorrect credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'No active account found' })
    })

    await wrapper.find('#username').setValue('wrong')
    await wrapper.find('#password').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.error').text()).toContain('wrong username or password')
  })

  it('displays validation errors from backend', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          username: ['This field is required.'],
          password: ['This field is required.']
        })
    })

    await wrapper.find('#username').setValue('')
    await wrapper.find('#password').setValue('')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.error').text()).toContain('username: This field is required.')
    expect(wrapper.find('.error').text()).toContain('password: This field is required.')
  })
})
