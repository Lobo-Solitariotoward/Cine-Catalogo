import api from './api'

export const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('cinelog_token', data.token)
    return data.usuario
}

export const register = async (nombre: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { nombre, email, password })
    localStorage.setItem('cinelog_token', data.token)
    return data.usuario
}

export const logout = () => {
    localStorage.removeItem('cinelog_token')
    localStorage.removeItem('cinelog_sesion')
}

export const getToken = () => localStorage.getItem('cinelog_token')
