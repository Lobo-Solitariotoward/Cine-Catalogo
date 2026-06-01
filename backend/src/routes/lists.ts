import express, { Response } from 'express'
import ListaUsuario from '../models/mysql/ListaUsuario'
import PeliculaSerie from '../models/mysql/PeliculaSerie'
import { verificarToken, AuthRequest } from '../middlewares/auth'
import { logActivity } from '../utils/logActivity'

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

        const pelicula = await PeliculaSerie.findByPk(pelicula_id)
        const titulo = pelicula?.titulo

        const existe = await ListaUsuario.findOne({ where: { usuario_id, pelicula_id } })
        if (existe) {
            const estadoAnterior = existe.estado
            await existe.update({ estado: estado || existe.estado })
            if (estado && estado !== estadoAnterior) {
                logActivity(usuario_id, 'lista_actualizar', { pelicula_id, titulo, estado_anterior: estadoAnterior, estado_nuevo: estado })
            }
            return res.json(existe)
        }

        const lista = await ListaUsuario.create({ usuario_id, pelicula_id, estado: estado || 'por_ver' })
        logActivity(usuario_id, 'lista_agregar', { pelicula_id, titulo, estado: estado || 'por_ver' })
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

        const estadoAnterior = lista.estado
        await lista.update({ estado: req.body.estado, calificacion: req.body.calificacion })
        const pelicula = await PeliculaSerie.findByPk(lista.pelicula_id)
        logActivity(req.usuario.id, 'lista_actualizar', {
            pelicula_id: lista.pelicula_id,
            titulo: pelicula?.titulo,
            estado_anterior: estadoAnterior,
            estado_nuevo: req.body.estado
        })
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

        const pelicula = await PeliculaSerie.findByPk(lista.pelicula_id)
        await lista.destroy()
        logActivity(req.usuario.id, 'lista_eliminar', { pelicula_id: lista.pelicula_id, titulo: pelicula?.titulo })
        res.json({ mensaje: 'Eliminado correctamente' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar de lista', detalle: error.message })
    }
})

export default router
