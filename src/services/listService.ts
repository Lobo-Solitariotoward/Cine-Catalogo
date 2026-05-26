import api from './api'

export const obtenerLista = async (userId: number) => {
    const { data } = await api.get(`/lists/${userId}`)
    return data
}

export const agregarALista = async (pelicula_id: number, estado: string) => {
    const { data } = await api.post('/lists', { pelicula_id, estado })
    return data
}

export const actualizarLista = async (id: number, updates: any) => {
    const { data } = await api.put(`/lists/${id}`, updates)
    return data
}

export const eliminarDeLista = async (id: number) => {
    const { data } = await api.delete(`/lists/${id}`)
    return data
}
