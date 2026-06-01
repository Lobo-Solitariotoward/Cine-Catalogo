import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="hidden md:block mt-20"
            style={{ background: '#080808', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="max-w-[1600px] mx-auto px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">

                    {/* Brand */}
                    <div className="max-w-xs">
                        <Link to="/inicio" className="flex items-center gap-2.5 mb-4 group">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:shadow-gold"
                                style={{ background: 'linear-gradient(135deg, #f5c518, #c9a227)' }}>
                                <Film size={16} className="text-black" strokeWidth={2.5} />
                            </div>
                            <span className="font-display font-700 text-xl text-white">
                                Cine<span style={{ color: '#f5c518' }}>Log</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Tu catálogo personal de películas y series. Organiza, califica y descubre nuevo contenido.
                        </p>
                        <div className="flex gap-2 mt-5">
                            {['𝕏', '📷', '🎬'].map((icon, i) => (
                                <button key={i} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.color = '#00d4ff' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-3 gap-10 text-sm">
                        {[
                            { titulo: 'Navegación', links: [{ to: '/inicio', l: 'Inicio' }, { to: '/buscar', l: 'Buscar' }, { to: '/mis-listas', l: 'Mis Listas' }, { to: '/historial', l: 'Historial' }] },
                            { titulo: 'Cuenta', links: [{ to: '/perfil', l: 'Mi Perfil' }, { to: '/mis-resenas', l: 'Mis Reseñas' }, { to: '/recomendaciones', l: 'Recomendaciones' }, { to: '/notificaciones', l: 'Notificaciones' }] },
                            { titulo: 'Info', links: [{ to: '/acerca', l: 'Acerca de' }, { to: '/privacidad', l: 'Privacidad' }, { to: '/terminos', l: 'Términos' }, { to: '/contacto', l: 'Contacto' }] },
                        ].map(col => (
                            <div key={col.titulo}>
                                <p className="font-display font-600 text-white mb-4">{col.titulo}</p>
                                <div className="flex flex-col gap-2.5">
                                    {col.links.map(l => (
                                        <Link key={l.l} to={l.to} className="transition-colors text-sm"
                                            style={{ color: 'rgba(255,255,255,0.35)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#f5c518'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                                            {l.l}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        © 2026 CineLog. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Datos por</span>
                        <span className="text-xs font-semibold" style={{ color: '#00d4ff' }}>OMDb API</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}