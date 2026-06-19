import express, { Response } from 'express'
import Historial from '../models/mysql/Historial'
import PeliculaSerie from '../models/mysql/PeliculaSerie'
import { verificarToken, AuthRequest } from '../middlewares/auth'
import { logActivity } from '../utils/logActivity'

const router = express.Router()

router.get('/:userId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        if (Number.parseInt(req.params.userId, 10) !== req.usuario!.id) {
            return res.status(403).json({ error: 'Sin permiso' })
        }
        const historial = await Historial.findAll({
            where: { usuario_id: req.usuario!.id },
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
            usuario_id: req.usuario!.id,
            pelicula_id: req.body.pelicula_id,
            plataforma: req.body.plataforma
        })
        const pelicula = await PeliculaSerie.findByPk(req.body.pelicula_id)
        logActivity(req.usuario!.id, 'historial_agregar', {
            pelicula_id: req.body.pelicula_id,
            titulo: pelicula?.titulo,
            plataforma: req.body.plataforma
        })
        res.status(201).json(entrada)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al agregar al historial' })
    }
})

router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const entrada = await Historial.findByPk(req.params.id)
        if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' })
        if (entrada.usuario_id !== req.usuario!.id) return res.status(403).json({ error: 'Sin permiso' })
        const pelicula = entrada ? await PeliculaSerie.findByPk(entrada.pelicula_id) : null
        await Historial.destroy({ where: { id: req.params.id } })
        if (entrada) {
            logActivity(req.usuario!.id, 'historial_eliminar', {
                pelicula_id: entrada.pelicula_id,
                titulo: pelicula?.titulo
            })
        }
        res.json({ mensaje: 'Eliminado del historial' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar del historial' })
    }
})

export default router
