import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import pinoHttp from 'pino-http'
import { logger } from '../utils/logger'
import { httpRequestDurationSeconds, httpRequestsTotal } from '../utils/metrics'

export const requestLogger = pinoHttp({
    logger,
    genReqId: req => {
        const incoming = req.headers['x-correlation-id']
        return typeof incoming === 'string' && incoming.trim() ? incoming : randomUUID()
    },
    customProps: req => ({ correlationId: req.id }),
})

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const started = process.hrtime.bigint()

    res.on('finish', () => {
        const route = req.route?.path ? `${req.baseUrl}${String(req.route.path)}` : req.path
        const status = String(res.statusCode)
        const duration = Number(process.hrtime.bigint() - started) / 1_000_000_000

        httpRequestsTotal.inc({ method: req.method, route, status })
        httpRequestDurationSeconds.observe({ method: req.method, route, status }, duration)
    })

    next()
}

export const attachCorrelationId = (req: Request, res: Response, next: NextFunction) => {
    if (req.id) res.setHeader('x-correlation-id', String(req.id))
    next()
}
