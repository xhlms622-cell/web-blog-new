import request from '@/utils/request'

export const levelApi = {
  getLevelInfo() {
    return request.get('/level/info')
  },
  getExpHistory(params) {
    return request.get('/level/history', { params })
  },
  getRules() {
    return request.get('/level/rules')
  },
  checkIn() {
    return request.post('/level/checkin')
  }
}
