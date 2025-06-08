import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Home from '@/components/Home.vue'

const mockRoom = {
  name: 'Standard Room',
  description: 'A cozy and comfortable room.',
  price_per_night: 100,
  image: '/img/rooms/standard.jpg'
}

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockRoom)
  })
)

describe('Home.vue', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = mount(Home)
    await flushPromises() 
  })

  it('renders the hotel title', () => {
    expect(wrapper.find('.site-title').text()).toBe('The Fox River')
  })

  it('renders room type buttons', () => {
    const buttons = wrapper.findAll('.room-type')
    expect(buttons).toHaveLength(3)
    expect(buttons.map(b => b.text())).toEqual(['Standard', 'Premium', 'Vip'])
  })

  it('loads and displays room info on mount', () => {
    expect(wrapper.find('.room-description h3').text()).toBe(mockRoom.name)
    expect(wrapper.find('.room-description p').text()).toContain(mockRoom.description)
  })

  it('calls fetchRoomType on button click', async () => {
    fetch.mockClear()
    await wrapper.findAll('.room-type')[1].trigger('click')
    await flushPromises()
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/room-types/Premium/')
  })
})
