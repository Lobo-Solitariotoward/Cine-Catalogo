/**
 * Logger ligero para desarrollo.
 *
 * Uso:
 *   import log from '../utils/logger'
 *   log.info('Cargando película', { imdbId })
 *   log.warn('Falta el poster')
 *   log.error('Falló la API', err)
 *   log.debug('Estado interno', state)
 *
 * En producción (cuando import.meta.env.PROD === true) info/debug se silencian
 * automáticamente. warn y error siempre se loggean — quieres verte enterado
 * de cosas raras pase lo que pase.
 *
 * Cómo forzar logs en producción para depurar algo puntual:
 *   En la consola del navegador: localStorage.setItem('cinelog_debug', '1')
 *   Para volver al estado normal: localStorage.removeItem('cinelog_debug')
 */

type Nivel = 'debug' | 'info' | 'warn' | 'error'

const COLORES: Record<Nivel, string> = {
    debug: '#9ca3af',  // gris
    info: '#00d4ff',   // cyan
    warn: '#f5c518',   // amarillo
    error: '#ef4444',  // rojo
}

const ETIQUETAS: Record<Nivel, string> = {
    debug: 'DEBUG',
    info: 'INFO ',
    warn: 'WARN ',
    error: 'ERROR',
}

const enProduccion = import.meta.env.PROD

// El usuario puede activar logs en producción para depurar
const debugForzado = (): boolean => {
    try { return localStorage.getItem('cinelog_debug') === '1' } catch { return false }
}

const habilitado = (nivel: Nivel): boolean => {
    if (nivel === 'warn' || nivel === 'error') return true
    if (!enProduccion) return true
    return debugForzado()
}

const ahora = () => {
    const d = new Date()
    return d.toTimeString().slice(0, 8)  // HH:MM:SS
}

const emit = (nivel: Nivel, mensaje: string, ...extra: any[]) => {
    if (!habilitado(nivel)) return

    const prefijo = `%c${ETIQUETAS[nivel]} %c${ahora()}%c ${mensaje}`
    const estiloNivel = `background:${COLORES[nivel]};color:#000;padding:2px 6px;border-radius:4px;font-weight:700;font-size:11px;`
    const estiloHora = 'color:#9ca3af;font-size:11px;'
    const estiloMsg = 'color:inherit;'

    const fn = nivel === 'error' ? console.error : nivel === 'warn' ? console.warn : console.log
    if (extra.length > 0) {
        fn(prefijo, estiloNivel, estiloHora, estiloMsg, ...extra)
    } else {
        fn(prefijo, estiloNivel, estiloHora, estiloMsg)
    }
}

const log = {
    debug: (msg: string, ...extra: any[]) => emit('debug', msg, ...extra),
    info: (msg: string, ...extra: any[]) => emit('info', msg, ...extra),
    warn: (msg: string, ...extra: any[]) => emit('warn', msg, ...extra),
    error: (msg: string, ...extra: any[]) => emit('error', msg, ...extra),
}

export default log
