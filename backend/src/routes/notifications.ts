import express, { Response } from 'express'
import Notificacion from '../models/mysql/Notificacion'
import { verificarToken, AuthRequest } from '../middlewares/auth'

const router = express.Router()

router.get('/:userId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const notifs = await Notificacion.findAll({
            where: { usuario_id: req.params.userId },
            order: [['creado_en', 'DESC']]
        })
        res.json(notifs)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener notificaciones' })
    }
})

router.put('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        await Notificacion.update({ leida: true }, { where: { id: req.params.id } })
        res.json({ mensaje: 'Notificación marcada como leída' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al actualizar notificación' })
    }
})

router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        await Notificacion.destroy({ where: { id: req.params.id } })
        res.json({ mensaje: 'Notificación eliminada' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar notificación' })
    }
})

export default router
