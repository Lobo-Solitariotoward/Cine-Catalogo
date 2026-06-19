// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Plus, Check, X, Loader } from 'lucide-react'
import { buscarPeliculas } from '../services/movieService'
import { agregarALista } from '../services/listService'

const FILTROS = [
    { label: 'Todos', value: '' },
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'series' },
]

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debounced
}

// ─── Tarjeta — solo recibe props, no maneja lógica de API ─────
interface TarjetaResultadoProps {
    pelicula: any
    enLista: boolean
    onAgregar: (p: any) => Promise<void>
    onVerDetalle: (imdbId: string) => void
}
function TarjetaResultado({ pelicula, enLista, onAgregar, onVerDetalle }: TarjetaResultadoProps) {
    const [agregando, setAgregando] = useState(false)

    const handleClick = async () => {
        if (enLista || agregando) return
        setAgregando(true)
        await onAgregar(pelicula)
        setAgregando(false)
    }

    return (
        <Link to={`/detalle/${pelicula.imdbID}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
            background: '#141414', borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s', cursor: 'pointer',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>

            <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: '#1c1c1c' }}>
                {pelicula.Poster && pelicula.Poster !== 'N/A' ? (
                    <img src={pelicula.Poster} alt={pelicula.Title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 48 }}>
                        🎬
                    </div>
                )}

                {/* Badge tipo */}
                <div style={{
                    position: 'absolute', top: 8, left: 8,
                    padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: pelicula.Type === 'series' ? 'rgba(139,92,246,0.8)' : 'rgba(245,197,24,0.8)',
                    color: pelicula.Type === 'series' ? 'white' : '#080808',
                }}>
                    {pelicula.Type === 'series' ? 'Serie' : 'Película'}
                </div>

                {/* Botón agregar — llama a onAgregar (prop del padre) */}
                <button
                    data-testid={`agregar-${pelicula.imdbID}`}
                    aria-label={enLista ? `${pelicula.Title} ya esta en tu lista` : `Agregar ${pelicula.Title} a mi lista`}
                    onClick={handleClick}
                    style={{
                        position: 'absolute', bottom: 8, right: 8,
                        width: 36, height: 36, borderRadius: 10,
                        background: enLista ? 'rgba(0,212,255,0.2)' : 'rgba(245,197,24,0.9)',
                        border: enLista ? '1px solid rgba(0,212,255,0.4)' : 'none',
                        cursor: enLista ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: enLista ? '#00d4ff' : '#080808',
                        transition: 'all 0.2s',
                    }}>
                    {agregando
                        ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        : enLista ? <Check size={15} /> : <Plus size={15} />}
                </button>
            </div>

            <div style={{ padding: '12px' }}>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pelicula.Title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{pelicula.Year}</p>
            </div>
        </div>
        </Link>
    )
}

// ─── Página principal ─────────────────────────────────────────
export default function Buscar() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [filtro, setFiltro] = useState('')
    const [resultados, setResultados] = useState([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)
    const [lista, setLista] = useState([])
    const [toast, setToast] = useState(null)
    const debouncedQuery = useDebounce(query, 500)

    const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

    useEffect(() => {
        if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
            setResultados([])
            return
        }
        const buscar = async () => {
            setCargando(true)
            setError(null)
            try {
                const data = await buscarPeliculas(debouncedQuery, filtro)
                setResultados(data || [])
            } catch (err) {
                setError('Error al buscar. Intenta de nuevo.')
                setResultados([])
            } finally {
                setCargando(false)
            }
        }
        buscar()
    }, [debouncedQuery, filtro])

    // ─── handleAgregar vive aquí — tiene acceso a lista y mostrarToast ───
    const handleAgregar = async (pelicula) => {
        if (lista.find(p => p.imdbID === pelicula.imdbID)) {
            mostrarToast(`"${pelicula.Title}" ya está en tu lista`)
            return
        }
        try {
            // 1. Guardar película en MySQL + MongoDB via nuestra API
            const { obtenerDetalle } = await import('../services/movieService')
            await obtenerDetalle(pelicula.imdbID)

            // 2. Obtener el ID de MySQL
            const { default: api } = await import('../services/api')
            const { data: peliculaMySQL } = await api.get(`/movies/mysql/${pelicula.imdbID}`)

            // 3. Agregar a lista del usuario
            await agregarALista(peliculaMySQL.id, 'por_ver')

            setLista(prev => [...prev, pelicula])
            mostrarToast(`"${pelicula.Title}" agregada a tu lista ✓`)
        } catch (err) {
            console.error('Error al agregar:', err)
            mostrarToast('Error al agregar a la lista')
        }
    }

    const handleVerDetalle = (imdbId: string) => {
        navigate(`/detalle/${imdbId}`)
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <div style={{ width: '100%', maxWidth: 1600, margin: '0 auto', padding: '32px 32px 0' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white', marginBottom: 6 }}>
                        Buscar
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                        Encuentra películas y series para tu catálogo
                    </p>
                </div>

                {/* Barra de búsqueda */}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                    <Search size={18} color="rgba(255,255,255,0.3)"
                        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        data-testid="buscar-input"
                        aria-label="Buscar peliculas o series por titulo"
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar por título... (ej: Inception, Breaking Bad)"
                        style={{
                            width: '100%', background: '#141414',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'white', padding: '16px 48px',
                            borderRadius: 16, fontSize: 15, outline: 'none',
                            fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#f5c518'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} aria-label="Limpiar busqueda"
                            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                    <SlidersHorizontal size={15} color="rgba(255,255,255,0.3)" />
                    {FILTROS.map(f => (
                        <button key={f.value} data-testid={`filtro-${f.value || 'todos'}`} onClick={() => setFiltro(f.value)}
                            style={{
                                padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                                border: `1px solid ${filtro === f.value ? 'rgba(245,197,24,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                background: filtro === f.value ? 'rgba(245,197,24,0.1)' : 'transparent',
                                color: filtro === f.value ? '#f5c518' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                            {f.label}
                        </button>
                    ))}
                    {resultados.length > 0 && (
                        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Cargando */}
                {cargando && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>
                        <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: '#f5c518' }} />
                        <span style={{ fontSize: 15 }}>Buscando en OMDb...</span>
                    </div>
                )}

                {/* Error */}
                {error && !cargando && (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <p style={{ color: '#ef4444', fontSize: 15 }}>{error}</p>
                    </div>
                )}

                {/* Sin resultados */}
                {!cargando && !error && query.length >= 2 && resultados.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 12 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#141414', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔍</div>
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18 }}>Sin resultados</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
                            No encontramos nada para "{query}". Intenta con otro título.
                        </p>
                    </div>
                )}

                {/* Pantalla inicial */}
                {!cargando && query.length < 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 12 }}>
                        <div style={{ fontSize: 64 }}>🎬</div>
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 20 }}>¿Qué quieres ver hoy?</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Escribe al menos 2 caracteres para buscar</p>
                    </div>
                )}

                {/* Grid de resultados */}
                {!cargando && resultados.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                        {resultados.map(p => (
                            <TarjetaResultado
                                key={p.imdbID}
                                pelicula={p}
                                enLista={!!lista.find((l: any) => l.imdbID === p.imdbID)}
                                onAgregar={handleAgregar}
                                onVerDetalle={handleVerDetalle}
                            />
                        ))}
                    </div>
                )}
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


/*export default function Buscar() {
    return (
        <div className="p-8 text-white">
            <h1 className="text-2xl font-bold text-[#f5c518]">
                Buscar películas
            </h1>
            <p className="text-gray-400 mt-2">Próximamente...</p>
        </div>
    )
}*/
