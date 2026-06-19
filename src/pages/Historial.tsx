// @ts-nocheck
import { useState, useEffect } from 'react'
import { Trash2, Clock, Filter, Loader, Plus, Search, X, Check, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { buscarPeliculas } from '../services/movieService'
import log from '../utils/logger'

const PLATAFORMAS = ['Todas', 'Netflix', 'Prime Video', 'HBO Max', 'Disney+', 'Apple TV+', 'Cine', 'Otro']

const COLORES_PLATAFORMA: Record<string, string> = {
    Netflix: 'rgba(229,9,20,0.15)',
    'Prime Video': 'rgba(0,168,225,0.15)',
    'HBO Max': 'rgba(139,92,246,0.15)',
    'Disney+': 'rgba(26,108,255,0.15)',
    'Apple TV+': 'rgba(255,255,255,0.12)',
    Cine: 'rgba(245,197,24,0.15)',
    Otro: 'rgba(255,255,255,0.08)',
}

const TEXTO_PLATAFORMA: Record<string, string> = {
    Netflix: '#e50914',
    'Prime Video': '#00a8e1',
    'HBO Max': '#8b5cf6',
    'Disney+': '#1a6cff',
    'Apple TV+': '#e5e5e5',
    Cine: '#f5c518',
    Otro: 'rgba(255,255,255,0.5)',
}

function formatFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

// Hook debounce
function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debounced
}

