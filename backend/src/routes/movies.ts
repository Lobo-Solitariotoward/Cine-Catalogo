import express, { Response } from 'express'
import axios from 'axios'
import PeliculaSerie from '../models/mysql/PeliculaSerie'
import MovieDetail from '../models/mongo/MovieDetail'
import { verificarToken, AuthRequest } from '../middlewares/auth'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

// GET /api/movies/search?q=inception
router.get('/search', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { q, type } = req.query as { q?: string; type?: string }
        if (!q) return res.status(400).json({ error: 'Parámetro q requerido' })

        const params: any = { s: q, apikey: process.env.OMDB_KEY }
        if (type) params.type = type

        const response = await axios.get('https://www.omdbapi.com/', { params })
        if (response.data.Response === 'False') return res.json({ resultados: [] })

        res.json({ resultados: response.data.Search || [] })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al buscar películas', detalle: error.message })
    }
})

// GET /api/movies/trailer?q=titulo+pelicula
// Busca el ID real del video en YouTube sin necesitar API key
router.get('/trailer', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { q } = req.query as { q?: string }
        if (!q) return res.status(400).json({ error: 'Parámetro q requerido' })

        const query = encodeURIComponent(q + ' trailer oficial')
        const { data } = await axios.get(`https://www.youtube.com/results?search_query=${query}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es-MX,es;q=0.9',
            },
            timeout: 8000
        })

        // YouTube embeds los video IDs en el HTML como "videoId":"XXXXXXXXXXX"
        const matches = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g) || []
        const ids = matches.map((m: string) => m.replace('"videoId":"', '').replace('"', ''))
        // Deduplica y se queda con los 8 primeros como candidatos
        const uniqueIds = [...new Set<string>(ids)].slice(0, 8)

        if (uniqueIds.length === 0)
            return res.status(404).json({ error: 'No se encontró tráiler' })

        // Devuelve array de candidatos + videoId (el primero) para retrocompatibilidad
        res.json({ videoIds: uniqueIds, videoId: uniqueIds[0] })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al buscar tráiler', detalle: error.message })
    }
})

// GET /api/movies/mysql/:imdbId
router.get('/mysql/:imdbId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const pelicula = await PeliculaSerie.findOne({ where: { imdb_id: req.params.imdbId } })
        if (!pelicula) return res.status(404).json({ error: 'Película no encontrada en MySQL' })
        res.json(pelicula)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener película', detalle: error.message })
    }
})

// GET /api/movies/:imdbId — detalle completo (MongoDB + OMDb)
router.get('/:imdbId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { imdbId } = req.params
        let detalle = await MovieDetail.findOne({ imdb_id: imdbId })

        if (!detalle) {
            const response = await axios.get('https://www.omdbapi.com/', {
                params: { i: imdbId, plot: 'full', apikey: process.env.OMDB_KEY }
            })
            if (response.data.Response === 'False')
                return res.status(404).json({ error: 'Película no encontrada' })

            const data = response.data
            detalle = await MovieDetail.create({
                imdb_id: imdbId,
                titulo: data.Title,
                sinopsis: data.Plot,
                director: data.Director,
                reparto: data.Actors?.split(', ') || [],
                duracion: data.Runtime,
                idioma: data.Language,
                pais: data.Country,
                premios: data.Awards,
                tags: data.Genre?.split(', ') || [],
            })

            await PeliculaSerie.findOrCreate({
                where: { imdb_id: imdbId },
                defaults: {
                    titulo: data.Title,
                    tipo: data.Type === 'series' ? 'serie' : 'pelicula',
                    anio: parseInt(data.Year) || null,
                    calificacion_imdb: parseFloat(data.imdbRating) || null,
                    poster_url: data.Poster !== 'N/A' ? data.Poster : null,
                }
            })
        }

        res.json(detalle)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener película', detalle: error.message })
    }
})

export default router
