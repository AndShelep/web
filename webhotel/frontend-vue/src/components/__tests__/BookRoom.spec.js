import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BookRoom from '@/components/BookRoom.vue'

vi.mock('@/config/api', () => ({
  API_BASE: 'http://localhost:8000/api'
}))

const mockRooms = [
  {
    id: 1,
    name: 'Standard',
    description: 'Cozy and elegant.',
    price_per_night: 100,
    image: '/img/rooms/standard.jpg'
  }
]

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockRooms)
  })
)

describe('BookRoom.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(BookRoom)
  })

  it('renders form inputs correctly', () => {
    expect(wrapper.find('#checkin').exists()).toBe(true)
    expect(wrapper.find('#checkout').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
  })

  it('increments and decrements guest count', async () => {
    const plusBtn = wrapper.findAll('.guest-btn')[1]
    const minusBtn = wrapper.findAll('.guest-btn')[0]
    const guestInput = wrapper.find('input[type="number"]')

    expect(guestInput.element.value).toBe('2')

    await plusBtn.trigger('click')
    expect(guestInput.element.value).toBe('3')

    await minusBtn.trigger('click')
    expect(guestInput.element.value).toBe('2')
  })

  it('calls API and renders room cards on form submit', async () => {
    await wrapper.find('#checkin').setValue('2025-06-10')
    await wrapper.find('#checkout').setValue('2025-06-12')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/available-room-types/?check_in_date=2025-06-10&check_out_date=2025-06-12'
    )

    expect(wrapper.find('.room-card').exists()).toBe(true)
    expect(wrapper.find('.room-card__title').text()).toContain('Standard')
  })

  it('calculates total price correctly for 2 nights', async () => {
    wrapper.vm.checkin = '2025-06-01'
    wrapper.vm.checkout = '2025-06-03'
    const total = wrapper.vm.calculateTotal(100)
    expect(total).toBe(200)
  })
})
