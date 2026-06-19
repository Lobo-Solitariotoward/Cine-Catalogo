import { describe, expect, it, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { verificarToken, requireRole } from '../src/middlewares/auth'

const JWT_SECRET = 'test_secret'
process.env.JWT_SECRET = JWT_SECRET

const mockReq = (authHeader?: string) => ({
    headers: { authorization: authHeader },
}) as any

const mockRes = () => {
    const res: any = {}
    res.status = vi.fn().mockReturnValue(res)
    res.json = vi.fn().mockReturnValue(res)
    return res
}

const mockNext = vi.fn()

describe('verificarToken', () => {
    beforeEach(() => {
        mockNext.mockClear()
    })
    it('retorna 401 cuando no hay token', () => {
        const req = mockReq()
        const res = mockRes()
        verificarToken(req, res, mockNext)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' })
    })

    it('retorna 403 cuando el token es invalido', () => {
        const req = mockReq('Bearer token_invalido')
        const res = mockRes()
        verificarToken(req, res, mockNext)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({ error: 'Token invalido o expirado' })
    })

    it('retorna 403 cuando el token esta expirado', () => {
        const token = jwt.sign({ id: 1, email: 'a@b.com', nombre: 'Test', rol: 'user' }, JWT_SECRET, { expiresIn: '-1s' })
        const req = mockReq(`Bearer ${token}`)
        const res = mockRes()
        verificarToken(req, res, mockNext)
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('llama next y adjunta usuario cuando el token es valido', () => {
        const payload = { id: 1, email: 'a@b.com', nombre: 'Test', rol: 'user' }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
        const req = mockReq(`Bearer ${token}`)
        const res = mockRes()
        verificarToken(req, res, mockNext)
        expect(mockNext).toHaveBeenCalled()
        expect(req.usuario).toBeDefined()
        expect(req.usuario.id).toBe(1)
        expect(req.usuario.rol).toBe('user')
    })
})

describe('requireRole', () => {
    it('retorna 401 cuando no hay usuario autenticado', () => {
        const req = mockReq()
        req.usuario = undefined
        const res = mockRes()
        const middleware = requireRole('admin')
        middleware(req, res, mockNext)
        expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retorna 403 cuando el rol no esta permitido', () => {
        const req = mockReq()
        req.usuario = { id: 1, email: 'a@b.com', nombre: 'Test', rol: 'user' }
        const res = mockRes()
        const middleware = requireRole('admin')
        middleware(req, res, mockNext)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({ error: 'No tienes permiso para realizar esta accion' })
    })

    it('llama next cuando el rol esta permitido', () => {
        const req = mockReq()
        req.usuario = { id: 1, email: 'a@b.com', nombre: 'Test', rol: 'admin' }
        const res = mockRes()
        const middleware = requireRole('admin')
        middleware(req, res, mockNext)
        expect(mockNext).toHaveBeenCalled()
    })

    it('acepta multiples roles permitidos', () => {
        const req = mockReq()
        req.usuario = { id: 1, email: 'a@b.com', nombre: 'Test', rol: 'user' }
        const res = mockRes()
        const middleware = requireRole('admin', 'user')
        middleware(req, res, mockNext)
        expect(mockNext).toHaveBeenCalled()
    })
})
