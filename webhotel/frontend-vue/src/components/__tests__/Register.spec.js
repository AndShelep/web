import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Register from '@/components/Register.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/config/api', () => ({
  API_BASE: 'http://localhost:8000/api'
}))

const pushMock = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock
    })
  }
})

describe('Register.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()

    wrapper = mount(Register, {
      global: {
        plugins: [
          createRouter({
            history: createMemoryHistory(),
            routes: [{ path: '/login', component: { template: '<div>Login</div>' } }]
          })
        ]
      }
    })
  })

  it('renders all form fields', () => {
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#phone').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#confirmPassword').exists()).toBe(true)
  })

  it('shows error if passwords do not match', async () => {
    await wrapper.find('#password').setValue('pass123')
    await wrapper.find('#confirmPassword').setValue('different')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.find('.error').text()).toContain('Passwords do not match.')
  })

  it('redirects to /login on successful registration', async () => {
    fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    )

    await wrapper.find('#firstName').setValue('John')
    await wrapper.find('#lastName').setValue('Doe')
    await wrapper.find('#username').setValue('johndoe')
    await wrapper.find('#email').setValue('john@example.com')
    await wrapper.find('#phone').setValue('1234567890')
    await wrapper.find('#password').setValue('pass123')
    await wrapper.find('#confirmPassword').setValue('pass123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('displays backend error messages', async () => {
    fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            username: ['This username is already taken.'],
            email: ['Invalid email address.']
          })
      })
    )

    await wrapper.find('#username').setValue('usedname')
    await wrapper.find('#password').setValue('pass123')
    await wrapper.find('#confirmPassword').setValue('pass123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.error').text()).toContain('username: This username is already taken.')
    expect(wrapper.find('.error').text()).toContain('email: Invalid email address.')
  })
})
