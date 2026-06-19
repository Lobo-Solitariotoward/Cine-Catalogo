import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import ActivityLog from '../src/models/mongo/ActivityLog'
import MovieDetail from '../src/models/mongo/MovieDetail'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

beforeEach(async () => {
    await ActivityLog.deleteMany({})
    await MovieDetail.deleteMany({})
})

describe('ActivityLog - MongoDB', () => {
    it('valida campos requeridos del documento', () => {
        const invalido = new ActivityLog({})
        const error = invalido.validateSync()
        expect(error?.errors.usuario_id).toBeDefined()
        expect(error?.errors.accion).toBeDefined()
    })

    it('crea documento con campos validos', async () => {
        const log = await ActivityLog.create({
            usuario_id: 1,
            accion: 'login',
            detalle: { email: 'test@test.com' },
            timestamp: new Date(),
        })
        expect(log._id).toBeDefined()
        expect(log.accion).toBe('login')
    })

    it('busca documentos por usuario_id', async () => {
        await ActivityLog.create({ usuario_id: 1, accion: 'login', timestamp: new Date() })
        await ActivityLog.create({ usuario_id: 1, accion: 'logout', timestamp: new Date() })
        await ActivityLog.create({ usuario_id: 2, accion: 'login', timestamp: new Date() })

        const logs = await ActivityLog.find({ usuario_id: 1 })
        expect(logs).toHaveLength(2)
    })

    it('ordena por timestamp descendente', async () => {
        await ActivityLog.create({ usuario_id: 1, accion: 'primero', timestamp: new Date('2026-01-01') })
        await ActivityLog.create({ usuario_id: 1, accion: 'segundo', timestamp: new Date('2026-06-01') })

        const logs = await ActivityLog.find({ usuario_id: 1 }).sort({ timestamp: -1 })
        expect(logs[0].accion).toBe('segundo')
        expect(logs[1].accion).toBe('primero')
    })
})

describe('MovieDetail - MongoDB', () => {
    it('acepta arrays anidados y defaults de cache', () => {
        const detail = new MovieDetail({
            imdb_id: 'tt1375666',
            titulo: 'Inception',
            reparto: ['Leonardo DiCaprio'],
            tags: ['Action', 'Sci-Fi'],
        })
        const error = detail.validateSync()
        expect(error).toBeUndefined()
        expect(detail.reparto).toContain('Leonardo DiCaprio')
        expect(detail.cached_en).toBeInstanceOf(Date)
    })

    it('enforce unique index en imdb_id', async () => {
        await MovieDetail.create({ imdb_id: 'tt1234567', titulo: 'Test Movie' })
        await expect(
            MovieDetail.create({ imdb_id: 'tt1234567', titulo: 'Duplicate' })
        ).rejects.toThrow()
    })

    it('guarda y recupera documento completo', async () => {
        const created = await MovieDetail.create({
            imdb_id: 'tt9999999',
            titulo: 'Pelicula Test',
            sinopsis: 'Una pelicula de prueba',
            director: 'Director Test',
            reparto: ['Actor 1', 'Actor 2'],
            tags: ['Drama', 'Thriller'],
        })

        const found = await MovieDetail.findOne({ imdb_id: 'tt9999999' })
        expect(found).toBeDefined()
        expect(found!.titulo).toBe('Pelicula Test')
        expect(found!.reparto).toHaveLength(2)
    })
})
