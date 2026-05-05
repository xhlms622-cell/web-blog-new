import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadCount } from '@/api/notification'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      unreadCount.value = res.data.count
    } catch {
      // ignore
    }
  }

  const decrement = () => {
    if (unreadCount.value > 0) unreadCount.value--
  }

  const clearCount = () => {
    unreadCount.value = 0
  }

  return { unreadCount, fetchUnreadCount, decrement, clearCount }
})
