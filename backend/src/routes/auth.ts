import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Op } from 'sequelize'
import Usuario from '../models/mysql/Usuario'
import Notificacion from '../models/mysql/Notificacion'
import ActivityLog from '../models/mongo/ActivityLog'
import { recordBusinessMetric } from '../utils/metrics'
import { logger } from '../utils/logger'

const router = express.Router()

// Formatea fecha "27 de mayo de 2026, 19:30"
const formatearFecha = (d: Date) => {
    const fecha = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${fecha}, ${hora}`
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { nombre, email, password } = req.body
        if (!nombre || !email || !password)
            return res.status(400).json({ error: 'Todos los campos son requeridos' })

        const existe = await Usuario.findOne({ where: { email } })
        if (existe) return res.status(400).json({ error: 'El correo ya está registrado' })

        const password_hash = await bcrypt.hash(password, 10)
        const usuario = await Usuario.create({ nombre, email, password_hash })

        ActivityLog.create({ usuario_id: usuario.id, accion: 'registro', detalle: { email } }).catch(() => {})
        recordBusinessMetric('registro')

        const ahora = new Date()
        await Notificacion.bulkCreate([
            { usuario_id: usuario.id, tipo: 'sistema', mensaje: `🎉 Cuenta creada exitosamente el ${formatearFecha(ahora)}. ¡Bienvenido, ${nombre}!` },
            { usuario_id: usuario.id, tipo: 'sistema', mensaje: '🎬 Explora miles de películas y series en el catálogo.' },
            { usuario_id: usuario.id, tipo: 'sistema', mensaje: '⭐ Califica y reseña las películas que has visto.' },
        ])

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        )

        res.status(201).json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al registrar usuario' })
    }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        if (!email || !password)
            return res.status(400).json({ error: 'Correo y contraseña requeridos' })

        const usuario = await Usuario.findOne({ where: { email } })
        if (!usuario) return res.status(401).json({ error: 'Usuario no existente' })

        const valido = await bcrypt.compare(password, usuario.password_hash)
        if (!valido) {
            recordBusinessMetric('login_fallido')
            return res.status(401).json({ error: 'Contrasena incorrecta' })
        }

        ActivityLog.create({ usuario_id: usuario.id, accion: 'login', detalle: { email } }).catch(() => {})
        recordBusinessMetric('login')

        // Notificación de login: solo crear una por día (para que se acumulen pero no spameen)
        const inicioDelDia = new Date()
        inicioDelDia.setHours(0, 0, 0, 0)
        const yaHayLoginHoy = await Notificacion.findOne({
            where: {
                usuario_id: usuario.id,
                tipo: 'sistema',
                mensaje: { [Op.like]: '🔐 Iniciaste sesión%' },
                creado_en: { [Op.gte]: inicioDelDia }
            }
        })
        if (!yaHayLoginHoy) {
            const ahora = new Date()
            await Notificacion.create({
                usuario_id: usuario.id,
                tipo: 'sistema',
                mensaje: `🔐 Iniciaste sesión el ${formatearFecha(ahora)}`
            })
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        )

        res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al iniciar sesion' })
    }
})

// POST /api/auth/forgot-password — genera token de recuperacion
router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: 'Correo requerido' })

        const usuario = await Usuario.findOne({ where: { email } })
        if (!usuario) return res.json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperacion' })

        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetExpires = new Date(Date.now() + 30 * 60 * 1000)

        await usuario.update({ password_hash: `${resetToken}:${resetExpires.getTime()}` })

        logger.info({ email, token: resetToken }, 'Token de recuperacion generado')

        res.json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperacion', _debug_token: resetToken })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al procesar solicitud' })
    }
})

// POST /api/auth/reset-password — resetea contrasena con token
router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body
        if (!token || !password) return res.status(400).json({ error: 'Token y contrasena requeridos' })

        const usuarios = await Usuario.findAll()
        const usuario = usuarios.find(u => {
            const parts = u.password_hash.split(':')
            if (parts.length !== 2) return false
            const storedToken = parts[0]
            const expires = parseInt(parts[1])
            return storedToken === token && Date.now() < expires
        })

        if (!usuario) return res.status(400).json({ error: 'Token invalido o expirado' })

        const password_hash = await bcrypt.hash(password, 10)
        await usuario.update({ password_hash })

        res.json({ mensaje: 'Contrasena actualizada correctamente' })
    } catch (error: any) {
        res.status(500).json({ error: 'Error al restablecer contrasena' })
    }
})

export default router
