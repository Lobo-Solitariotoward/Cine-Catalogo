import express, { Response } from 'express'
import Genero from '../models/mysql/Genero'
import { verificarToken, AuthRequest } from '../middlewares/auth'

const router = express.Router()

router.get('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        res.json(await Genero.findAll())
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener géneros' })
    }
})

router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const genero = await Genero.create({ nombre: req.body.nombre, descripcion: req.body.descripcion })
        res.status(201).json(genero)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al crear género' })
    }
})

router.put('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        await Genero.update(req.body, { where: { id: req.params.id } })
        res.json({ mensaje: 'Género actualizado' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al actualizar género' })
    }
})

router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        await Genero.destroy({ where: { id: req.params.id } })
        res.json({ mensaje: 'Género eliminado' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar género' })
    }
})

export default router
