import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://cine-catalogo.onrender.com/api',
    headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('cinelog_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            const url = error.config?.url || ''
            if (url.includes('/auth/')) {
                localStorage.removeItem('cinelog_token')
                localStorage.removeItem('cinelog_sesion')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
