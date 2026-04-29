import request from '@/utils/request'

export const tiebaApi = {
  getCategories() {
    return request.get('/tiebas/categories')
  },

  getTiebas(params) {
    return request.get('/tiebas', { params })
  },

  getTieba(id) {
    return request.get(`/tiebas/${id}`)
  },

  createTieba(data) {
    return request.post('/tiebas', data)
  },

  updateTieba(id, data) {
    return request.put(`/tiebas/${id}`, data)
  },

  followTieba(id) {
    return request.post(`/tiebas/${id}/follow`)
  },

  getTiebaPosts(id, params) {
    return request.get(`/tiebas/${id}/posts`, { params })
  }
}
