import express, { Response } from 'express'
import Calificacion from '../models/mysql/Calificacion'
import { verificarToken, AuthRequest } from '../middlewares/auth'

const router = express.Router()

// GET /api/ratings/movie/:peliculaId — calificación promedio
router.get('/movie/:peliculaId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { sequelize } = await import('../config/mysql')
        const result = await Calificacion.findOne({
            where: { pelicula_id: req.params.peliculaId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('puntuacion')), 'promedio'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'total']
            ],
            raw: true
        }) as any
        res.json({ promedio: parseFloat(result?.promedio) || 0, total: parseInt(result?.total) || 0 })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener calificaciones', detalle: error.message })
    }
})

// GET /api/ratings/user/:peliculaId — calificación del usuario actual
router.get('/user/:peliculaId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const calif = await Calificacion.findOne({
            where: { usuario_id: req.usuario.id, pelicula_id: req.params.peliculaId }
        })
        res.json({ puntuacion: calif?.puntuacion || null })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener calificación' })
    }
})

// POST /api/ratings — crear o actualizar calificación
router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { pelicula_id, puntuacion } = req.body
        if (!pelicula_id || !puntuacion) return res.status(400).json({ error: 'pelicula_id y puntuacion requeridos' })
        if (puntuacion < 1 || puntuacion > 10) return res.status(400).json({ error: 'puntuacion debe ser entre 1 y 10' })

        const [calif, created] = await Calificacion.findOrCreate({
            where: { usuario_id: req.usuario.id, pelicula_id },
            defaults: { usuario_id: req.usuario.id, pelicula_id, puntuacion }
        })
        if (!created) await calif.update({ puntuacion })

        res.status(created ? 201 : 200).json(calif)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al guardar calificación', detalle: error.message })
    }
})

export default router
