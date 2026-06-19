import express, { Response } from 'express'
import ActivityLog from '../models/mongo/ActivityLog'
import { verificarToken, AuthRequest } from '../middlewares/auth'

const router = express.Router()

/**
 * GET /api/activity/me?limit=20&skip=0
 * Devuelve la actividad reciente del usuario actual, ordenada de más nueva a más vieja.
 */
router.get('/me', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
        const skip = Math.max(parseInt(req.query.skip as string) || 0, 0)

        const [logs, total] = await Promise.all([
            ActivityLog.find({ usuario_id: req.usuario!.id })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ActivityLog.countDocuments({ usuario_id: req.usuario!.id })
        ])

        res.json({ logs, total, limit, skip })
    } catch (error: any) {
        // Si MongoDB no está disponible, devolver vacío en lugar de error
        res.json({ logs: [], total: 0, limit: 20, skip: 0 })
    }
})

export default router
