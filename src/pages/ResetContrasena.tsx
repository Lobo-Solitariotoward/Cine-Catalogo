// @ts-nocheck
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Film, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react'
import api from '../services/api'

export default function ResetContrasena() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ token: '', password: '', confirmar: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const requisitos = {
        longitud: form.password.length >= 8,
        mayuscula: /[A-Z]/.test(form.password),
        numero: /[0-9]/.test(form.password),
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.token || !form.password) {
            setError('Token y contraseña son requeridos')
            return
        }
        if (form.password !== form.confirmar) {
            setError('Las contraseñas no coinciden')
            return
        }
        if (!requisitos.longitud || !requisitos.mayuscula || !requisitos.numero) {
            setError('La contraseña no cumple los requisitos mínimos')
            return
        }

        try {
            setLoading(true)
            setError('')
            const { data } = await api.post('/auth/reset-password', { token: form.token, password: form.password })
            setMensaje(data.mensaje)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Error al restablecer contraseña')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', padding: 32 }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #f5c518, #c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Film size={18} color="#080808" />
                    </div>
                    <span style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 22, color: 'white' }}>
                        Cine<span style={{ color: '#f5c518' }}>Log</span>
                    </span>
                </div>

                <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 28, color: 'white', marginBottom: 8 }}>
                    Restablecer contraseña
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>
                    Ingresa el token recibido y tu nueva contraseña.
                </p>

                {error && (
                    <div role="alert" data-testid="reset-error" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div data-testid="reset-exito" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 13, marginBottom: 16 }}>
                        {mensaje} Redirigiendo al login...
                    </div>
                )}

                <form onSubmit={handleSubmit} data-testid="reset-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="reset-token" style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                            Token de recuperación
                        </label>
                        <input
                            id="reset-token"
                            data-testid="reset-token"
                            type="text"
                            value={form.token}
                            onChange={e => { setForm(p => ({ ...p, token: e.target.value })); setError('') }}
                            placeholder="Pega el token aquí"
                            style={{
                                width: '100%', background: '#141414',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'white', padding: '13px 16px',
                                borderRadius: 12, fontSize: 14, outline: 'none',
                                fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                            }}
                            onFocus={e => e.target.style.borderColor = '#f5c518'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                    </div>

                    <div>
                        <label htmlFor="reset-password" style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                            Nueva contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                id="reset-password"
                                data-testid="reset-password"
                                type={showPass ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError('') }}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', background: '#141414',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'white', padding: '13px 44px 13px 44px',
                                    borderRadius: 12, fontSize: 14, outline: 'none',
                                    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = '#f5c518'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                            <button type="button" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0 }}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                            {[
                                { ok: requisitos.longitud, text: 'Mínimo 8 caracteres' },
                                { ok: requisitos.mayuscula, text: 'Una letra mayúscula' },
                                { ok: requisitos.numero, text: 'Un número' },
                            ].map(r => (
                                <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: r.ok ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                                    <Check size={10} /> {r.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reset-confirmar" style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                            Confirmar contraseña
                        </label>
                        <input
                            id="reset-confirmar"
                            data-testid="reset-confirmar"
                            type="password"
                            value={form.confirmar}
                            onChange={e => { setForm(p => ({ ...p, confirmar: e.target.value })); setError('') }}
                            placeholder="••••••••"
                            style={{
                                width: '100%', background: '#141414',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'white', padding: '13px 16px',
                                borderRadius: 12, fontSize: 14, outline: 'none',
                                fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                            }}
                            onFocus={e => e.target.style.borderColor = '#f5c518'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                    </div>

                    <button type="submit" data-testid="reset-submit" disabled={loading}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                            background: loading ? 'rgba(245,197,24,0.5)' : 'linear-gradient(135deg, #f5c518, #c9a227)',
                            color: '#080808', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: 15, fontFamily: 'Clash Display, sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                    </button>
                </form>

                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 14, textDecoration: 'none' }}>
                    <ArrowLeft size={14} /> Volver al inicio de sesión
                </Link>
            </div>
        </div>
    )
}
