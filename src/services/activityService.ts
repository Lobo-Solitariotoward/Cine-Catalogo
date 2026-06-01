import api from './api'

export interface ActivityLogEntry {
    _id: string
    usuario_id: number
    accion: string
    detalle: {
        titulo?: string
        pelicula_id?: number
        plataforma?: string
        calificacion?: number
        puntuacion?: number
        estado?: string
        estado_anterior?: string
        estado_nuevo?: string
        email?: string
    }
    timestamp: string
}

export interface ActividadResponse {
    logs: ActivityLogEntry[]
    total: number
    limit: number
    skip: number
}

/**
 * Obtiene la actividad reciente del usuario actual.
 */
export const obtenerActividad = async (limit = 20, skip = 0): Promise<ActividadResponse> => {
    const { data } = await api.get<ActividadResponse>('/activity/me', { params: { limit, skip } })
    return data
}
