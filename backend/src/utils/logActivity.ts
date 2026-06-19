import ActivityLog from '../models/mongo/ActivityLog'
import { getErrorMessage } from './http'
import { logger, logBusinessEvent } from './logger'
import { recordBusinessMetric } from './metrics'

export const logActivity = (usuario_id: number, accion: string, detalle: Record<string, unknown> = {}) => {
    recordBusinessMetric(accion)
    logBusinessEvent(accion, { usuario_id, ...detalle })

    ActivityLog.create({ usuario_id, accion, detalle, timestamp: new Date() }).catch(error => {
        logger.warn(
            { error: getErrorMessage(error), accion, usuario_id },
            'No se pudo guardar ActivityLog'
        )
    })
}
