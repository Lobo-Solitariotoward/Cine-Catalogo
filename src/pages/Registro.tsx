import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Film, Mail, Lock, User, UserPlus, Check } from 'lucide-react'

interface RequisitoProps { cumplido: boolean; texto: string }
function RequisitoPassword({ cumplido, texto }: RequisitoProps) {
    return (
        <div className={`flex items-center gap-2 text-xs transition-colors ${cumplido ? 'text-green-400' : 'text-zinc-600'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${cumplido ? 'bg-green-500 border-green-500' : 'border-zinc-700'}`}>
                {cumplido && <Check size={10} strokeWidth={3} className="text-black" />}
            </div>
            {texto}
        </div>
    )
}

interface RegistroProps {
  onLogin: (usuario: any) => void
}

export default function Registro({ onLogin }: RegistroProps) {
    const navigate = useNavigate()
    const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' })
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const requisitos = {
        longitud: form.password.length >= 8,
        mayuscula: /[A-Z]/.test(form.password),
        numero: /[0-9]/.test(form.password),
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.nombre || !form.email || !form.password || !form.confirmar) {
            setError('Por favor completa todos los campos.')
            return
        }
        if (form.password !== form.confirmar) {
            setError('Las contraseñas no coinciden.')
            return
        }
        if (!requisitos.longitud || !requisitos.mayuscula || !requisitos.numero) {
            setError('La contraseña no cumple los requisitos mínimos.')
            return
        }

        try {
            setLoading(true)
            const { register } = await import('../services/authService')
            const usuario = await register(form.nombre, form.email, form.password)
            onLogin({
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                avatar: usuario.nombre.charAt(0).toUpperCase()
            })
            navigate('/inicio')
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear la cuenta.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">

            {/* Panel izquierdo — decorativo */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDexaImVlGABiW11xi5NqgIWR6Vo2VllHLWDXNRgcpI2lGnQNjzQBSS5AkWYCaukh1n4rKAw4LEVGP4YWbSU_nVlJZts2KWrxosF0H46A4y1eZSRPZ7jvyVlkcIBaQlb48YL1cNXIPJ0zL2RB35h5rW0YmSFxF3ZwxwydLsOByCpQ_k07zzTAaA4eTUej_W_5ZIBdFikCEDSH58PZFpbq_w3TH9cwnwwOrMvgnOiuWAMrO3wkIhq7V4NdRRWLLWKbnRM8ApWMUviss"
                    alt="CineLog background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/60" />

                {/* Logo */}
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#f5c518] flex items-center justify-center shadow-lg shadow-[#f5c518]/30">
                        <Film size={17} className="text-black" strokeWidth={2.5} />
                    </div>
                    <span className="text-white font-black text-2xl tracking-tight">
                        Cine<span className="text-[#f5c518]">Log</span>
                    </span>
                </div>

                {/* Stats decorativos */}
                <div className="absolute bottom-12 left-8 right-8 grid grid-cols-3 gap-4">
                    {[
                        { valor: '10K+', label: 'Películas' },
                        { valor: '5K+', label: 'Series' },
                        { valor: '50K+', label: 'Usuarios' },
                    ].map(stat => (
                        <div key={stat.label}
                            className="backdrop-blur-md border border-white/10 rounded-xl p-4 text-center"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <p className="text-[#f5c518] font-black text-2xl">{stat.valor}</p>
                            <p className="text-zinc-400 text-xs mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel derecho — formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 overflow-y-auto">
                <div className="w-full max-w-md">

                    {/* Logo móvil */}
                    <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                        <div className="w-8 h-8 rounded-xl bg-[#f5c518] flex items-center justify-center">
                            <Film size={17} className="text-black" strokeWidth={2.5} />
                        </div>
                        <span className="text-white font-black text-2xl tracking-tight">
                            Cine<span className="text-[#f5c518]">Log</span>
                        </span>
                    </div>

                    {/* Header */}
                    <div className="mb-7">
                        <h1 className="text-3xl font-black text-white mb-2">Crear cuenta</h1>
                        <p className="text-zinc-500 text-sm">Únete a CineLog y organiza tu mundo cinematográfico</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Nombre completo
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="Tu nombre"
                                    className="w-full bg-[#131313] border border-zinc-800 text-white text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#f5c518] placeholder:text-zinc-700 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="tu@correo.com"
                                    className="w-full bg-[#131313] border border-zinc-800 text-white text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#f5c518] placeholder:text-zinc-700 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-[#131313] border border-zinc-800 text-white text-sm pl-10 pr-11 py-3 rounded-xl focus:outline-none focus:border-[#f5c518] placeholder:text-zinc-700 transition-colors"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Requisitos */}
                            {form.password && (
                                <div className="mt-3 space-y-1.5 p-3 bg-[#131313] rounded-xl border border-zinc-800">
                                    <RequisitoPassword cumplido={requisitos.longitud} texto="Mínimo 8 caracteres" />
                                    <RequisitoPassword cumplido={requisitos.mayuscula} texto="Al menos una mayúscula" />
                                    <RequisitoPassword cumplido={requisitos.numero} texto="Al menos un número" />
                                </div>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmar"
                                    value={form.confirmar}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full bg-[#131313] border text-white text-sm pl-10 pr-11 py-3 rounded-xl focus:outline-none placeholder:text-zinc-700 transition-colors ${form.confirmar && form.confirmar !== form.password
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : form.confirmar && form.confirmar === form.password
                                            ? 'border-green-500/50 focus:border-green-500'
                                            : 'border-zinc-800 focus:border-[#f5c518]'
                                        }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.confirmar && form.confirmar !== form.password && (
                                <p className="text-red-400 text-xs mt-1.5">Las contraseñas no coinciden</p>
                            )}
                        </div>

                        {/* Botón submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#f5c518] text-black font-bold py-3.5 rounded-xl hover:bg-[#f0c110] active:scale-[0.98] transition-all shadow-lg shadow-[#f5c518]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={17} />
                                    Crear cuenta
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-zinc-600 text-xs">o regístrate con</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {/* Google */}
                    <button className="w-full flex items-center justify-center gap-3 bg-[#131313] border border-zinc-800 text-white text-sm font-medium py-3 rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>

                    {/* Link a login */}
                    <p className="text-center text-zinc-600 text-sm mt-8">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-[#f5c518] font-semibold hover:text-[#f0c110] transition-colors">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

/*interface RegistroProps {
  onLogin: (usuario: any) => void
}

export default function Registro({ onLogin }: RegistroProps) {
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="bg-[#1a1a1a] border border-yellow-500/20 rounded-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-[#f5c518] mb-6 text-center">
                    Crear cuenta
                </h1>
                <p className="text-gray-400 text-center">Próximamente...</p>
            </div>
        </div>
    )
}*/