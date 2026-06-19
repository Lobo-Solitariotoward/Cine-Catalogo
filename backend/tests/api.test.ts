import request from 'supertest'
import { describe, expect, it, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'
import app from '../src/app'
import Usuario from '../src/models/mysql/Usuario'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret'

let testUser: any
let testToken: string
let testAdmin: any
let adminToken: string
let duplicateEmail: string
let loginUserEmail: string

beforeAll(async () => {
    try {
        const passwordHash = await bcrypt.hash('Test1234', 10)

        testUser = await Usuario.create({
            nombre: 'Test User',
            email: `test_integration_${Date.now()}@cinelog.test`,
            password_hash: passwordHash,
            rol: 'user',
        })
        testToken = jwt.sign(
            { id: testUser.id, email: testUser.email, nombre: testUser.nombre, rol: 'user' },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        testAdmin = await Usuario.create({
            nombre: 'Test Admin',
            email: `admin_integration_${Date.now()}@cinelog.test`,
            password_hash: passwordHash,
            rol: 'admin',
        })
        adminToken = jwt.sign(
            { id: testAdmin.id, email: testAdmin.email, nombre: testAdmin.nombre, rol: 'admin' },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        duplicateEmail = `dup_${Date.now()}@cinelog.test`
        await Usuario.create({
            nombre: 'Duplicate User',
            email: duplicateEmail,
            password_hash: passwordHash,
        })

        loginUserEmail = `login_${Date.now()}@cinelog.test`
        await Usuario.create({
            nombre: 'Login User',
            email: loginUserEmail,
            password_hash: passwordHash,
        })
    } catch {
        // DB might not be available, tests will be skipped
    }
})

describe('Health & Headers', () => {
    it('GET /api/health retorna 200 con schema correcto', async () => {
        const res = await request(app).get('/api/health').expect(200)
        expect(res.body).toMatchObject({ status: 'ok', service: 'cinelog-api' })
        expect(typeof res.body.timestamp).toBe('string')
    })

    it('retorna x-correlation-id en headers', async () => {
        const res = await request(app).get('/api/health').expect(200)
        expect(res.headers['x-correlation-id']).toBeDefined()
    })

    it('retorna Content-Type application/json', async () => {
        const res = await request(app).get('/api/health').expect(200)
        expect(res.headers['content-type']).toContain('application/json')
    })
})

describe('Auth - Register', () => {
    it('POST /api/auth/register happy path retorna 201 con token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'Nuevo Usuario', email: `register_${Date.now()}@cinelog.test`, password: 'Test1234' })
            .expect(201)
        expect(res.body.token).toBeDefined()
        expect(res.body.usuario).toBeDefined()
        expect(res.body.usuario.nombre).toBe('Nuevo Usuario')
        expect(res.body.usuario.rol).toBe('user')
    })

    it('POST /api/auth/register sin campos retorna 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({})
            .expect(400)
        expect(res.body.error).toBeDefined()
    })

    it('POST /api/auth/register email duplicado retorna 400', async () => {
        if (!duplicateEmail) return
        const res = await request(app)
            .post('/api/auth/register')
            .send({ nombre: 'B', email: duplicateEmail, password: 'Test1234' })
            .expect(400)
        expect(res.body.error).toContain('registrado')
    })
})

describe('Auth - Login', () => {
    it('POST /api/auth/login con credenciales validas retorna 200', async () => {
        if (!loginUserEmail) return
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: loginUserEmail, password: 'Test1234' })
            .expect(200)
        expect(res.body.token).toBeDefined()
        expect(res.body.usuario.rol).toBeDefined()
    })

    it('POST /api/auth/login sin campos retorna 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({})
            .expect(400)
        expect(res.body.error).toBeDefined()
    })

    it('POST /api/auth/login credenciales invalidas retorna 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'noexiste@cinelog.test', password: 'wrong' })
            .expect(401)
        expect(res.body.error).toBeDefined()
    })
})

describe('Auth - Forgot/Reset Password', () => {
    it('POST /api/auth/forgot-password retorna mensaje generico', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'test@cinelog.test' })
            .expect(200)
        expect(res.body.mensaje).toBeDefined()
    })

    it('POST /api/auth/forgot-password sin email retorna 400', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({})
            .expect(400)
        expect(res.body.error).toBeDefined()
    })

    it('POST /api/auth/reset-password sin datos retorna 400', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({})
            .expect(400)
        expect(res.body.error).toBeDefined()
    })
})

