import request from '@/utils/request'

export const searchApi = {
  search(params) {
    return request.get('/search', { params })
  }
}
