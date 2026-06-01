import { useEffect, useState } from 'react'
import { Bell, Check, Trash2, Loader, MailOpen } from 'lucide-react'
import {
    obtenerNotificaciones,
    marcarComoLeida,
    eliminarNotificacion,
    tiempoRelativo,
    Notificacion as NotifType
} from '../services/notificationService'
import log from '../utils/logger'

interface Props { sesion: any }

const COLOR_POR_TIPO: Record<string, string> = {
    sistema: '#9ca3af',
    nueva_resena: '#00d4ff',
    like: '#f5c518',
    recomendacion: '#a78bfa',
}

export default function Notificaciones({ sesion }: Props) {
    const [notifs, setNotifs] = useState<NotifType[]>([])
    const [cargando, setCargando] = useState(true)
    const [toast, setToast] = useState<string | null>(null)
    const [filtro, setFiltro] = useState<'todas' | 'no_leidas'>('todas')

    const mostrarToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    const cargar = async () => {
        if (!sesion?.id) { setCargando(false); return }
        try {
            const data = await obtenerNotificaciones(sesion.id)
            setNotifs(data)
            log.info('Notificaciones cargadas', { total: data.length })
        } catch (err) {
            log.error('Error cargando notificaciones', err)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => { cargar() }, [sesion])

    const handleMarcarLeida = async (id: number) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
        try { await marcarComoLeida(id) } catch (err) { log.error('Error al marcar como leída', err) }
    }

    const handleEliminar = async (id: number) => {
        setNotifs(prev => prev.filter(n => n.id !== id))
        try {
            await eliminarNotificacion(id)
            mostrarToast('Notificación eliminada')
        } catch (err) {
            log.error('Error al eliminar', err)
            mostrarToast('Error al eliminar')
        }
    }

    const handleMarcarTodas = async () => {
        const noLeidas = notifs.filter(n => !n.leida)
        if (noLeidas.length === 0) return
        setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
        try {
            await Promise.all(noLeidas.map(n => marcarComoLeida(n.id)))
            mostrarToast(`${noLeidas.length} marcada${noLeidas.length > 1 ? 's' : ''} como leída${noLeidas.length > 1 ? 's' : ''}`)
        } catch (err) {
            log.error('Error al marcar todas como leídas', err)
        }
    }

    const filtradas = filtro === 'no_leidas' ? notifs.filter(n => !n.leida) : notifs
    const sinLeer = notifs.filter(n => !n.leida).length

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '32px 24px 0' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                            <Bell size={26} style={{ color: '#f5c518' }} />
                            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white' }}>Notificaciones</h1>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                            {sinLeer > 0 ? `Tienes ${sinLeer} notificación${sinLeer === 1 ? '' : 'es'} sin leer` : 'Estás al día'}
                        </p>
                    </div>
                    {sinLeer > 0 && (
                        <button onClick={handleMarcarTodas}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,197,24,0.1)', color: '#f5c518', fontWeight: 600, padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(245,197,24,0.2)', cursor: 'pointer', fontSize: 13 }}>
                            <MailOpen size={15} /> Marcar todas como leídas
                        </button>
                    )}
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {[
                        { k: 'todas' as const, l: `Todas (${notifs.length})` },
                        { k: 'no_leidas' as const, l: `Sin leer (${sinLeer})` },
                    ].map(f => (
                        <button key={f.k} onClick={() => setFiltro(f.k)}
                            style={{
                                padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                                border: `1px solid ${filtro === f.k ? 'rgba(245,197,24,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                background: filtro === f.k ? 'rgba(245,197,24,0.1)' : 'transparent',
                                color: filtro === f.k ? '#f5c518' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                            {f.l}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {cargando && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0' }}>
                        <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: '#f5c518' }} />
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Cargando...</span>
                    </div>
                )}

                {/* Vacío */}
                {!cargando && filtradas.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 12 }}>
                        <div style={{ fontSize: 56 }}>🔔</div>
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18 }}>
                            {filtro === 'no_leidas' ? 'Todo leído' : 'Sin notificaciones'}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                            {filtro === 'no_leidas' ? 'No tienes notificaciones pendientes' : 'Aún no has recibido nada'}
                        </p>
                    </div>
                )}

                {/* Lista */}
                {!cargando && filtradas.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filtradas.map(n => {
                            const color = COLOR_POR_TIPO[n.tipo] || '#9ca3af'
                            return (
                                <div key={n.id}
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16,
                                        background: n.leida ? '#131313' : '#181818',
                                        borderRadius: 16,
                                        border: `1px solid ${n.leida ? 'rgba(255,255,255,0.06)' : 'rgba(0,212,255,0.18)'}`,
                                        transition: 'all 0.2s'
                                    }}>
                                    {/* Punto/icono */}
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>
                                        <Bell size={16} />
                                    </div>
                                    {/* Contenido */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ color: n.leida ? 'rgba(255,255,255,0.7)' : 'white', fontSize: 14, lineHeight: 1.5 }}>
                                            {n.mensaje}
                                        </p>
                                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>
                                            {tiempoRelativo(n.creado_en)} · {new Date(n.creado_en).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {/* Acciones */}
                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                        {!n.leida && (
                                            <button onClick={() => handleMarcarLeida(n.id)}
                                                title="Marcar como leída"
                                                style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff' }}>
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button onClick={() => handleEliminar(n.id)}
                                            title="Eliminar"
                                            style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(239,68,68,0.7)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {toast && (
                <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 16, background: '#1c1c1c', border: '1px solid rgba(0,212,255,0.2)', color: 'white', fontSize: 14, whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#00d4ff' }}>✓</span> {toast}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
