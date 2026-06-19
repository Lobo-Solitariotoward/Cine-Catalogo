import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
dotenv.config()

import './models/mysql/asociaciones'

import authRoutes from './routes/auth'
import movieRoutes from './routes/movies'
import listRoutes from './routes/lists'
import reviewRoutes from './routes/reviews'
import ratingRoutes from './routes/ratings'
import userRoutes from './routes/users'
import genreRoutes from './routes/genres'
import historyRoutes from './routes/history'
import notificationRoutes from './routes/notifications'
import activityRoutes from './routes/activity'
import { attachCorrelationId, metricsMiddleware, requestLogger } from './middlewares/observability'
import { metricsRegistry } from './utils/metrics'

const app = express()

const allowedOrigins = [
    'http://localhost:5173',
    'https://cine-catalogo-1.onrender.com',
]

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Intenta de nuevo en un minuto.' },
})

const registerLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados registros. Intenta de nuevo en un minuto.' },
})

app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(requestLogger)
app.use(attachCorrelationId)
app.use(metricsMiddleware)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'cinelog-api',
        timestamp: new Date().toISOString(),
    })
})

app.get('/api/metrics', async (_req, res) => {
    res.setHeader('Content-Type', metricsRegistry.contentType)
    res.send(await metricsRegistry.metrics())
})

app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/register', registerLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/genres', genreRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/activity', activityRoutes)

app.get('/', (_req, res) => {
    res.json({ message: 'CineLog API funcionando (TypeScript)', version: '2.0.0' })
})

app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
