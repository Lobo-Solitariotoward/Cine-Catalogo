import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Search, Bell, ChevronDown, X, Film, LogOut, User, Settings, Bookmark, Clock } from 'lucide-react'

const NAV_LINKS = [
    { to: '/inicio', label: 'Inicio' },
    { to: '/buscar', label: 'Películas' },
    { to: '/mis-listas', label: 'Mi Lista' },
    { to: '/historial', label: 'Historial' },
]

const MOCK_NOTIFICACIONES = [
    { id: 1, tipo: 'recomendacion', msg: 'Nueva recomendación: Oppenheimer', tiempo: '2m', leida: false },
    { id: 2, tipo: 'like', msg: 'A alguien le gustó tu reseña de Inception', tiempo: '1h', leida: false },
    { id: 3, tipo: 'sistema', msg: 'Bienvenido a CineLog 🎬', tiempo: '2d', leida: true },
]

interface NavbarProps {
  sesion: any
  onLogout: () => void
}

export default function Navbar({ sesion, onLogout }: NavbarProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [menuUsuario, setMenuUsuario] = useState(false)
    const [menuNotif, setMenuNotif] = useState(false)
    const [notifs, setNotifs] = useState(MOCK_NOTIFICACIONES)
    const menuRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    const sinLeer = notifs.filter(n => !n.leida).length

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Cerrar dropdowns al click fuera
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuUsuario(false)
            if (notifRef.current && !notifRef.current.contains(e.target)) setMenuNotif(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchOpen(false)
            setSearchQuery('')
        }
    }

    const handleLogout = () => {
        setMenuUsuario(false)
        onLogout()
        navigate('/login')
    }

    const marcarTodasLeidas = () => {
        setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
    }

    return (
        <>
            {/* Barra principal */}
            <nav className="fixed top-0 w-full z-50 transition-all duration-500"
                style={{
                    background: scrolled
                        ? 'rgba(8,8,8,0.98)'
                        : 'linear-gradient(180deg, rgba(8,8,8,0.95) 0%, transparent 100%)',
                    backdropFilter: scrolled ? 'blur(24px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                <div className="flex items-center justify-between h-[64px] px-8 max-w-[1600px] mx-auto">

                    {/* Logo */}
                    <div className="flex items-center gap-12">
                        <Link to="/inicio" className="flex items-center gap-2.5 group shrink-0">
                            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #f5c518, #c9a227)' }}>
                                <Film size={16} className="text-black" strokeWidth={2.5} />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.3), transparent)' }} />
                            </div>
                            <span className="font-display font-700 text-[20px] tracking-tight text-white">
                                Cine<span style={{ color: '#f5c518' }}>Log</span>
                            </span>
                        </Link>

                        {/* Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map(link => {
                                const active = pathname === link.to
                                return (
                                    <Link key={link.to} to={link.to}
                                        className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl"
                                        style={{
                                            color: active ? '#f5c518' : 'rgba(255,255,255,0.6)',
                                            background: active ? 'rgba(245,197,24,0.08)' : 'transparent',
                                        }}
                                        onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'white' }}
                                        onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                                    >
                                        {link.label}
                                        {active && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">

                        {/* Search */}
                        {searchOpen ? (
                            <form onSubmit={handleSearch}
                                className="flex items-center rounded-2xl overflow-hidden border"
                                style={{ background: 'rgba(20,20,20,0.9)', borderColor: 'rgba(0,212,255,0.3)', backdropFilter: 'blur(20px)' }}>
                                <Search size={15} className="ml-3.5 shrink-0" style={{ color: '#00d4ff' }} />
                                <input autoFocus type="text" value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Buscar películas, series..."
                                    className="bg-transparent text-white text-sm px-3 py-2.5 w-64 focus:outline-none placeholder:text-zinc-600" />
                                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                                    className="pr-3.5 text-zinc-600 hover:text-white transition-colors">
                                    <X size={15} />
                                </button>
                            </form>
                        ) : (
                            <button onClick={() => setSearchOpen(true)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                                style={{ color: 'rgba(255,255,255,0.5)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' }}>
                                <Search size={19} />
                            </button>
                        )}

                        {/* Notificaciones */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => { setMenuNotif(!menuNotif); setMenuUsuario(false) }}
                                className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                                style={{ color: menuNotif ? '#00d4ff' : 'rgba(255,255,255,0.5)', background: menuNotif ? 'rgba(0,212,255,0.08)' : 'transparent' }}
                                onMouseEnter={e => { if (!menuNotif) { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' } }}
                                onMouseLeave={e => { if (!menuNotif) { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' } }}>
                                <Bell size={19} />
                                {sinLeer > 0 && (
                                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                                        style={{ background: 'linear-gradient(135deg, #00d4ff, #1a6cff)', color: 'white', boxShadow: '0 0 8px rgba(0,212,255,0.5)' }}>
                                        {sinLeer}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown notificaciones */}
                            {menuNotif && (
                                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl z-50 fade-in"
                                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="flex items-center justify-between px-4 py-3 border-b"
                                        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        <h4 className="text-white font-display font-600 text-sm">Notificaciones</h4>
                                        {sinLeer > 0 && (
                                            <button onClick={marcarTodasLeidas}
                                                className="text-xs transition-colors"
                                                style={{ color: '#00d4ff' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#00d4ff'}>
                                                Marcar todas como leídas
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {notifs.map(n => (
                                            <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                                                style={{ background: n.leida ? 'transparent' : 'rgba(0,212,255,0.03)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                                onMouseLeave={e => e.currentTarget.style.background = n.leida ? 'transparent' : 'rgba(0,212,255,0.03)'}>
                                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                                    style={{ background: n.leida ? 'transparent' : '#00d4ff', boxShadow: n.leida ? 'none' : '0 0 6px #00d4ff' }} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm" style={{ color: n.leida ? 'rgba(255,255,255,0.5)' : 'white' }}>
                                                        {n.msg}
                                                    </p>
                                                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{n.tiempo}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        <Link to="/notificaciones" onClick={() => setMenuNotif(false)}
                                            className="text-xs text-center block w-full transition-colors"
                                            style={{ color: 'rgba(255,255,255,0.4)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#f5c518'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                                            Ver todas las notificaciones
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Avatar / menú usuario */}
                        <div className="relative ml-1" ref={menuRef}>
                            <button onClick={() => { setMenuUsuario(!menuUsuario); setMenuNotif(false) }}
                                className="flex items-center gap-2 pl-2 group">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-display font-700 text-sm ring-2 transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #f5c518, #c9a227)',
                                        ringColor: menuUsuario ? 'rgba(245,197,24,0.5)' : 'transparent',
                                        boxShadow: menuUsuario ? '0 0 0 2px rgba(245,197,24,0.4)' : '0 0 0 2px transparent',
                                    }}>
                                    {sesion?.avatar || 'U'}
                                </div>
                                <ChevronDown size={14} className="hidden md:block transition-transform duration-200"
                                    style={{ color: 'rgba(255,255,255,0.4)', transform: menuUsuario ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                            </button>

                            {menuUsuario && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-2xl z-50 fade-in"
                                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    {/* Info */}
                                    <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-700"
                                                style={{ background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: 'black' }}>
                                                {sesion?.avatar || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-semibold truncate">{sesion?.nombre}</p>
                                                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{sesion?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div className="py-2">
                                        {[
                                            { to: '/perfil', icon: User, label: 'Mi Perfil' },
                                            { to: '/mis-listas', icon: Bookmark, label: 'Mis Listas' },
                                            { to: '/historial', icon: Clock, label: 'Historial' },
                                        ].map(item => (
                                            <Link key={item.to} to={item.to} onClick={() => setMenuUsuario(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                                                style={{ color: 'rgba(255,255,255,0.6)' }}
                                                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent' }}>
                                                <item.icon size={15} />
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t py-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        <button onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                                            style={{ color: 'rgba(239,68,68,0.8)' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.8)'; e.currentTarget.style.background = 'transparent' }}>
                                            <LogOut size={15} />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Bottom nav móvil */}
            <nav className="md:hidden fixed bottom-0 w-full z-50"
                style={{ background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-around items-center py-3 px-2">
                    {[
                        { to: '/inicio', icon: '🏠', label: 'Inicio' },
                        { to: '/buscar', icon: '🔍', label: 'Buscar' },
                        { to: '/mis-listas', icon: '🔖', label: 'Mi Lista' },
                        { to: '/perfil', icon: '👤', label: 'Perfil' },
                    ].map(item => (
                        <Link key={item.to} to={item.to}
                            className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all"
                            style={{ color: pathname === item.to ? '#f5c518' : 'rgba(255,255,255,0.4)' }}>
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    )
}

/*import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full h-16 bg-[#0f0f0f]/90 backdrop-blur-sm
                    border-b border-yellow-500/20 z-50 flex items-center px-6 gap-6">
            <Link to="/" className="text-[#f5c518] font-bold text-xl tracking-wide">
                🎬 CineLog
            </Link>
            <Link to="/buscar"
                className="text-gray-400 hover:text-white transition-colors text-sm">
                Buscar
            </Link>
            <Link to="/mis-listas"
                className="text-gray-400 hover:text-white transition-colors text-sm">
                Mis listas
            </Link>
        </nav>
    )
}*/