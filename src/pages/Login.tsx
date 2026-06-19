// @ts-nocheck
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, LogIn, Star, Film, Tv } from 'lucide-react'

interface LoginProps {
  onLogin: (usuario: any) => void
}

export default function Login({ onLogin }: LoginProps) {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) {
            setError('Por favor completa todos los campos.')
            return
        }

        // Usuario demo
        const usarDemo = () => {
            setForm({ email: 'test@test.com', password: 'Test1234' })
            setError(null)
        }

        // Login real
        try {
            setLoading(true)
            setError(null)
            const { login } = await import('../services/authService')
            const usuario = await login(form.email, form.password)
            onLogin({
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                avatar: usuario.nombre.charAt(0).toUpperCase(),
                rol: usuario.rol || 'user'
            })
            navigate('/inicio')
        } catch (err) {
            setError(err.response?.data?.error || 'Correo o contraseña incorrectos.')
        } finally {
            setLoading(false)
        }
    }

    const usarDemo = () => {
        setForm({ email: 'test@test.com', password: 'Test1234' })
        setError(null)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#080808' }}>

            {/* ── Panel izquierdo ── */}
            <div style={{ flex: 1, display: 'none', position: 'relative', overflow: 'hidden' }}
                className="left-panel">
                <style>{`
          @media (min-width: 900px) { .left-panel { display: block !important; } }
        `}</style>

                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, #0d0221 0%, #1a0533 25%, #0a1628 50%, #1a0a00 75%, #0d0221 100%)',
                }} />

                {/* Estrellas */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    {[...Array(80)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: i % 5 === 0 ? 3 : 1.5,
                            height: i % 5 === 0 ? 3 : 1.5,
                            borderRadius: '50%',
                            background: 'white',
                            left: `${(i * 37 + 13) % 100}%`,
                            top: `${(i * 53 + 7) % 70}%`,
                            opacity: (i % 3 === 0) ? 0.8 : 0.3,
                        }} />
                    ))}
                </div>

                {/* Silueta ciudad */}
                <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' }} viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#1a1a2e" />
                            <stop offset="100%" stopColor="#080808" />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="180" width="60" height="120" fill="url(#buildingGrad)" />
                    <rect x="55" y="150" width="45" height="150" fill="url(#buildingGrad)" />
                    <rect x="95" y="120" width="35" height="180" fill="url(#buildingGrad)" />
                    <rect x="125" y="160" width="55" height="140" fill="url(#buildingGrad)" />
                    <rect x="175" y="100" width="40" height="200" fill="url(#buildingGrad)" />
                    <rect x="210" y="140" width="50" height="160" fill="url(#buildingGrad)" />
                    <rect x="255" y="110" width="35" height="190" fill="url(#buildingGrad)" />
                    <rect x="285" y="130" width="60" height="170" fill="url(#buildingGrad)" />
                    <rect x="340" y="80" width="45" height="220" fill="url(#buildingGrad)" />
                    <rect x="380" y="120" width="40" height="180" fill="url(#buildingGrad)" />
                    <rect x="415" y="90" width="55" height="210" fill="url(#buildingGrad)" />
                    <rect x="465" y="140" width="35" height="160" fill="url(#buildingGrad)" />
                    <rect x="495" y="110" width="50" height="190" fill="url(#buildingGrad)" />
                    <rect x="540" y="130" width="45" height="170" fill="url(#buildingGrad)" />
                    <rect x="580" y="100" width="40" height="200" fill="url(#buildingGrad)" />
                    <rect x="615" y="150" width="55" height="150" fill="url(#buildingGrad)" />
                    <rect x="665" y="120" width="35" height="180" fill="url(#buildingGrad)" />
                    <rect x="695" y="160" width="50" height="140" fill="url(#buildingGrad)" />
                    <rect x="740" y="140" width="60" height="160" fill="url(#buildingGrad)" />
                    {/* Ventanas */}
                    {[100, 130, 180, 215, 260, 290, 345, 385, 420, 500, 545, 585, 620, 670, 700].map((x, i) => (
                        <rect key={i} x={x + 5} y={130 + (i % 4) * 20} width={6} height={8}
                            fill="#f5c518" opacity={i % 3 === 0 ? 0.7 : 0.15} />
                    ))}
                    <rect x="0" y="250" width="800" height="50" fill="url(#buildingGrad)" opacity="0.5" />
                </svg>

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, #080808 100%)' }} />

                {/* Logo */}
                <div style={{ position: 'absolute', top: 40, left: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f5c518, #c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Film size={20} color="#080808" />
                        </div>
                        <span style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 24, color: 'white' }}>
                            Cine<span style={{ color: '#f5c518' }}>Log</span>
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ position: 'absolute', bottom: 160, left: 40, display: 'flex', gap: 16 }}>
                    {[
                        { valor: '10K+', label: 'Películas', icon: <Film size={13} /> },
                        { valor: '5K+', label: 'Series', icon: <Tv size={13} /> },
                        { valor: '50K+', label: 'Usuarios', icon: <Star size={13} fill="#f5c518" color="#f5c518" /> },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#f5c518', marginBottom: 4 }}>
                                {s.icon}
                                <span style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18 }}>{s.valor}</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Cita */}
                <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontStyle: 'italic', lineHeight: 1.6 }}>
                        "El cine es un espejo que refleja la vida."
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 6 }}>— Federico Fellini</p>
                </div>
            </div>

            {/* ── Panel derecho — formulario ── */}
            <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #f5c518, #c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Film size={18} color="#080808" />
                    </div>
                    <span style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 22, color: 'white' }}>
                        Cine<span style={{ color: '#f5c518' }}>Log</span>
                    </span>
                </div>

                <div style={{ width: '100%', maxWidth: 400 }}>
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white', marginBottom: 8 }}>
                            Bienvenido de vuelta
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                            Inicia sesión para continuar en CineLog
                        </p>
                    </div>

                    {/* Banner demo */}
                    <button onClick={usarDemo}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, transition: 'all 0.2s', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Star size={16} fill="#00d4ff" color="#00d4ff" />
                        </div>
                        <div>
                            <p style={{ color: '#00d4ff', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Usuario demo</p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>test@test.com · Test1234</p>
                        </div>
                        <span style={{ marginLeft: 'auto', color: 'rgba(0,212,255,0.5)', fontSize: 11 }}>Usar →</span>
                    </button>

                    {/* Error */}
                    {error && (
                        <div id="login-error" role="alert" aria-live="assertive" data-testid="login-error" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} data-testid="login-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
                                Correo electrónico
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} color="rgba(255,255,255,0.25)"
                                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    data-testid="login-email"
                                    type="email"
                                    aria-describedby={error ? 'login-error' : undefined}
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="tu@correo.com"
                                    style={{
                                        width: '100%', background: '#141414',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'white', padding: '13px 16px 13px 44px',
                                        borderRadius: 12, fontSize: 14, outline: 'none',
                                        fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#f5c518'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <label htmlFor="login-password" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}>
                                    Contraseña
                                </label>
                                <Link to="/recuperar-contrasena" style={{ color: '#f5c518', fontSize: 12, cursor: 'pointer', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} color="rgba(255,255,255,0.25)"
                                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    data-testid="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    aria-describedby={error ? 'login-error' : undefined}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', background: '#141414',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'white', padding: '13px 44px 13px 44px',
                                        borderRadius: 12, fontSize: 14, outline: 'none',
                                        fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#f5c518'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                                <button type="button" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0 }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" data-testid="login-submit" disabled={loading}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                background: loading ? 'rgba(245,197,24,0.5)' : 'linear-gradient(135deg, #f5c518, #c9a227)',
                                color: '#080808', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: 15, fontFamily: 'Clash Display, sans-serif',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(245,197,24,0.25)',
                                transition: 'all 0.2s', marginTop: 4,
                            }}>
                            {loading ? (
                                <>
                                    <div style={{ width: 16, height: 16, border: '2px solid rgba(8,8,8,0.3)', borderTopColor: '#080808', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <><LogIn size={17} /> Iniciar sesión</>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>o continúa con</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    {/* Google */}
                    <button
                        style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>

                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 24 }}>
                        ¿No tienes cuenta?{' '}
                        <Link to="/registro" style={{ color: '#f5c518', fontWeight: 600, textDecoration: 'none' }}>
                            Crear cuenta
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

/*export default function Login() {
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="bg-[#1a1a1a] border border-yellow-500/20 rounded-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-[#f5c518] mb-6 text-center">
                    Iniciar sesión
                </h1>
                <p className="text-gray-400 text-center">Próximamente...</p>
            </div>
        </div>
    )
}*/
