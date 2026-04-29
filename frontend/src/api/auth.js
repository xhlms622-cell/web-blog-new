import request from '@/utils/request'

export const authApi = {
  register(data) {
    return request.post('/auth/register', data)
  },

  login(data) {
    return request.post('/auth/login', data)
  },

  getProfile() {
    return request.get('/auth/profile')
  },

  refreshToken() {
    return request.post('/auth/refresh')
  }
}
