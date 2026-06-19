import express, { Response } from 'express'
import bcrypt from 'bcryptjs'
import Usuario from '../models/mysql/Usuario'
import { verificarToken, AuthRequest } from '../middlewares/auth'

const router = express.Router()

router.get('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        })
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
        res.json(usuario)
    } catch (error: any) {
        res.status(500).json({ error: 'Error al obtener usuario' })
    }
})

router.put('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        if (parseInt(req.params.id) !== req.usuario!.id)
            return res.status(403).json({ error: 'Sin permiso' })

        const { nombre, avatar_url, password } = req.body
        const updates: any = {}
        if (nombre) updates.nombre = nombre
        if (avatar_url) updates.avatar_url = avatar_url
        if (password) updates.password_hash = await bcrypt.hash(password, 10)

        await Usuario.update(updates, { where: { id: req.params.id } })
        res.json({ mensaje: 'Perfil actualizado' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al actualizar usuario' })
    }
})

router.delete('/:id', verificarToken, async (req: AuthRequest, res: Response) => {
    try {
        if (parseInt(req.params.id) !== req.usuario!.id)
            return res.status(403).json({ error: 'Sin permiso' })
        await Usuario.destroy({ where: { id: req.params.id } })
        res.json({ mensaje: 'Cuenta eliminada' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al eliminar usuario' })
    }
})

export default router
