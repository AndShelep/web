import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SubmitBooking from '@/components/SubmitBooking.vue'
import { createRouter, createMemoryHistory, useRoute } from 'vue-router'

vi.mock('@/config/api', () => ({
  API_BASE: 'http://localhost:8000/api'
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({
      query: {
        name: 'Premium',
        image: '/img/rooms/premium1.jpg',
        check_in: '2025-06-10',
        check_out: '2025-06-12',
        guests: 2,
        total: 400,
        room_type_id: 1
      }
    })
  }
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
})

describe('SubmitBooking.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'mock-token')
    })

    wrapper = mount(SubmitBooking, {
      global: {
        plugins: [router]
      }
    })
  })

  it('renders form and booking summary', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('.summary__heading').text()).toContain('Your Booking')
    expect(wrapper.find('.summary__details').text()).toContain('Premium')
  })

  it('binds input fields with form state', async () => {
    const firstNameInput = wrapper.findAll('input')[0]
    await firstNameInput.setValue('John')
    expect(wrapper.vm.form.firstName).toBe('John')
  })

  it('sends booking data and redirects on success', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

    await wrapper.findAll('input')[0].setValue('John') 
    await wrapper.findAll('input')[1].setValue('Doe') 
    await wrapper.findAll('input')[2].setValue('123456789') 
    await wrapper.findAll('input')[3].setValue('john@example.com') 

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/bookings/create/',
      expect.objectContaining({
        method: 'POST'
      })
    )
  })

  it('shows error message if booking fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('Booking failed')
    })

    await wrapper.findAll('input')[0].setValue('Fail')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.find('.error').text()).toContain('Booking failed')
  })

  it('fetches user info on mount if token exists', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            first_name: 'Anna',
            last_name: 'Smith',
            email: 'anna@example.com',
            phone: '555-123'
          })
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

    wrapper = mount(SubmitBooking, {
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    expect(wrapper.vm.form.firstName).toBe('Anna')
    expect(wrapper.vm.form.lastName).toBe('Smith')
    expect(wrapper.vm.form.email).toBe('anna@example.com')
    expect(wrapper.vm.form.phone).toBe('555-123')
  })
})
