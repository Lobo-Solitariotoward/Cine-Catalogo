import express, { Response } from 'express'
import Genero from '../models/mysql/Genero'
import { verificarToken, requireRole, AuthRequest } from '../middlewares/auth'

const router = express.Router()

router.get('/', verificarToken, async (_req: AuthRequest, res: Response) => {
    try {
        res.json(await Genero.findAll())
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener generos' })
    }
})

router.post('/', verificarToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
    try {
        const genero = await Genero.create({ nombre: req.body.nombre, descripcion: req.body.descripcion })
        res.status(201).json(genero)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al crear genero' })
    }
})

router.put('/:id', verificarToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
    try {
        await Genero.update(req.body, { where: { id: req.params.id } })
        res.json({ mensaje: 'Genero actualizado' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al actualizar genero' })
    }
})

router.delete('/:id', verificarToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
    try {
        await Genero.destroy({ where: { id: req.params.id } })
        res.json({ mensaje: 'Genero eliminado' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar genero' })
    }
})

export default router
