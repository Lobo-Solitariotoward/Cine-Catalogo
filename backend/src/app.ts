import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import './models/mysql/asociaciones'

import { conectarMySQL, sequelize } from './config/mysql'
import { conectarMongo } from './config/mongodb'

import authRoutes from './routes/auth'
import movieRoutes from './routes/movies'
import listRoutes from './routes/lists'
import reviewRoutes from './routes/reviews'
import ratingRoutes from './routes/ratings'
import userRoutes from './routes/users'
import genreRoutes from './routes/genres'
import historyRoutes from './routes/history'
import notificationRoutes from './routes/notifications'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/genres', genreRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/', (_req, res) => {
    res.json({ message: '🎬 CineLog API funcionando (TypeScript)', version: '2.0.0' })
})

const iniciar = async () => {
    await conectarMySQL()
    await conectarMongo()
    await sequelize.sync({ alter: true })
    console.log('✅ Tablas sincronizadas con MySQL')
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    })
}

iniciar()
