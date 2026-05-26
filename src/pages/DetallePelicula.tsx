import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Plus, Star, X, ChevronLeft, ThumbsUp, Trash2, Edit3, Check, Send, Loader } from 'lucide-react'
import api from '../services/api'
import { crearResena, actualizarResena, eliminarResena, darLike } from '../services/reviewService'
import { agregarALista } from '../services/listService'

interface DetallePeliculaProps {
    sesion: any
}

// ─── Modal Trailer ────────────────────────────────────────────
function ModalTrailer({ videoId, titulo, onCerrar }: { videoId: string; titulo: string; onCerrar: () => void }) {
    return (
        <div onClick={onCerrar}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(16px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 960 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                        <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 20 }}>{titulo}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>Tráiler oficial</p>
                    </div>
                    <button onClick={onCerrar} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <X size={18} />
                    </button>
                </div>
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', borderRadius: 20, overflow: 'hidden' }}>
                    <iframe
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                        title={titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                </div>
            </div>
        </div>
    )
}

// ─── Selector de estrellas ────────────────────────────────────
function SelectorEstrellas({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0)
    return (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: n <= (hover || valor) ? '#f5c518' : 'rgba(255,255,255,0.2)', transition: 'color 0.1s', fontSize: 18, lineHeight: 1 }}>
                    ★
                </button>
            ))}
            <span style={{ color: '#f5c518', fontSize: 13, fontWeight: 700, marginLeft: 4 }}>{hover || valor}/10</span>
        </div>
    )
}

