import { useEffect, useState } from 'react'
import { MessageCircle, Loader, Star, Trash2, Edit3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { eliminarResena } from '../services/reviewService'
import log from '../utils/logger'

interface Props { sesion: any }

export default function MisResenas({ sesion }: Props) {
    const [resenas, setResenas] = useState<any[]>([])
    const [cargando, setCargando] = useState(true)
    const [toast, setToast] = useState<string | null>(null)

    const mostrarToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

    useEffect(() => {
        const cargar = async () => {
            if (!sesion?.id) { setCargando(false); return }
            try {
                const { data } = await api.get(`/reviews/user/${sesion.id}`)
                setResenas(data)
                log.info('Mis reseñas cargadas', { total: data.length })
            } catch (err) {
                log.error('Error cargando reseñas', err)
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [sesion])

    const handleEliminar = async (id: number) => {
        if (!confirm('¿Eliminar esta reseña?')) return
        try {
            await eliminarResena(id)
            setResenas(prev => prev.filter(r => r.id !== id))
            mostrarToast('Reseña eliminada')
        } catch (err) {
            log.error('Error al eliminar reseña', err)
            mostrarToast('Error al eliminar')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '32px 24px 0' }}>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <MessageCircle size={26} style={{ color: '#f5c518' }} />
                        <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white' }}>Mis Reseñas</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Todas las reseñas que has escrito</p>
                </div>

                {cargando && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0' }}>
                        <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: '#f5c518' }} />
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Cargando...</span>
                    </div>
                )}

                {!cargando && resenas.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 12 }}>
                        <div style={{ fontSize: 56 }}>✍️</div>
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18 }}>Sin reseñas</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, maxWidth: 320, textAlign: 'center' }}>
                            Aún no has escrito ninguna reseña. Encuentra una película y comparte tu opinión.
                        </p>
                        <Link to="/buscar"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, padding: '11px 24px', borderRadius: 12, textDecoration: 'none', fontSize: 14, marginTop: 8 }}>
                            Buscar películas
                        </Link>
                    </div>
                )}

                {!cargando && resenas.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {resenas.map(r => (
                            <div key={r.id}
                                style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 10, padding: '5px 12px' }}>
                                        <Star size={13} fill="#f5c518" color="#f5c518" />
                                        <span style={{ color: '#f5c518', fontWeight: 700, fontSize: 13 }}>{r.calificacion ?? 5}/10</span>
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                                        {new Date(r.creado_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{r.texto}</p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleEliminar(r.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', fontSize: 12 }}>
                                        <Trash2 size={13} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {toast && (
                <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}>
                    <div style={{ padding: '12px 20px', borderRadius: 16, background: '#1c1c1c', border: '1px solid rgba(0,212,255,0.2)', color: 'white', fontSize: 14 }}>
                        {toast}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
