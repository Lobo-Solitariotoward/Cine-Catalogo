import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client'

export const metricsRegistry = new Registry()

collectDefaultMetrics({ register: metricsRegistry })

export const httpRequestsTotal = new Counter({
    name: 'cinelog_http_requests_total',
    help: 'Total de requests HTTP por metodo, ruta y status.',
    labelNames: ['method', 'route', 'status'],
    registers: [metricsRegistry],
})

export const httpRequestDurationSeconds = new Histogram({
    name: 'cinelog_http_request_duration_seconds',
    help: 'Duracion de requests HTTP por metodo, ruta y status.',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [metricsRegistry],
})

export const businessEventsTotal = new Counter({
    name: 'cinelog_business_events_total',
    help: 'Eventos de negocio registrados por tipo.',
    labelNames: ['event'],
    registers: [metricsRegistry],
})

export const activeDbConnections = new Gauge({
    name: 'cinelog_db_connections_active',
    help: 'Conexiones activas a la base de datos.',
    registers: [metricsRegistry],
})

export const recordBusinessMetric = (event: string) => {
    businessEventsTotal.inc({ event })
}

export const updateDbConnectionsGauge = (count: number) => {
    activeDbConnections.set(count)
}
