import express, { Response } from 'express'
import Historial from '../models/mysql/Historial'
import PeliculaSerie from '../models/mysql/PeliculaSerie'
import { verificarToken, AuthRequest } from '../middlewares/auth'

const router = express.Router()

router.get('/:userId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const historial = await Historial.findAll({
            where: { usuario_id: req.params.userId },
            include: [{ model: PeliculaSerie, as: 'pelicula' }],
            order: [['visto_en', 'DESC']]
        })
        res.json(historial)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener historial' })
    }
})

router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const entrada = await Historial.create({
            usuario_id: req.usuario.id,
            pelicula_id: req.body.pelicula_id,
            plataforma: req.body.plataforma
        })
        res.status(201).json(entrada)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al agregar al historial' })
    }
})

router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        await Historial.destroy({ where: { id: req.params.id } })
        res.json({ mensaje: 'Eliminado del historial' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar del historial' })
    }
})

export default router
