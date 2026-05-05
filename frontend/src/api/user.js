import request from '@/utils/request'

export const userApi = {
  getProfile(id) {
    return request.get(`/users/${id}`)
  },

  getUserPosts(id, params) {
    return request.get(`/users/${id}/posts`, { params })
  },

  updateProfile(data) {
    return request.put('/users/profile', data)
  },

  changePassword(data) {
    return request.post('/users/password', data)
  },

  followUser(id) {
    return request.post(`/users/${id}/follow`)
  },

  getFollowers(id, params) {
    return request.get(`/users/${id}/followers`, { params })
  },

  getFollowing(id, params) {
    return request.get(`/users/${id}/following`, { params })
  }
}
