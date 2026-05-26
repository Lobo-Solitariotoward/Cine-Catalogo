import express, { Response } from 'express'
import ListaUsuario from '../models/mysql/ListaUsuario'
import PeliculaSerie from '../models/mysql/PeliculaSerie'
import { verificarToken, AuthRequest } from '../middlewares/auth'

const router = express.Router()

router.get('/:userId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const listas = await ListaUsuario.findAll({
            where: { usuario_id: req.params.userId },
            include: [{ model: PeliculaSerie, as: 'pelicula' }]
        })
        res.json(listas)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener listas', detalle: error.message })
    }
})

router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { pelicula_id, estado } = req.body
        const usuario_id = req.usuario.id
        if (!pelicula_id) return res.status(400).json({ error: 'pelicula_id requerido' })

        const existe = await ListaUsuario.findOne({ where: { usuario_id, pelicula_id } })
        if (existe) {
            await existe.update({ estado: estado || existe.estado })
            return res.json(existe)
        }

        const lista = await ListaUsuario.create({ usuario_id, pelicula_id, estado: estado || 'por_ver' })
        res.status(201).json(lista)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al agregar a lista', detalle: error.message })
    }
})

router.put('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const lista = await ListaUsuario.findByPk(req.params.id)
        if (!lista) return res.status(404).json({ error: 'Entrada no encontrada' })
        if (lista.usuario_id !== req.usuario.id) return res.status(403).json({ error: 'Sin permiso' })

        await lista.update({ estado: req.body.estado, calificacion: req.body.calificacion })
        res.json(lista)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al actualizar lista', detalle: error.message })
    }
})

router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const lista = await ListaUsuario.findByPk(req.params.id)
        if (!lista) return res.status(404).json({ error: 'Entrada no encontrada' })
        if (lista.usuario_id !== req.usuario.id) return res.status(403).json({ error: 'Sin permiso' })

        await lista.destroy()
        res.json({ mensaje: 'Eliminado correctamente' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar de lista', detalle: error.message })
    }
})

export default router
