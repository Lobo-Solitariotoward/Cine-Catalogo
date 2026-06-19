import express, { Response } from 'express'
import ListaUsuario from '../models/mysql/ListaUsuario'
import PeliculaSerie from '../models/mysql/PeliculaSerie'
import Historial from '../models/mysql/Historial'
import { verificarToken, AuthRequest } from '../middlewares/auth'
import { logActivity } from '../utils/logActivity'

const router = express.Router()

/**
 * Crea una entrada en Historial si no existe ya una para esta peli/usuario.
 * Se llama cuando una película pasa a estado "visto" en Mi Lista.
 */
const asegurarHistorial = async (usuario_id: number, pelicula_id: number, plataforma: string = 'Otro') => {
    const ya = await Historial.findOne({ where: { usuario_id, pelicula_id } })
    if (ya) return ya
    return Historial.create({ usuario_id, pelicula_id, plataforma })
}

router.get('/:userId', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        if (Number.parseInt(req.params.userId, 10) !== req.usuario!.id) {
            return res.status(403).json({ error: 'Sin permiso' })
        }
        const listas = await ListaUsuario.findAll({
            where: { usuario_id: req.usuario!.id },
            include: [{ model: PeliculaSerie, as: 'pelicula' }]
        })
        res.json(listas)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener listas' })
    }
})

router.post('/', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const { pelicula_id, estado } = req.body
        const usuario_id = req.usuario!.id
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
        res.status(500).json({ error: 'Error al agregar a lista' })
    }
})

router.put('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const lista = await ListaUsuario.findByPk(req.params.id)
        if (!lista) return res.status(404).json({ error: 'Entrada no encontrada' })
        if (lista.usuario_id !== req.usuario!.id) return res.status(403).json({ error: 'Sin permiso' })

        const estadoAnterior = lista.estado
        await lista.update({ estado: req.body.estado, calificacion: req.body.calificacion })
        const pelicula = await PeliculaSerie.findByPk(lista.pelicula_id)
        logActivity(req.usuario!.id, 'lista_actualizar', {
            pelicula_id: lista.pelicula_id,
            titulo: pelicula?.titulo,
            estado_anterior: estadoAnterior,
            estado_nuevo: req.body.estado
        })

        // Si la película pasa a "visto", crear entrada en historial con la plataforma elegida
        if (req.body.estado === 'visto' && estadoAnterior !== 'visto') {
            const plataforma = req.body.plataforma || 'Otro'
            await asegurarHistorial(req.usuario!.id, lista.pelicula_id, plataforma)
            logActivity(req.usuario!.id, 'historial_agregar', {
                pelicula_id: lista.pelicula_id,
                titulo: pelicula?.titulo,
                plataforma,
                origen: 'mi_lista'
            })
        }

        res.json(lista)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al actualizar lista' })
    }
})

/**
 * POST /api/lists/sync-historial
 * Crea entradas en Historial para todas las películas marcadas como "visto"
 * en Mi Lista que aún no tengan entrada en Historial. Útil para backfill.
 */
router.post('/sync-historial', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const plataforma = req.body.plataforma || 'Otro'
        const vistos = await ListaUsuario.findAll({
            where: { usuario_id: req.usuario!.id, estado: 'visto' }
        })

        let creadas = 0
        for (const item of vistos) {
            const yaExiste = await Historial.findOne({
                where: { usuario_id: req.usuario!.id, pelicula_id: item.pelicula_id }
            })
            if (!yaExiste) {
                await Historial.create({
                    usuario_id: req.usuario!.id,
                    pelicula_id: item.pelicula_id,
                    plataforma
                })
                creadas++
            }
        }

        res.json({ creadas, total_vistos: vistos.length })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al sincronizar' })
    }
})

router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const lista = await ListaUsuario.findByPk(req.params.id)
        if (!lista) return res.status(404).json({ error: 'Entrada no encontrada' })
        if (lista.usuario_id !== req.usuario!.id) return res.status(403).json({ error: 'Sin permiso' })

        const pelicula = await PeliculaSerie.findByPk(lista.pelicula_id)
        await lista.destroy()
        logActivity(req.usuario!.id, 'lista_eliminar', { pelicula_id: lista.pelicula_id, titulo: pelicula?.titulo })
        res.json({ mensaje: 'Eliminado correctamente' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar de lista' })
    }
})

export default router
