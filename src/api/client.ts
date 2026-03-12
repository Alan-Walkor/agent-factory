import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5分钟超时（Agent调用可能很慢）
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 — 可在此添加 token 等
apiClient.interceptors.request.use((config) => {
  return config
})

// 响应拦截器 — 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || '请求失败'
    console.error('[API Error]', message)
    return Promise.reject({ message, status: error.response?.status })
  }
)

export default apiClient