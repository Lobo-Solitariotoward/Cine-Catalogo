import api from './api'

export interface Notificacion {
    id: number
    usuario_id: number
    tipo: 'nueva_resena' | 'like' | 'recomendacion' | 'sistema'
    mensaje: string
    leida: boolean
    creado_en: string
}

export const obtenerNotificaciones = async (userId: number): Promise<Notificacion[]> => {
    const { data } = await api.get<Notificacion[]>(`/notifications/${userId}`)
    return data
}

export const marcarComoLeida = async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}`)
}

export const eliminarNotificacion = async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`)
}

/**
 * Convierte una fecha ISO en texto relativo en español: "hace 5 min", "ayer", etc.
 */
export const tiempoRelativo = (iso: string): string => {
    const ahora = Date.now()
    const fecha = new Date(iso).getTime()
    const segs = Math.floor((ahora - fecha) / 1000)
    if (segs < 60) return 'justo ahora'
    if (segs < 3600) return `hace ${Math.floor(segs / 60)} min`
    if (segs < 86400) return `hace ${Math.floor(segs / 3600)}h`
    if (segs < 172800) return 'ayer'
    if (segs < 604800) return `hace ${Math.floor(segs / 86400)}d`
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
