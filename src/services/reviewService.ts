import api from './api'

export const obtenerResenas = async (peliculaId: number) => {
    const { data } = await api.get(`/reviews/${peliculaId}`)
    return data
}

export const crearResena = async (pelicula_id: number, texto: string, calificacion: number) => {
    const { data } = await api.post('/reviews', { pelicula_id, texto, calificacion })
    return data
}

export const actualizarResena = async (id: number, texto: string, calificacion: number) => {
    const { data } = await api.put(`/reviews/${id}`, { texto, calificacion })
    return data
}

export const eliminarResena = async (id: number) => {
    const { data } = await api.delete(`/reviews/${id}`)
    return data
}

export const darLike = async (id: number) => {
    const { data } = await api.put(`/reviews/${id}/like`)
    return data
}
