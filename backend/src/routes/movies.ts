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
        res.status(500).json({ error: 'Error al buscar películas' })
    }
})

// GET /api/movies/trailer?q=titulo+pelicula
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

        const matches = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g) || []
        const ids = matches.map((m: string) => m.replace('"videoId":"', '').replace('"', ''))
        const uniqueIds = [...new Set<string>(ids)].slice(0, 8)

        if (uniqueIds.length === 0)
            return res.status(404).json({ error: 'No se encontró tráiler' })

        res.json({ videoIds: uniqueIds, videoId: uniqueIds[0] })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al buscar tráiler' })
    }
})

// GET /api/movies/mysql/:imdbId
router.get('/mysql/:imdbId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const pelicula = await PeliculaSerie.findOne({ where: { imdb_id: req.params.imdbId } })
        if (!pelicula) return res.status(404).json({ error: 'Película no encontrada en MySQL' })
        res.json(pelicula)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener película' })
    }
})

// GET /api/movies/:imdbId — detalle completo (MongoDB + OMDb + MySQL cache)
router.get('/:imdbId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { imdbId } = req.params
        let detalle = await MovieDetail.findOne({ imdb_id: imdbId })
        let omdbData: any = null

        if (!detalle) {
            const response = await axios.get('https://www.omdbapi.com/', {
                params: { i: imdbId, plot: 'full', apikey: process.env.OMDB_KEY }
            })
            if (response.data.Response === 'False')
                return res.status(404).json({ error: 'Película no encontrada' })

            omdbData = response.data
            detalle = await MovieDetail.create({
                imdb_id: imdbId,
                titulo: omdbData.Title,
                sinopsis: omdbData.Plot,
                director: omdbData.Director,
                reparto: omdbData.Actors?.split(', ') || [],
                duracion: omdbData.Runtime,
                idioma: omdbData.Language,
                pais: omdbData.Country,
                premios: omdbData.Awards,
                tags: omdbData.Genre?.split(', ') || [],
            })
        }

        const existente = await PeliculaSerie.findOne({ where: { imdb_id: imdbId } })
        if (!existente) {
            if (!omdbData) {
                const response = await axios.get('https://www.omdbapi.com/', {
                    params: { i: imdbId, apikey: process.env.OMDB_KEY }
                })
                if (response.data.Response !== 'False') omdbData = response.data
            }
            await PeliculaSerie.create({
                imdb_id: imdbId,
                titulo: omdbData?.Title || detalle.titulo,
                tipo: omdbData?.Type === 'series' ? 'serie' : 'pelicula',
                anio: omdbData ? (parseInt(omdbData.Year) || null) : null,
                calificacion_imdb: omdbData ? (parseFloat(omdbData.imdbRating) || null) : null,
                poster_url: omdbData?.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
            })
        }

        res.json(detalle)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener película' })
    }
})

export default router
