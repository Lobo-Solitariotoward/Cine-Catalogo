import ActivityLog from '../models/mongo/ActivityLog'

/**
 * Registra una acción del usuario en MongoDB.
 * Es "fire-and-forget": no bloquea la respuesta principal — si Mongo falla,
 * la operación principal (crear reseña, agregar a lista, etc.) sigue funcionando.
 *
 * @param usuario_id    ID numérico del usuario que hizo la acción
 * @param accion        Tipo de acción (ej: 'lista_agregar', 'resena_crear', 'calificacion')
 * @param detalle       Cualquier metadata útil para mostrar después (titulo, calificación, etc.)
 */
export const logActivity = (usuario_id: number, accion: string, detalle: any = {}) => {
    // No await — se ejecuta en background sin bloquear
    ActivityLog.create({ usuario_id, accion, detalle, timestamp: new Date() })
        .catch(err => {
            // Solo loggeamos a consola para que se vea en Render logs, pero no rompemos nada
            console.warn(`[ActivityLog] No se pudo guardar acción "${accion}":`, err.message)
        })
}
