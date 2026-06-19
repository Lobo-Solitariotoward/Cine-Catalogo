import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export interface AuthPayload {
    id: number
    email: string
    nombre: string
    rol: 'admin' | 'user'
    iat?: number
    exp?: number
}

export interface AuthRequest extends Request {
    usuario?: AuthPayload
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' })
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload
        next()
    } catch {
        return res.status(403).json({ error: 'Token invalido o expirado' })
    }
}

export const requireRole = (...roles: Array<'admin' | 'user'>) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.usuario) {
            return res.status(401).json({ error: 'Token requerido' })
        }
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'No tienes permiso para realizar esta accion' })
        }
        next()
    }
}

export const requireUserId = (req: AuthRequest): number => {
    if (!req.usuario) throw new Error('Usuario autenticado requerido')
    return req.usuario.id
}
