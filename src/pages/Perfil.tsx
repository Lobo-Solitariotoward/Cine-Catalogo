import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, LogOut, Edit3, Check, Eye, EyeOff, Loader, Activity } from 'lucide-react'
import api from '../services/api'
import { logout } from '../services/authService'
import TimelineActividad from '../components/TimelineActividad'
import log from '../utils/logger'

export default function Perfil({ sesion, onLogout }) {
    const navigate = useNavigate()
    const [editando, setEditando] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [stats, setStats] = useState({ vistas: 0, enLista: 0, resenas: 0, favoritos: 0 })
    const [form, setForm] = useState({
        nombre: sesion?.nombre || '',
        email: sesion?.email || '',
        password: '',
    })
    const [toast, setToast] = useState(null)

    const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

    // READ — cargar estadísticas del usuario
    useEffect(() => {
        const cargarStats = async () => {
            if (!sesion?.id) return
            try {
                const [listas, historial, resenas] = await Promise.all([
                    api.get(`/lists/${sesion.id}`),
                    api.get(`/history/${sesion.id}`),
                    api.get(`/reviews/user/${sesion.id}`).catch(() => ({ data: [] })),
                ])

                const listasData = listas.data || []
                setStats({
                    vistas: historial.data?.length || 0,
                    enLista: listasData.filter(l => l.estado === 'por_ver').length,
                    favoritos: listasData.filter(l => l.estado === 'favorito').length,
                    resenas: resenas.data?.length || 0,
                })
            } catch (err) {
                log.error('Error cargando stats:', err)
            }
        }
        cargarStats()
    }, [sesion])

    // UPDATE — actualizar perfil
    const handleGuardar = async () => {
        setGuardando(true)
        try {
            const updates = { nombre: form.nombre }
            if (form.password) updates.password = form.password

            await api.put(`/users/${sesion.id}`, updates)
            setEditando(false)
            setForm(prev => ({ ...prev, password: '' }))
            mostrarToast('Perfil actualizado correctamente ✓')
        } catch (err) {
            mostrarToast('Error al actualizar el perfil')
        } finally {
            setGuardando(false)
        }
    }

    // Cerrar sesión
    const handleLogout = () => {
        logout()
        onLogout()
        navigate('/login')
    }

    const statItems = [
        { label: 'Películas vistas', valor: stats.vistas, emoji: '👁️' },
        { label: 'En mi lista', valor: stats.enLista, emoji: '🔖' },
        { label: 'Favoritos', valor: stats.favoritos, emoji: '❤️' },
        { label: 'Reseñas', valor: stats.resenas, emoji: '✍️' },
    ]

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '32px 24px 0' }}>

                {/* Header */}
                <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white', marginBottom: 28 }}>
                    Mi Perfil
                </h1>

                {/* Avatar y nombre */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: '#141414', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #f5c518, #c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#080808', fontFamily: 'Clash Display, sans-serif', flexShrink: 0, boxShadow: '0 8px 24px rgba(245,197,24,0.2)' }}>
                        {sesion?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h2 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sesion?.nombre}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sesion?.email}
                        </p>
                        <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontWeight: 600 }}>
                            Usuario activo
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {statItems.map(s => (
                        <div key={s.label} style={{ background: '#141414', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
                            <p style={{ color: '#f5c518', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 24, marginBottom: 4 }}>{s.valor}</p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 1.3 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Formulario edición */}
                <div style={{ background: '#141414', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 16 }}>
                            Información personal
                        </h3>
                        {!editando ? (
                            <button onClick={() => setEditando(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f5c518', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                                <Edit3 size={14} /> Editar
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => { setEditando(false); setForm(prev => ({ ...prev, password: '' })) }}
                                    style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13 }}>
                                    Cancelar
                                </button>
                                <button onClick={handleGuardar} disabled={guardando}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                                    {guardando ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <><Check size={13} /> Guardar</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Nombre */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Nombre completo</label>
                            <div style={{ position: 'relative' }}>
                                <User size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="text" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                                    disabled={!editando}
                                    style={{ width: '100%', background: editando ? '#0e0e0e' : 'transparent', border: `1px solid ${editando ? 'rgba(255,255,255,0.1)' : 'transparent'}`, color: editando ? 'white' : 'rgba(255,255,255,0.6)', padding: '12px 16px 12px 42px', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', cursor: editando ? 'text' : 'default', transition: 'all 0.2s' }}
                                    onFocus={e => { if (editando) e.target.style.borderColor = '#f5c518' }}
                                    onBlur={e => e.target.style.borderColor = editando ? 'rgba(255,255,255,0.1)' : 'transparent'} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Correo electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input type="email" value={form.email} disabled
                                    style={{ width: '100%', background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.4)', padding: '12px 16px 12px 42px', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', cursor: 'default' }} />
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4, paddingLeft: 4 }}>El correo no se puede cambiar</p>
                        </div>

                        {/* Contraseña — solo al editar */}
                        {editando && (
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
                                    Nueva contraseña <span style={{ color: 'rgba(255,255,255,0.2)' }}>(dejar vacío para no cambiar)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input type={showPass ? 'text' : 'password'} value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                        placeholder="••••••••"
                                        style={{ width: '100%', background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 46px 12px 42px', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                                        onFocus={e => e.target.style.borderColor = '#f5c518'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}>
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actividad reciente */}
                <div style={{ background: '#141414', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <Activity size={16} style={{ color: '#f5c518' }} />
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 16 }}>
                            Actividad reciente
                        </h3>
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                        <TimelineActividad limit={10} />
                    </div>
                </div>

                {/* Botón cerrar sesión */}
                <button onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}>
                    <LogOut size={17} /> Cerrar sesión
                </button>
            </div>

            {/* Toast */}
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