// ─── Tarjeta Reseña ───────────────────────────────────────────
function TarjetaResena({ resena, sesionId, onLike, onEditar, onEliminar }: {
    resena: any; sesionId: number; onLike: (id: number) => void;
    onEditar: (r: any) => void; onEliminar: (id: number) => void
}) {
    const esMia = resena.usuario_id === sesionId

    return (
        <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #f5c518, #c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#080808', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {(resena.usuario?.nombre || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{resena.usuario?.nombre || 'Usuario'}</p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>
                            {new Date(resena.creado_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 8, padding: '4px 10px' }}>
                    <Star size={12} fill="#f5c518" color="#f5c518" />
                    <span style={{ color: '#f5c518', fontSize: 13, fontWeight: 700 }}>{resena.calificacion ?? 5}/10</span>
                </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{resena.texto}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => onLike(resena.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00d4ff'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                    <ThumbsUp size={13} /> {resena.likes ?? 0}
                </button>
                {esMia && (
                    <>
                        <button onClick={() => onEditar(resena)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#f5c518'; e.currentTarget.style.borderColor = 'rgba(245,197,24,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                            <Edit3 size={13} /> Editar
                        </button>
                        <button onClick={() => onEliminar(resena.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', fontSize: 12, transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                            <Trash2 size={13} /> Eliminar
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

// ─── Página principal ─────────────────────────────────────────
export default function DetallePelicula({ sesion }: DetallePeliculaProps) {
    const { imdbId } = useParams<{ imdbId: string }>()
    const navigate = useNavigate()

    const [pelicula, setPelicula] = useState<any>(null)
    const [peliculaMySQL, setPeliculaMySQL] = useState<any>(null)
    const [resenas, setResenas] = useState<any[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Agregar a lista
    const [enLista, setEnLista] = useState(false)
    const [agregando, setAgregando] = useState(false)

    // Trailer
    const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null)
    const [trailerOpen, setTrailerOpen] = useState(false)
    const [buscandoTrailer, setBuscandoTrailer] = useState(false)

    // Nueva reseña
    const [nuevaResena, setNuevaResena] = useState('')
    const [nuevaCalif, setNuevaCalif] = useState(7)
    const [enviandoResena, setEnviandoResena] = useState(false)

    // Editar reseña
    const [editando, setEditando] = useState<any>(null)
    const [editTexto, setEditTexto] = useState('')
    const [editCalif, setEditCalif] = useState(7)

    // ─── Cargar datos de película y reseñas ───────────────────
    useEffect(() => {
        if (!imdbId) return
        const cargar = async () => {
            setCargando(true)
            setError(null)
            try {
                // 1. Detalle completo desde MongoDB/OMDb
                const detalle = await api.get(`/movies/${imdbId}`).then(r => r.data)
                setPelicula(detalle)

                // 2. Referencia MySQL (para usar el id numérico en reseñas)
                const mysql = await api.get(`/movies/mysql/${imdbId}`).then(r => r.data)
                setPeliculaMySQL(mysql)

                // 3. Reseñas de esa película
                const revs = await api.get(`/reviews/${mysql.id}`).then(r => r.data)
                setResenas(revs)
            } catch (err: any) {
                setError(err.response?.data?.error || 'Error al cargar la película')
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [imdbId])

    // ─── Ver Tráiler ──────────────────────────────────────────
    const handleVerTrailer = async () => {
        // Si ya tenemos el videoId, abrir directo
        if (trailerVideoId) { setTrailerOpen(true); return }
        setBuscandoTrailer(true)
        try {
            const titulo = pelicula?.titulo || peliculaMySQL?.titulo || ''
            const { data } = await api.get('/movies/trailer', { params: { q: titulo } })
            setTrailerVideoId(data.videoId)
            setTrailerOpen(true)
        } catch {
            alert('No se encontró el tráiler, intenta más tarde.')
        }
        setBuscandoTrailer(false)
    }

    // ─── Agregar a lista ──────────────────────────────────────
    const handleAgregarLista = async () => {
        if (!peliculaMySQL || agregando || enLista) return
        setAgregando(true)
        try {
            await agregarALista(peliculaMySQL.id, 'por_ver')
            setEnLista(true)
        } catch { }
        setAgregando(false)
    }

    // ─── Crear reseña ─────────────────────────────────────────
    const handleCrearResena = async () => {
        if (!nuevaResena.trim() || !peliculaMySQL) return
        setEnviandoResena(true)
        try {
            const resena = await crearResena(peliculaMySQL.id, nuevaResena.trim(), nuevaCalif)
            // Agregar con nombre del usuario desde sesión
            setResenas(prev => [{ ...resena, usuario: { id: sesion?.id, nombre: sesion?.nombre }, usuario_id: sesion?.id }, ...prev])
            setNuevaResena('')
            setNuevaCalif(7)
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al crear reseña')
        }
        setEnviandoResena(false)
    }

    // ─── Editar reseña ────────────────────────────────────────
    const handleIniciarEdicion = (resena: any) => {
        setEditando(resena)
        setEditTexto(resena.texto)
        setEditCalif(resena.calificacion ?? 5)
    }

    const handleGuardarEdicion = async () => {
        if (!editando) return
        try {
            const actualizada = await actualizarResena(editando.id, editTexto.trim(), editCalif)
            setResenas(prev => prev.map(r => r.id === editando.id ? { ...r, texto: actualizada.texto, calificacion: actualizada.calificacion } : r))
            setEditando(null)
        } catch { alert('Error al actualizar reseña') }
    }

    // ─── Eliminar reseña ──────────────────────────────────────
    const handleEliminarResena = async (id: number) => {
        if (!confirm('¿Eliminar esta reseña?')) return
        try {
            await eliminarResena(id)
            setResenas(prev => prev.filter(r => r.id !== id))
        } catch { alert('Error al eliminar reseña') }
    }

    // ─── Like ─────────────────────────────────────────────────
    const handleLike = async (id: number) => {
        try {
            const { likes } = await darLike(id)
            setResenas(prev => prev.map(r => r.id === id ? { ...r, likes } : r))
        } catch { }
    }

    // ─── Loading ──────────────────────────────────────────────
    if (cargando) return (
        <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <Loader size={36} style={{ color: '#f5c518', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Cargando película...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (error || !pelicula) return (
        <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 48 }}>😕</p>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>No encontramos esta película</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{error}</p>
            <button onClick={() => navigate(-1)}
                style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.3)', color: '#f5c518', cursor: 'pointer', fontSize: 14 }}>
                ← Volver
            </button>
        </div>
    )

    // Poster desde MySQL (más confiable) o fallback
    const posterUrl = peliculaMySQL?.poster_url || null
    const rating = peliculaMySQL?.calificacion_imdb || null

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

            {/* Hero con fondo borroso */}
            <div style={{ position: 'relative', minHeight: 520, overflow: 'hidden' }}>
                {posterUrl && (
                    <>
                        <img src={posterUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(28px) brightness(0.25)', transform: 'scale(1.1)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.7) 60%, #080808 100%)' }} />
                    </>
                )}

                {/* Contenido hero */}
                <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '80px 32px 48px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>

                    {/* Poster */}
                    <div style={{ flexShrink: 0, width: 220, borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {posterUrl
                            ? <img src={posterUrl} alt={pelicula.titulo} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                            : <div style={{ width: '100%', aspectRatio: '2/3', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🎬</div>
                        }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0, animation: 'fadeIn 0.4s ease' }}>
                        {/* Back button */}
                        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>
                            <ChevronLeft size={16} /> Volver
                        </button>

                        {/* Tipo badge */}
                        {peliculaMySQL?.tipo && (
                            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: peliculaMySQL.tipo === 'serie' ? 'rgba(139,92,246,0.2)' : 'rgba(245,197,24,0.15)', color: peliculaMySQL.tipo === 'serie' ? '#a78bfa' : '#f5c518', border: `1px solid ${peliculaMySQL.tipo === 'serie' ? 'rgba(139,92,246,0.3)' : 'rgba(245,197,24,0.25)'}`, marginBottom: 12 }}>
                                {peliculaMySQL.tipo === 'serie' ? 'Serie' : 'Película'}
                            </span>
                        )}

                        <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 42, color: 'white', lineHeight: 1.1, marginBottom: 12 }}>
                            {pelicula.titulo}
                        </h1>

                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                            {peliculaMySQL?.anio && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{peliculaMySQL.anio}</span>}
                            {pelicula.duracion && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{pelicula.duracion}</span>}
                            {rating && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.25)', borderRadius: 10, padding: '4px 12px' }}>
                                    <Star size={13} fill="#f5c518" color="#f5c518" />
                                    <span style={{ color: '#f5c518', fontWeight: 700, fontSize: 14 }}>{rating} IMDb</span>
                                </div>
                            )}
                            {pelicula.idioma && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{pelicula.idioma}</span>}
                        </div>

                        {/* Géneros */}
                        {pelicula.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                                {pelicula.tags.map((tag: string) => (
                                    <span key={tag} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Sinopsis */}
                        {pelicula.sinopsis && pelicula.sinopsis !== 'N/A' && (
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 700 }}>{pelicula.sinopsis}</p>
                        )}

                        {/* Director y reparto */}
                        <div style={{ display: 'flex', gap: 32, marginBottom: 28, flexWrap: 'wrap' }}>
                            {pelicula.director && pelicula.director !== 'N/A' && (
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Director</p>
                                    <p style={{ color: 'white', fontSize: 14 }}>{pelicula.director}</p>
                                </div>
                            )}
                            {pelicula.reparto?.length > 0 && (
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Reparto</p>
                                    <p style={{ color: 'white', fontSize: 14 }}>{pelicula.reparto.slice(0, 4).join(', ')}</p>
                                </div>
                            )}
                        </div>

                        {/* Acciones */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button onClick={handleVerTrailer} disabled={buscandoTrailer}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, cursor: buscandoTrailer ? 'wait' : 'pointer', fontSize: 15, opacity: buscandoTrailer ? 0.8 : 1 }}>
                                {buscandoTrailer
                                    ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Buscando...</>
                                    : <><Play size={16} fill="#080808" /> Ver Tráiler</>}
                            </button>
                            <button onClick={handleAgregarLista} disabled={enLista || agregando}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, border: `1px solid ${enLista ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.15)'}`, background: enLista ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.06)', color: enLista ? '#00d4ff' : 'white', fontWeight: 600, cursor: enLista ? 'default' : 'pointer', fontSize: 15 }}>
                                {agregando ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : enLista ? <Check size={15} /> : <Plus size={15} />}
                                {enLista ? 'En mi lista' : 'Agregar a lista'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección reseñas */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 0' }}>
                <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 24, color: 'white', marginBottom: 24 }}>
                    Reseñas de la comunidad
                    {resenas.length > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 400, marginLeft: 12 }}>({resenas.length})</span>}
                </h2>

                {/* Formulario nueva reseña */}
                <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 32 }}>
                    <h3 style={{ color: 'white', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
                        {editando ? '✏️ Editar reseña' : '✍️ Escribir reseña'}
                    </h3>

                    {/* Estrellas */}
                    <div style={{ marginBottom: 14 }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 }}>Calificación</p>
                        <SelectorEstrellas
                            valor={editando ? editCalif : nuevaCalif}
                            onChange={editando ? setEditCalif : setNuevaCalif}
                        />
                    </div>

                    <textarea
                        value={editando ? editTexto : nuevaResena}
                        onChange={e => editando ? setEditTexto(e.target.value) : setNuevaResena(e.target.value)}
                        placeholder="¿Qué te pareció esta película? Comparte tu opinión..."
                        rows={4}
                        style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', color: 'white', borderRadius: 12, padding: '14px 16px', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
                        onFocus={e => e.target.style.borderColor = '#f5c518'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />

                    <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                        {editando && (
                            <button onClick={() => setEditando(null)}
                                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14 }}>
                                Cancelar
                            </button>
                        )}
                        <button
                            onClick={editando ? handleGuardarEdicion : handleCrearResena}
                            disabled={enviandoResena || (editando ? !editTexto.trim() : !nuevaResena.trim())}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: enviandoResena ? 0.7 : 1 }}>
                            {editando ? <><Check size={15} /> Guardar</> : <><Send size={15} /> Publicar</>}
                        </button>
                    </div>
                </div>

                {/* Lista de reseñas */}
                {resenas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
                        <p style={{ fontSize: 48, marginBottom: 12 }}>🎬</p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Sin reseñas aún</p>
                        <p style={{ fontSize: 14 }}>¡Sé el primero en opinar sobre esta película!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {resenas.map(r => (
                            <TarjetaResena
                                key={r.id}
                                resena={r}
                                sesionId={sesion?.id}
                                onLike={handleLike}
                                onEditar={handleIniciarEdicion}
                                onEliminar={handleEliminarResena}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal trailer */}
            {trailerOpen && trailerVideoId && (
                <ModalTrailer
                    videoId={trailerVideoId}
                    titulo={pelicula?.titulo || ''}
                    onCerrar={() => setTrailerOpen(false)}
                />
            )}
        </div>
    )
}
