import request from '@/utils/request'

export const postApi = {
  getPosts(params) {
    return request.get('/posts', { params })
  }
}