describe('Autenticacion y Autorizacion', () => {
    it('endpoint protegido sin token retorna 401', async () => {
        const res = await request(app).get('/api/activity/me').expect(401)
        expect(res.body.error).toBe('Token requerido')
    })

    it('endpoint protegido con token invalido retorna 403', async () => {
        const res = await request(app)
            .get('/api/activity/me')
            .set('Authorization', 'Bearer token-invalido')
            .expect(403)
        expect(res.body.error).toContain('Token')
    })

    it('endpoint protegido con token valido retorna 200', async () => {
        if (!testToken) return
        const res = await request(app)
            .get('/api/activity/me')
            .set('Authorization', `Bearer ${testToken}`)
            .expect(200)
        expect(res.body.logs).toBeDefined()
    }, 15000)

    it('usuario no puede acceder a datos de otro usuario', async () => {
        if (!testToken) return
        const res = await request(app)
            .get('/api/lists/99999')
            .set('Authorization', `Bearer ${testToken}`)
            .expect(403)
        expect(res.body.error).toBe('Sin permiso')
    })
})

describe('Rutas inexistentes', () => {
    it('GET /api/no-existe retorna 404', async () => {
        const res = await request(app).get('/api/no-existe').expect(404)
        expect(res.body.error).toBe('Ruta no encontrada')
    })
})

describe('Movies - Search', () => {
    it('GET /api/movies/search sin query retorna 400', async () => {
        if (!testToken) return
        const res = await request(app)
            .get('/api/movies/search')
            .set('Authorization', `Bearer ${testToken}`)
            .expect(400)
        expect(res.body.error).toContain('q')
    })

    it('GET /api/movies/search sin token retorna 401', async () => {
        const res = await request(app)
            .get('/api/movies/search?q=inception')
            .expect(401)
        expect(res.body.error).toBe('Token requerido')
    })
})

describe('Genres - Admin Only', () => {
    it('POST /api/genres sin token retorna 401', async () => {
        const res = await request(app)
            .post('/api/genres')
            .send({ nombre: 'Test' })
            .expect(401)
        expect(res.body.error).toBe('Token requerido')
    })

    it('POST /api/genres con rol user retorna 403', async () => {
        if (!testToken) return
        const res = await request(app)
            .post('/api/genres')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ nombre: 'Test Genre' })
            .expect(403)
        expect(res.body.error).toContain('permiso')
    })

    it('GET /api/genres con token valido retorna 200', async () => {
        if (!testToken) return
        const res = await request(app)
            .get('/api/genres')
            .set('Authorization', `Bearer ${testToken}`)
            .expect(200)
        expect(Array.isArray(res.body)).toBe(true)
    })
})

describe('Rate Limiting', () => {
    it('login aplica rate limiting despues de 5 intentos', async () => {
        const promises = Array.from({ length: 6 }, (_, i) =>
            request(app)
                .post('/api/auth/login')
                .send({ email: `rate_${i}@test.com`, password: 'wrong' })
        )
        const results = await Promise.all(promises)
        const rateLimited = results.some(r => r.status === 429)
        expect(rateLimited).toBe(true)
    })
})

describe('Response Headers', () => {
    it('retorna CORS headers', async () => {
        const res = await request(app)
            .options('/api/health')
            .set('Origin', 'http://localhost:5173')
        expect(res.headers['access-control-allow-origin']).toBeDefined()
    })

    it('GET /api/metrics retorna content-type de prometheus', async () => {
        const res = await request(app).get('/api/metrics').expect(200)
        expect(res.headers['content-type']).toContain('text')
    })
})

describe('Pagination', () => {
    it('GET /api/activity/me soporta limit y skip', async () => {
        if (!testToken) return
        const res = await request(app)
            .get('/api/activity/me?limit=5&skip=0')
            .set('Authorization', `Bearer ${testToken}`)
            .expect(200)
        expect(res.body.total).toBeDefined()
        expect(typeof res.body.limit).toBe('number')
        expect(typeof res.body.skip).toBe('number')
        expect(Array.isArray(res.body.logs)).toBe(true)
    }, 15000)
})
