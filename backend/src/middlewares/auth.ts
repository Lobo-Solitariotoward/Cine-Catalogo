import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export interface AuthRequest extends Request {
    usuario?: any
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        req.usuario = decoded
        next()
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' })
    }
}
