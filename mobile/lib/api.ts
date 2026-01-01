// API 基础配置
// 开发环境使用本地服务器，生产环境使用远程服务器
export const API_BASE_URL = __DEV__
  ? 'http://192.168.88.233:3001/api'
  : 'https://menu.commitme.top/api'

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!res.ok) throw new Error('请求失败')
    return res.json()
  },
  post: async (endpoint: string, data: unknown) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('请求失败')
    return res.json()
  },
  put: async (endpoint: string, data: unknown) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('请求失败')
    return res.json()
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('请求失败')
    return res.json()
  },
}
