import { useEffect, useState } from 'react'
import { Loader, Bookmark, MessageCircle, Star, Eye, LogIn, UserPlus, Trash2, Edit3, RefreshCw } from 'lucide-react'
import { obtenerActividad, ActivityLogEntry } from '../services/activityService'
import log from '../utils/logger'

// Mapeo: tipo de acción → icono, color, texto humano
const RENDERIZAR: Record<string, (d: ActivityLogEntry['detalle']) => { icono: any; color: string; texto: React.ReactNode }> = {
    login: () => ({ icono: LogIn, color: '#9ca3af', texto: <>Iniciaste sesión</> }),
    registro: () => ({ icono: UserPlus, color: '#00d4ff', texto: <>Creaste tu cuenta en CineLog 🎬</> }),

    lista_agregar: (d) => ({
        icono: Bookmark, color: '#f5c518',
        texto: <>Agregaste <strong>{d.titulo || 'una película'}</strong> a tu lista</>
    }),
    lista_eliminar: (d) => ({
        icono: Trash2, color: '#ef4444',
        texto: <>Quitaste <strong>{d.titulo || 'una película'}</strong> de tu lista</>
    }),
    lista_actualizar: (d) => ({
        icono: RefreshCw, color: '#a78bfa',
        texto: <>Cambiaste <strong>{d.titulo || 'una película'}</strong> a <em>{d.estado_nuevo}</em></>
    }),

    resena_crear: (d) => ({
        icono: MessageCircle, color: '#00d4ff',
        texto: <>Reseñaste <strong>{d.titulo || 'una película'}</strong>{d.calificacion ? <> con <strong>{d.calificacion}/10</strong></> : null}</>
    }),
    resena_editar: (d) => ({
        icono: Edit3, color: '#a78bfa',
        texto: <>Editaste tu reseña de <strong>{d.titulo || 'una película'}</strong></>
    }),
    resena_eliminar: (d) => ({
        icono: Trash2, color: '#ef4444',
        texto: <>Eliminaste tu reseña de <strong>{d.titulo || 'una película'}</strong></>
    }),

    calificacion_crear: (d) => ({
        icono: Star, color: '#f5c518',
        texto: <>Calificaste <strong>{d.titulo || 'una película'}</strong> con <strong>{d.puntuacion}/10</strong></>
    }),
    calificacion_actualizar: (d) => ({
        icono: Star, color: '#f5c518',
        texto: <>Actualizaste tu calificación de <strong>{d.titulo || 'una película'}</strong> a <strong>{d.puntuacion}/10</strong></>
    }),

    historial_agregar: (d) => ({
        icono: Eye, color: '#00d4ff',
        texto: <>Marcaste <strong>{d.titulo || 'una película'}</strong> como vista{d.plataforma ? <> en <em>{d.plataforma}</em></> : null}</>
    }),
    historial_eliminar: (d) => ({
        icono: Trash2, color: '#ef4444',
        texto: <>Quitaste <strong>{d.titulo || 'una película'}</strong> del historial</>
    }),
}

const fallback = (accion: string) => ({
    icono: Star,
    color: '#9ca3af',
    texto: <>{accion.replace(/_/g, ' ')}</>
})

// Convierte una fecha en un texto relativo: "hace 5 min", "hace 2h", "ayer", etc.
const tiempoRelativo = (iso: string) => {
    const ahora = Date.now()
    const fecha = new Date(iso).getTime()
    const segs = Math.floor((ahora - fecha) / 1000)
    if (segs < 60) return 'justo ahora'
    if (segs < 3600) return `hace ${Math.floor(segs / 60)} min`
    if (segs < 86400) return `hace ${Math.floor(segs / 3600)}h`
    if (segs < 172800) return 'ayer'
    if (segs < 604800) return `hace ${Math.floor(segs / 86400)}d`
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
    limit?: number
}

export default function TimelineActividad({ limit = 10 }: Props) {
    const [logs, setLogs] = useState<ActivityLogEntry[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const cargar = async () => {
            setCargando(true)
            try {
                const res = await obtenerActividad(limit, 0)
                log.info('Actividad cargada', { total: res.total, mostrados: res.logs.length })
                setLogs(res.logs)
            } catch (err: any) {
                log.error('No se pudo cargar la actividad', err)
                setError('No se pudo cargar la actividad')
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [limit])

    if (cargando) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 0' }}>
                <Loader size={18} style={{ color: '#f5c518', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Cargando actividad...</span>
            </div>
        )
    }

    if (error) {
        return (
            <p style={{ color: 'rgba(239,68,68,0.7)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>{error}</p>
        )
    }

    if (logs.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)' }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>✨</p>
                <p style={{ fontSize: 13 }}>Aún no tienes actividad. ¡Empieza a explorar películas!</p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {logs.map((log, i) => {
                const render = (RENDERIZAR[log.accion] || (() => fallback(log.accion)))(log.detalle || {})
                const Icono = render.icono
                const esUltimo = i === logs.length - 1
                return (
                    <div key={log._id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                        {/* Línea vertical conectora */}
                        {!esUltimo && (
                            <div style={{ position: 'absolute', left: 17, top: 38, bottom: -2, width: 1, background: 'rgba(255,255,255,0.06)' }} />
                        )}
                        {/* Icono circular */}
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${render.color}15`, border: `1px solid ${render.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: render.color, marginTop: 2, zIndex: 1 }}>
                            <Icono size={15} />
                        </div>
                        {/* Texto */}
                        <div style={{ flex: 1, minWidth: 0, paddingBottom: 14 }}>
                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.5 }}>
                                {render.texto}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 3 }}>
                                {tiempoRelativo(log.timestamp)}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
