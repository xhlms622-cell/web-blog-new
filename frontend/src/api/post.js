import request from '@/utils/request'

export const postApi = {
  getPosts(params) {
    return request.get('/posts', { params })
  },

  createPost(data) {
    return request.post('/posts', data)
  },

  getPost(id) {
    return request.get(`/posts/${id}`)
  },

  updatePost(id, data) {
    return request.put(`/posts/${id}`, data)
  },

  likePost(id) {
    return request.post(`/posts/${id}/like`)
  },

  favoritePost(id) {
    return request.post(`/posts/${id}/favorite`)
  },

  getMyPosts(params) {
    return request.get('/posts/my', { params })
  },

  getMyFavorites(params) {
    return request.get('/posts/my/favorites', { params })
  },

  getComments(postId, params) {
    return request.get(`/posts/${postId}/comments`, { params })
  },

  createComment(postId, data) {
    return request.post(`/posts/${postId}/comments`, data)
  },

  createReply(data) {
    return request.post('/comments/reply', data)
  },

  deletePost(id) {
    return request.delete(`/posts/${id}`)
  },

  getHotPosts(params) {
    return request.get('/posts/hot', { params })
  }
}
