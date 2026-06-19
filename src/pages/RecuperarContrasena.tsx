// @ts-nocheck
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Film, ArrowLeft, Send } from 'lucide-react'
import api from '../services/api'

export default function RecuperarContrasena() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')
    const [tokenDebug, setTokenDebug] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            setError('Ingresa tu correo electronico')
            return
        }

        try {
            setLoading(true)
            setError('')
            setMensaje('')
            const { data } = await api.post('/auth/forgot-password', { email })
            setMensaje(data.mensaje)
            if (data._debug_token) setTokenDebug(data._debug_token)
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar la solicitud')
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
                    Recuperar contraseña
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {error && (
                    <div role="alert" data-testid="recuperar-error" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div data-testid="recuperar-exito" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 13, marginBottom: 16 }}>
                        {mensaje}
                    </div>
                )}

                {tokenDebug && (
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 12, marginBottom: 16, wordBreak: 'break-all' }}>
                        <strong>Token de prueba:</strong> {tokenDebug}
                        <br />
                        <Link to="/reset-contrasena" style={{ color: '#f5c518', textDecoration: 'none', fontSize: 12 }}>Ir a restablecer contraseña →</Link>
                    </div>
                )}

                <form onSubmit={handleSubmit} data-testid="recuperar-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="recuperar-email" style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                            Correo electrónico
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                id="recuperar-email"
                                data-testid="recuperar-email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError('') }}
                                placeholder="tu@correo.com"
                                style={{
                                    width: '100%', background: '#141414',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'white', padding: '13px 16px 13px 44px',
                                    borderRadius: 12, fontSize: 14, outline: 'none',
                                    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = '#f5c518'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>
                    </div>

                    <button type="submit" data-testid="recuperar-submit" disabled={loading}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                            background: loading ? 'rgba(245,197,24,0.5)' : 'linear-gradient(135deg, #f5c518, #c9a227)',
                            color: '#080808', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: 15, fontFamily: 'Clash Display, sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                        {loading ? 'Enviando...' : <><Send size={16} /> Enviar enlace</>}
                    </button>
                </form>

                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 14, textDecoration: 'none' }}>
                    <ArrowLeft size={14} /> Volver al inicio de sesión
                </Link>
            </div>
        </div>
    )
}
