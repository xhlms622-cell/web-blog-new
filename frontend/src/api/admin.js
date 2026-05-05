import request from '@/utils/request'

// Dashboard
export const getDashboard = () => {
  return request.get('/admin/dashboard')
}

// 用户管理
export const getAdminUsers = (params) => {
  return request.get('/admin/users', { params })
}

export const updateUserStatus = (id, status) => {
  return request.put(`/admin/users/${id}/status`, { status })
}

export const updateUserRole = (id, role) => {
  return request.put(`/admin/users/${id}/role`, { role })
}

// 贴吧管理
export const getAdminTiebas = (params) => {
  return request.get('/admin/tiebas', { params })
}

export const updateTiebaStatus = (id, status) => {
  return request.put(`/admin/tiebas/${id}/status`, { status })
}

// 帖子管理
export const getAdminPosts = (params) => {
  return request.get('/admin/posts', { params })
}

export const updatePostStatus = (id, data) => {
  return request.put(`/admin/posts/${id}/status`, data)
}

// 举报管理
export const getAdminReports = (params) => {
  return request.get('/admin/reports', { params })
}

export const handleReport = (id, data) => {
  return request.put(`/admin/reports/${id}`, data)
}

// 分类管理
export const getAdminCategories = () => {
  return request.get('/admin/categories')
}

export const createCategory = (data) => {
  return request.post('/admin/categories', data)
}

export const updateCategory = (id, data) => {
  return request.put(`/admin/categories/${id}`, data)
}

export const deleteCategory = (id) => {
  return request.delete(`/admin/categories/${id}`)
}
