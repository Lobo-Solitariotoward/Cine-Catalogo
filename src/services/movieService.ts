import api from './api'

export const buscarPeliculas = async (query: string, tipo: string = '') => {
    const { data } = await api.get('/movies/search', {
        params: { q: query, type: tipo }
    })
    return data.resultados
}

export const obtenerDetalle = async (imdbId: string) => {
    const { data } = await api.get(`/movies/${imdbId}`)
    return data
}

export const obtenerPeliculaMySQL = async (imdbId: string) => {
    const { data } = await api.get(`/movies/mysql/${imdbId}`)
    return data
}
