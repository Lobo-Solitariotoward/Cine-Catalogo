import express, { Response } from 'express'
import Resena from '../models/mysql/Resena'
import Usuario from '../models/mysql/Usuario'
import PeliculaSerie from '../models/mysql/PeliculaSerie'
import { verificarToken, AuthRequest } from '../middlewares/auth'
import { logActivity } from '../utils/logActivity'

const router = express.Router()

// GET /api/reviews/:peliculaId
router.get('/:peliculaId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const resenas = await Resena.findAll({
            where: { pelicula_id: req.params.peliculaId },
            include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }],
            order: [['creado_en', 'DESC']]
        })
        res.json(resenas)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener reseñas' })
    }
})

// POST /api/reviews
router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { pelicula_id, texto, calificacion } = req.body
        if (!texto) return res.status(400).json({ error: 'El texto es requerido' })
        if (!pelicula_id) return res.status(400).json({ error: 'pelicula_id requerido' })

        const resena = await Resena.create({
            usuario_id: req.usuario!.id,
            pelicula_id,
            texto,
            calificacion: calificacion || 5
        })
        const pelicula = await PeliculaSerie.findByPk(pelicula_id)
        logActivity(req.usuario!.id, 'resena_crear', {
            pelicula_id,
            titulo: pelicula?.titulo,
            calificacion: calificacion || 5
        })
        res.status(201).json(resena)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al crear reseña' })
    }
})

// PUT /api/reviews/:id
router.put('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const resena = await Resena.findByPk(req.params.id)
        if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' })
        if (resena.usuario_id !== req.usuario!.id) return res.status(403).json({ error: 'Sin permiso' })

        await resena.update({ texto: req.body.texto, calificacion: req.body.calificacion })
        const pelicula = await PeliculaSerie.findByPk(resena.pelicula_id)
        logActivity(req.usuario!.id, 'resena_editar', {
            pelicula_id: resena.pelicula_id,
            titulo: pelicula?.titulo,
            calificacion: req.body.calificacion
        })
        res.json(resena)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al actualizar reseña' })
    }
})

// DELETE /api/reviews/:id
router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const resena = await Resena.findByPk(req.params.id)
        if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' })
        if (resena.usuario_id !== req.usuario!.id) return res.status(403).json({ error: 'Sin permiso' })

        const pelicula = await PeliculaSerie.findByPk(resena.pelicula_id)
        await resena.destroy()
        logActivity(req.usuario!.id, 'resena_eliminar', { pelicula_id: resena.pelicula_id, titulo: pelicula?.titulo })
        res.json({ mensaje: 'Reseña eliminada' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar reseña' })
    }
})

// PUT /api/reviews/:id/like
router.put('/:id/like', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const resena = await Resena.findByPk(req.params.id)
        if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' })
        await resena.update({ likes: resena.likes + 1 })
        res.json({ likes: resena.likes })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al dar like' })
    }
})

// GET /api/reviews/user/:userId
router.get('/user/:userId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const resenas = await Resena.findAll({
            where: { usuario_id: req.params.userId },
            order: [['creado_en', 'DESC']]
        })
        res.json(resenas)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener reseñas del usuario' })
    }
})

export default router
