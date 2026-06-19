import pino from 'pino'
import { redactSensitive } from './http'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: ['req.headers.authorization', 'password', 'password_hash', 'token'],
    base: {
        service: 'cinelog-api',
        environment: process.env.NODE_ENV || 'development',
    },
})

export const logBusinessEvent = (event: string, payload: Record<string, unknown> = {}) => {
    logger.info({ event, payload: redactSensitive(payload) }, 'business_event')
}
