import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import { conectarMySQL, sequelize } from './config/mysql'
import { conectarMongo } from './config/mongodb'
import { logger } from './utils/logger'
import { updateDbConnectionsGauge } from './utils/metrics'

const PORT = process.env.PORT || 3001

const iniciar = async () => {
    await conectarMySQL()
    await conectarMongo()
    await sequelize.sync({ alter: true })
    logger.info('Tablas sincronizadas con MySQL')

    // Actualizar metricas de conexiones DB cada 30s
    setInterval(() => {
        try {
            const pool = (sequelize as any).connectionManager?.pool
            if (pool) {
                updateDbConnectionsGauge(pool.size - pool.available)
            }
        } catch {
            updateDbConnectionsGauge(0)
        }
    }, 30000)

    app.listen(PORT, () => {
        logger.info({ port: PORT }, 'Servidor corriendo')
    })
}

iniciar().catch(error => {
    logger.error({ error }, 'No se pudo iniciar el servidor')
    process.exit(1)
})
