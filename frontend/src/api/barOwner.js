import request from '@/utils/request'

export const barOwnerApi = {
  getDashboard(tiebaId) {
    return request.get(`/tiebas/${tiebaId}/owner/dashboard`)
  },

  getTiebaInfo(tiebaId) {
    return request.get(`/tiebas/${tiebaId}/owner/info`)
  },

  updateTiebaInfo(tiebaId, data) {
    return request.put(`/tiebas/${tiebaId}/owner/info`, data)
  },

  getPosts(tiebaId, params) {
    return request.get(`/tiebas/${tiebaId}/owner/posts`, { params })
  },

  updatePost(tiebaId, postId, data) {
    return request.put(`/tiebas/${tiebaId}/owner/posts/${postId}`, data)
  },

  getMembers(tiebaId, params) {
    return request.get(`/tiebas/${tiebaId}/owner/members`, { params })
  },

  getReports(tiebaId, params) {
    return request.get(`/tiebas/${tiebaId}/owner/reports`, { params })
  },

  handleReport(tiebaId, reportId, data) {
    return request.put(`/tiebas/${tiebaId}/owner/reports/${reportId}`, data)
  }
}
