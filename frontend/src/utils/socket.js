import { io } from 'socket.io-client'

let socket = null

export const connectSocket = () => {
  const token = localStorage.getItem('token')
  if (!token || socket?.connected) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
    auth: { token },
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    console.log('Socket 连接成功')
  })

  socket.on('connect_error', (err) => {
    console.error('Socket 连接失败:', err.message)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket
