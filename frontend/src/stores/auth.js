import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { disconnectSocket } from '@/utils/socket'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(credentials) {
    try {
      const res = await authApi.login(credentials)
      setAuth(res.data)
      return res
    } catch (error) {
      throw error
    }
  }

  async function register(data) {
    try {
      const res = await authApi.register(data)
      setAuth(res.data)
      return res
    } catch (error) {
      throw error
    }
  }

  function logout() {
    disconnectSocket()
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  async function fetchProfile() {
    try {
      const res = await authApi.getProfile()
      user.value = res.data
      return res
    } catch (error) {
      logout()
      throw error
    }
  }

  function setAuth(data) {
    user.value = data.user
    token.value = data.token
    refreshToken.value = data.refreshToken
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  return {
    user,
    token,
    refreshToken,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
    setAuth
  }
})