// ─── Modal para agregar al historial con búsqueda ─────────────
function ModalAgregarHistorial({ onAgregar, onCerrar }) {
    const [query, setQuery] = useState('')
    const [resultados, setResultados] = useState([])
    const [buscando, setBuscando] = useState(false)
    const [seleccionada, setSeleccionada] = useState(null)
    const [plataforma, setPlataforma] = useState('Netflix')
    const [guardando, setGuardando] = useState(false)
    const debouncedQuery = useDebounce(query, 500)

    useEffect(() => {
        if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
            setResultados([])
            return
        }
        const buscar = async () => {
            setBuscando(true)
            try {
                const data = await buscarPeliculas(debouncedQuery)
                setResultados(data?.slice(0, 6) || [])
            } catch {
                setResultados([])
            } finally {
                setBuscando(false)
            }
        }
        buscar()
    }, [debouncedQuery])

    const handleGuardar = async () => {
        if (!seleccionada) return
        setGuardando(true)
        await onAgregar(seleccionada, plataforma)
        setGuardando(false)
    }

    return (
        <div onClick={onCerrar}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div onClick={e => e.stopPropagation()}
                style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24, width: '100%', maxWidth: 480 }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18 }}>
                        Agregar al historial
                    </h3>
                    <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Búsqueda */}
                <div style={{ position: 'relative', marginBottom: 12 }}>
                    <Search size={15} color="rgba(255,255,255,0.3)"
                        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSeleccionada(null) }}
                        placeholder="Buscar película o serie..."
                        style={{ width: '100%', background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 16px 12px 42px', borderRadius: 14, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#f5c518'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    {buscando && (
                        <Loader size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#f5c518', animation: 'spin 1s linear infinite' }} />
                    )}
                </div>

                {/* Película seleccionada */}
                {seleccionada && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 12, marginBottom: 12 }}>
                        <img src={seleccionada.Poster !== 'N/A' ? seleccionada.Poster : ''} alt={seleccionada.Title}
                            style={{ width: 36, height: 52, objectFit: 'cover', borderRadius: 8, background: '#1c1c1c', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#00d4ff', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seleccionada.Title}</p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{seleccionada.Year}</p>
                        </div>
                        <Check size={16} color="#00d4ff" />
                    </div>
                )}

                {/* Resultados de búsqueda */}
                {!seleccionada && resultados.length > 0 && (
                    <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', marginBottom: 12, maxHeight: 280, overflowY: 'auto' }}>
                        {resultados.map(p => (
                            <button key={p.imdbID} onClick={() => { setSeleccionada(p); setQuery(p.Title) }}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                {p.Poster && p.Poster !== 'N/A' ? (
                                    <img src={p.Poster} alt={p.Title} style={{ width: 32, height: 46, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                                ) : (
                                    <div style={{ width: 32, height: 46, borderRadius: 6, background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎬</div>
                                )}
                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                    <p style={{ color: 'white', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.Title}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
                                        {p.Year} · {p.Type === 'series' ? 'Serie' : 'Película'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Sin resultados */}
                {!seleccionada && query.length >= 2 && !buscando && resultados.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 12 }}>
                        No se encontraron resultados para "{query}"
                    </div>
                )}

                {/* Plataforma */}
                {seleccionada && (
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
                            ¿Dónde la viste?
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['Netflix', 'Prime Video', 'HBO Max', 'Disney+', 'Apple TV+', 'Cine', 'Otro'].map(p => (
                                <button key={p} onClick={() => setPlataforma(p)}
                                    style={{ padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, border: `1px solid ${plataforma === p ? 'rgba(245,197,24,0.4)' : 'rgba(255,255,255,0.08)'}`, background: plataforma === p ? 'rgba(245,197,24,0.1)' : 'transparent', color: plataforma === p ? '#f5c518' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onCerrar}
                        style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}>
                        Cancelar
                    </button>
                    <button onClick={handleGuardar} disabled={!seleccionada || guardando}
                        style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: seleccionada ? 'linear-gradient(135deg, #f5c518, #c9a227)' : 'rgba(255,255,255,0.08)', color: seleccionada ? '#080808' : 'rgba(255,255,255,0.3)', fontWeight: 700, cursor: seleccionada ? 'pointer' : 'not-allowed', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                        {guardando ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Página Historial ─────────────────────────────────────────
interface HistorialProps { sesion: any }
export default function Historial({ sesion }: HistorialProps) {
    const [historial, setHistorial] = useState([])
    const [filtro, setFiltro] = useState('Todas')
    const [cargando, setCargando] = useState(true)
    const [sincronizando, setSincronizando] = useState(false)
    const [toast, setToast] = useState(null)
    const [modalAgregar, setModalAgregar] = useState(false)

    const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

    const cargarHistorial = async () => {
        if (!sesion?.id) { setCargando(false); return }
        try {
            const { data } = await api.get(`/history/${sesion.id}`)
            setHistorial(data)
            log.info('Historial cargado', { total: data.length })
        } catch (err) {
            log.error('Error cargando historial', err)
            setHistorial([])
        } finally {
            setCargando(false)
        }
    }

    // READ
    useEffect(() => { cargarHistorial() }, [sesion])

    // SYNC desde Mi Lista (películas marcadas como "visto" sin entrada en historial)
    const sincronizarDesdeListas = async () => {
        setSincronizando(true)
        try {
            const { data } = await api.post('/lists/sync-historial', { plataforma: 'Otro' })
            if (data.creadas > 0) {
                await cargarHistorial()
                mostrarToast(`${data.creadas} película${data.creadas > 1 ? 's' : ''} sincronizada${data.creadas > 1 ? 's' : ''} desde Mi Lista ✓`)
            } else {
                mostrarToast('Tu historial ya está al día')
            }
        } catch (err) {
            log.error('Error sincronizando', err)
            mostrarToast('Error al sincronizar')
        } finally {
            setSincronizando(false)
        }
    }

    // CREATE
    const handleAgregar = async (pelicula, plataforma) => {
        try {
            // Cachear en MongoDB + MySQL
            await api.get(`/movies/${pelicula.imdbID}`)
            const { data: peliculaMySQL } = await api.get(`/movies/mysql/${pelicula.imdbID}`)

            const { data: entrada } = await api.post('/history', {
                pelicula_id: peliculaMySQL.id,
                plataforma
            })

            setHistorial(prev => [{
                ...entrada,
                pelicula: peliculaMySQL,
                plataforma,
            }, ...prev])

            setModalAgregar(false)
            mostrarToast(`"${pelicula.Title}" agregada al historial ✓`)
        } catch (err) {
            console.error(err)
            mostrarToast('Error al agregar al historial')
        }
    }

    // DELETE
    const handleEliminar = async (id, titulo) => {
        try {
            await api.delete(`/history/${id}`)
            setHistorial(prev => prev.filter(h => h.id !== id))
            mostrarToast(`"${titulo}" eliminada del historial`)
        } catch {
            mostrarToast('Error al eliminar del historial')
        }
    }

    const resultados = historial.filter(h =>
        filtro === 'Todas' || h.plataforma === filtro
    )

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '32px 32px 0' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white', marginBottom: 6 }}>Historial</h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Películas y series que has visto, agrupadas por plataforma</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={sincronizarDesdeListas} disabled={sincronizando}
                            title="Importa las películas marcadas como vistas en Mi Lista que aún no están aquí"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, padding: '11px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', cursor: sincronizando ? 'wait' : 'pointer', fontSize: 13 }}>
                            {sincronizando
                                ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                : <RefreshCw size={15} />}
                            Sincronizar Mi Lista
                        </button>
                        <button onClick={() => setModalAgregar(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                            <Plus size={16} /> Agregar
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
                    <Filter size={15} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
                    {PLATAFORMAS.map(p => (
                        <button key={p} onClick={() => setFiltro(p)}
                            style={{ padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', border: `1px solid ${filtro === p ? 'rgba(245,197,24,0.4)' : 'rgba(255,255,255,0.08)'}`, background: filtro === p ? 'rgba(245,197,24,0.1)' : 'transparent', color: filtro === p ? '#f5c518' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>
                            {p}
                        </button>
                    ))}
                </div>

                {/* Cargando */}
                {cargando && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0' }}>
                        <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: '#f5c518' }} />
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Cargando historial...</span>
                    </div>
                )}

                {/* Vacío */}
                {!cargando && resultados.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 12 }}>
                        <div style={{ fontSize: 56 }}>🎬</div>
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 20 }}>Sin historial</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
                            {filtro !== 'Todas' ? `No hay películas de ${filtro}` : 'No has registrado películas vistas aún'}
                        </p>
                        <button onClick={() => setModalAgregar(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, padding: '11px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, marginTop: 8 }}>
                            <Plus size={16} /> Agregar película
                        </button>
                    </div>
                )}

                {/* Lista agrupada por plataforma */}
                {!cargando && resultados.length > 0 && (() => {
                    // Agrupa por plataforma
                    const grupos: Record<string, any[]> = {}
                    resultados.forEach(item => {
                        const p = item.plataforma || 'Otro'
                        if (!grupos[p]) grupos[p] = []
                        grupos[p].push(item)
                    })
                    // Orden estable: Netflix, Prime Video, HBO Max, Disney+, Apple TV+, Cine, Otro
                    const ordenPlataformas = ['Netflix', 'Prime Video', 'HBO Max', 'Disney+', 'Apple TV+', 'Cine', 'Otro']
                    const plataformasOrdenadas = Object.keys(grupos).sort((a, b) => {
                        const ia = ordenPlataformas.indexOf(a)
                        const ib = ordenPlataformas.indexOf(b)
                        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
                    })

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 900 }}>
                            {plataformasOrdenadas.map(plataforma => {
                                const items = grupos[plataforma]
                                const colorBg = COLORES_PLATAFORMA[plataforma] || COLORES_PLATAFORMA['Otro']
                                const colorTexto = TEXTO_PLATAFORMA[plataforma] || TEXTO_PLATAFORMA['Otro']
                                return (
                                    <section key={plataforma}>
                                        {/* Encabezado de plataforma */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                            <span style={{ fontSize: 13, padding: '5px 14px', borderRadius: 999, background: colorBg, color: colorTexto, fontWeight: 700, border: `1px solid ${colorTexto}30` }}>
                                                {plataforma}
                                            </span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                                                {items.length} {items.length === 1 ? 'película' : 'películas'}
                                            </span>
                                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)', marginLeft: 8 }} />
                                        </div>

                                        {/* Películas de esta plataforma */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {items.map(item => {
                                                const titulo = item.pelicula?.titulo || 'Película'
                                                const poster = item.pelicula?.poster_url

                                                return (
                                                    <div key={item.id}
                                                        style={{ display: 'flex', gap: 16, padding: 16, background: '#141414', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s', alignItems: 'center' }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>

                                                        <div style={{ width: 48, height: 68, borderRadius: 10, overflow: 'hidden', background: '#1c1c1c', flexShrink: 0 }}>
                                                            {poster ? (
                                                                <img src={poster} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎬</div>
                                                            )}
                                                        </div>

                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <h3 style={{ color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {titulo}
                                                            </h3>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                                                                <Clock size={11} />
                                                                {formatFecha(item.visto_en || item.creado_en)}
                                                            </div>
                                                        </div>

                                                        <button onClick={() => handleEliminar(item.id, titulo)}
                                                            style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'transparent' }}>
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )
                            })}
                        </div>
                    )
                })()}
            </div>

            {modalAgregar && (
                <ModalAgregarHistorial
                    onAgregar={handleAgregar}
                    onCerrar={() => setModalAgregar(false)}
                />
            )}

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
