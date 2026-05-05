import request from '@/utils/request'

export const createReport = (data) => {
  return request.post('/reports', data)
}
