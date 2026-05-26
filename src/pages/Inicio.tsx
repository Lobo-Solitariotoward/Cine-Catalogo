import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Plus, Info, Star, ChevronRight, ChevronLeft, X, Check, Loader } from 'lucide-react'
import api from '../services/api'

const HERO_ID = 'tt0948470'

// Convierte el poster de OMDb a alta resolución (SX300 → SX1500)
const altaResolucion = (url: string | null) => {
  if (!url) return null
  return url.replace(/_(SX|SY)\d+/g, '_SX1500')
}

const WATCHLIST_IDS = [
  { id: 'w1', imdb_id: 'tt1405406',  titulo: 'The Vampire Diaries',         anio: '2009', rating: '7.7', tipo: 'serie',    trailer: 'https://www.youtube.com/embed/_j0pa89de9c' },
  { id: 'w2', imdb_id: 'tt6320628',  titulo: 'Spider-Man: Lejos de Casa',   anio: '2019', rating: '7.3', tipo: 'pelicula',  trailer: 'https://www.youtube.com/embed/Nt9L1jCKGnE' },
  { id: 'w3', imdb_id: 'tt1830617',  titulo: 'Grimm',                       anio: '2011', rating: '7.8', tipo: 'serie',    trailer: 'https://www.youtube.com/embed/2rVy3RBJmNo' },
  { id: 'w4', imdb_id: 'tt0892769',  titulo: 'Cómo Entrenar a Tu Dragón',   anio: '2010', rating: '8.1', tipo: 'pelicula',  trailer: 'https://www.youtube.com/embed/oKiYuIsPxYk' },
  { id: 'w5', imdb_id: 'tt1646971',  titulo: 'Cómo Entrenar a Tu Dragón 2', anio: '2014', rating: '7.8', tipo: 'pelicula',  trailer: 'https://www.youtube.com/embed/Z9a4PvzlqoQ' },
  { id: 'w6', imdb_id: 'tt21909764', titulo: 'Culpa Mía',                   anio: '2023', rating: '6.1', tipo: 'pelicula',  trailer: 'https://www.youtube.com/embed/3CpKBAPqqM0' },
  { id: 'w7', imdb_id: 'tt28510079', titulo: 'Culpa Tuya',                  anio: '2024', rating: '5.3', tipo: 'pelicula',  trailer: 'https://www.youtube.com/embed/m_TWESxP_DE' },
  { id: 'w8', imdb_id: 'tt13443470', titulo: 'Wednesday',                   anio: '2022', rating: '8.1', tipo: 'serie',    trailer: 'https://www.youtube.com/embed/Di310WS9zfw' },
]

const TENDENCIAS_IDS = [
  { id: 't1', imdb_id: 'tt2049403',  titulo: 'Beetlejuice Beetlejuice',     anio: '2024', rating: '7.0', genero: 'Comedia',  trailer: 'https://www.youtube.com/embed/CoZqL9N6Rx4' },
  { id: 't2', imdb_id: 'tt33311244', titulo: 'Culpa Nuestra',               anio: '2025', rating: '5.3', genero: 'Romance',  trailer: 'https://www.youtube.com/embed/kuiOAsu8UsA' },
  { id: 't3', imdb_id: 'tt1190634',  titulo: 'The Boys',                    anio: '2019', rating: '8.7', genero: 'Acción',   trailer: 'https://www.youtube.com/embed/F0cvD8kzgkA' },
  { id: 't4', imdb_id: 'tt5180504',  titulo: 'The Witcher',                 anio: '2019', rating: '8.2', genero: 'Fantasía', trailer: 'https://www.youtube.com/embed/ndl1W4ltcmg' },
  { id: 't5', imdb_id: 'tt0107290',  titulo: 'Jurassic Park',               anio: '1993', rating: '8.2', genero: 'Aventura', trailer: 'https://www.youtube.com/embed/lc0UehYemQA' },
  { id: 't6', imdb_id: 'tt1211837',  titulo: 'Doctor Strange',              anio: '2016', rating: '7.5', genero: 'Fantasía', trailer: 'https://www.youtube.com/embed/HSzx-zryEgM' },
  { id: 't7', imdb_id: 'tt1630029',  titulo: 'Avatar: El Camino del Agua', anio: '2022', rating: '7.6', genero: 'Aventura', trailer: 'https://www.youtube.com/embed/a8Gx8wiNbs8' },
  { id: 't8', imdb_id: 'tt0460681',  titulo: 'Supernatural',               anio: '2005', rating: '8.4', genero: 'Drama',    trailer: 'https://www.youtube.com/embed/t-775JyzDTk' },
]

// ─── Hook: carga poster desde MySQL ──────────────────────────
function usePoster(imdb_id) {
  const [poster, setPoster] = useState(null)
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        // Primero intentar desde MySQL (caché)
        const { data } = await api.get(`/movies/mysql/${imdb_id}`)
        if (activo && data?.poster_url) {
          setPoster(data.poster_url)
          setCargando(false)
          return
        }
        // Si no está en MySQL, llamar a OMDb para cachearlo
        await api.get(`/movies/${imdb_id}`)
        const { data: data2 } = await api.get(`/movies/mysql/${imdb_id}`)
        if (activo && data2?.poster_url) setPoster(data2.poster_url)
      } catch {}
      finally { if (activo) setCargando(false) }
    }
    // Delay escalonado para no saturar el servidor
    const delay = Math.floor(Math.random() * 800)
    const timer = setTimeout(cargar, delay)
    return () => { activo = false; clearTimeout(timer) }
  }, [imdb_id])
  return { poster, cargando }
}

// ─── Modal Trailer ────────────────────────────────────────────
function ModalTrailer({ pelicula, onCerrar }) {
  return (
    <div onClick={onCerrar}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(16px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 960 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 20 }}>{pelicula.titulo}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>Tráiler oficial</p>
          </div>
          <button onClick={onCerrar} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', borderRadius: 20, overflow: 'hidden' }}>
          <iframe
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            src={`${pelicula.trailer}?autoplay=1&rel=0`}
            title={pelicula.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta Netflix ──────────────────────────────────────────
function TarjetaNetflix({ pelicula, enLista, onAgregar, onTrailer }: any) {
  const [hovered, setHovered] = useState(false)
  const { poster, cargando } = usePoster(pelicula.imdb_id)

  return (
    <Link
      to={`/detalle/${pelicula.imdb_id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', flexShrink: 0, width: 185, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', transform: hovered ? 'scale(1.07) translateY(-8px)' : 'scale(1)', zIndex: hovered ? 10 : 1, display: 'block', textDecoration: 'none' }}>

      <div style={{ width: 185, height: 278, borderRadius: 12, overflow: 'hidden', background: '#1c1c1c', boxShadow: hovered ? '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1.5px rgba(245,197,24,0.4)' : 'none', transition: 'box-shadow 0.3s' }}>
        {cargando ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size={20} style={{ color: '#f5c518', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : poster ? (
          <img src={poster} alt={pelicula.titulo}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #1a1a1a, #0e0e0e)', padding: 12 }}>
            <span style={{ fontSize: 36 }}>🎬</span>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', lineHeight: 1.3 }}>{pelicula.titulo}</p>
          </div>
        )}

        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, transition: 'opacity 0.25s', opacity: hovered ? 1 : 0, background: 'linear-gradient(to top, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.6) 45%, rgba(8,8,8,0.1) 100%)' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 14px' }}>
            <p style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 3, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{pelicula.titulo}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ color: '#f5c518', fontSize: 11, fontWeight: 700 }}>★ {pelicula.rating}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>· {pelicula.anio}</span>
              {pelicula.tipo === 'serie' && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(139,92,246,0.75)', color: 'white', fontWeight: 600 }}>Serie</span>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={(e) => { e.stopPropagation(); onTrailer(pelicula) }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
                <Play size={11} fill="#080808" /> Tráiler
              </button>
              <button onClick={(e) => { e.stopPropagation(); onAgregar(pelicula) }}
                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${enLista ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.2)'}`, background: enLista ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.1)', color: enLista ? '#00d4ff' : 'white', cursor: 'pointer', flexShrink: 0 }}>
                {enLista ? <Check size={13} /> : <Plus size={13} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 8, background: 'rgba(8,8,8,0.82)', backdropFilter: 'blur(8px)' }}>
          <Star size={9} fill="#f5c518" color="#f5c518" />
          <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{pelicula.rating}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Sección scroll ───────────────────────────────────────────
function SeccionScroll({ titulo, acento, link, children }) {
  const ref = useRef(null)
  const scroll = dir => ref.current?.scrollBy({ left: dir * 700, behavior: 'smooth' })
  return (
    <section style={{ width: '100%', maxWidth: 1600, margin: '48px auto 0', padding: '0 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {acento && <div style={{ width: 4, height: 28, borderRadius: 4, background: acento }} />}
          <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 22, color: 'white' }}>{titulo}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[-1, 1].map(dir => (
            <button key={dir} onClick={() => scroll(dir)}
              style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}>
              {dir === -1 ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          ))}
          {link && (
            <Link to={link} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#f5c518'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
              Ver todo <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>
      <div ref={ref} style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, paddingTop: 10, scrollbarWidth: 'none' }}>
        {children}
      </div>
    </section>
  )
}

// ─── Página Inicio ────────────────────────────────────────────
interface InicioProps { sesion: any }
export default function Inicio({ sesion }: InicioProps) {
    const navigate = useNavigate()
  const [lista, setLista] = useState([])
  const [heroEnLista, setHeroEnLista] = useState(false)
  const [trailerModal, setTrailerModal] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [heroPoster, setHeroPoster] = useState(null)

  const mostrarToast = msg => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000) }

  // Cargar poster del hero
  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get(`/movies/mysql/${HERO_ID}`)
        if (data?.poster_url) { setHeroPoster(altaResolucion(data.poster_url)); return }
        // Si no está en caché, llamar a OMDb
        await api.get(`/movies/${HERO_ID}`)
        const { data: data2 } = await api.get(`/movies/mysql/${HERO_ID}`)
        if (data2?.poster_url) setHeroPoster(altaResolucion(data2.poster_url))
      } catch {}
    }
    cargar()
  }, [])

  const HERO = {
    id: 'hero', imdb_id: HERO_ID,
    titulo: 'The Amazing Spider-Man',
    generos: ['Acción', 'Aventura', 'Ciencia Ficción'],
    sinopsis: 'Peter Parker, un estudiante marginado, descubre un maletín de su padre que lo lleva a Oscorp y al laboratorio del Dr. Curt Connors. Tras ser mordido por una araña modificada genéticamente, obtiene poderes extraordinarios.',
    rating: '6.9', anio: '2012', duracion: '2h 16min',
    trailer: 'https://www.youtube.com/embed/n0Kka0ozjbs',
    poster: heroPoster,
  }

  // ─── Agregar a lista — conectado a API real ───────────────
  const agregarALista = async (pelicula) => {
    if (lista.find(p => p.id === pelicula.id)) {
      mostrarToast(`"${pelicula.titulo}" ya está en tu lista`)
      return
    }
    try {
      // Cachear película en MySQL si no existe
      await api.get(`/movies/${pelicula.imdb_id}`)
      const { data: peliculaMySQL } = await api.get(`/movies/mysql/${pelicula.imdb_id}`)
      // Agregar a lista del usuario
      await api.post('/lists', { pelicula_id: peliculaMySQL.id, estado: 'por_ver' })
      setLista(prev => [...prev, pelicula])
      mostrarToast(`"${pelicula.titulo}" agregada a tu lista ✓`)
    } catch (err) {
      console.error('Error agregar lista:', err)
      mostrarToast('Error al agregar a la lista')
    }
  }

  const enLista = id => !!lista.find(p => p.id === id)

  return (
    <div style={{ width: '100%', paddingBottom: 80, background: '#080808' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', width: '100%', minHeight: '88vh', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {heroPoster
            ? <img src={heroPoster} alt="The Amazing Spider-Man" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', filter: 'brightness(0.75)' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a0a1a, #1a0a0a)' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080808 0%, #080808 8%, rgba(8,8,8,0.55) 45%, rgba(8,8,8,0.1) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.45) 55%, transparent 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1600, margin: '0 auto', padding: '0 40px 56px' }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {HERO.generos.map(g => (
                <span key={g} style={{ padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>{g}</span>
              ))}
            </div>
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 16, textShadow: '0 4px 40px rgba(0,0,0,0.7)', fontSize: 'clamp(40px, 6vw, 80px)' }}>
              {HERO.titulo}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f5c518' }}>
                <Star size={15} fill="#f5c518" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>{HERO.rating}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{HERO.anio}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{HERO.duracion}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.75, marginBottom: 28, maxWidth: 520, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {HERO.sinopsis}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setTrailerModal(HERO)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, padding: '14px 32px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 15, fontFamily: 'Clash Display, sans-serif', boxShadow: '0 8px 28px rgba(245,197,24,0.35)' }}>
                <Play size={18} fill="#080808" /> Ver tráiler
              </button>

              {/* Botón Mi Lista — conectado a API */}
              <button onClick={() => { if (!heroEnLista) { setHeroEnLista(true); agregarALista(HERO) } }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, border: `1px solid ${heroEnLista ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.15)'}`, background: heroEnLista ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.07)', color: heroEnLista ? '#00d4ff' : 'white', fontWeight: 600, cursor: heroEnLista ? 'default' : 'pointer', fontSize: 14, backdropFilter: 'blur(12px)', transition: 'all 0.2s' }}>
                {heroEnLista ? <Check size={17} /> : <Plus size={17} />}
                {heroEnLista ? 'En mi lista' : 'Mi Lista'}
              </button>

              <Link to={`/detalle/${HERO_ID}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 14, textDecoration: 'none', backdropFilter: 'blur(12px)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}>
                <Info size={16} /> Ver detalle
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SeccionScroll titulo="Mi lista por ver" acento="linear-gradient(135deg, #f5c518, #c9a227)" link="/mis-listas">
        {WATCHLIST_IDS.map(p => (
          <TarjetaNetflix key={p.id} pelicula={p} enLista={enLista(p.id)} onAgregar={agregarALista} onTrailer={setTrailerModal} />
        ))}
      </SeccionScroll>

      <SeccionScroll titulo="Tendencias esta semana" acento="linear-gradient(135deg, #00d4ff, #1a6cff)" link="/buscar">
        {TENDENCIAS_IDS.map(p => (
          <TarjetaNetflix key={p.id} pelicula={p} enLista={enLista(p.id)} onAgregar={agregarALista} onTrailer={setTrailerModal} />
        ))}
      </SeccionScroll>

      {/* Banner CTA */}
      <section style={{ width: '100%', maxWidth: 1600, margin: '56px auto 16px', padding: '0 40px' }}>
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', padding: '48px', background: 'linear-gradient(135deg, #0e0e0e 0%, #141414 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, opacity: 0.12, background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 300, opacity: 0.08, background: 'radial-gradient(circle, #f5c518 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', marginBottom: 12 }}>✦ Descubre más</span>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 26, color: 'white', marginBottom: 8 }}>¿Buscas algo nuevo?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Explora miles de películas y series con nuestra búsqueda inteligente.</p>
            </div>
            <Link to="/buscar" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, padding: '14px 32px', borderRadius: 14, textDecoration: 'none', fontSize: 15, flexShrink: 0 }}>
              Explorar catálogo
            </Link>
          </div>
        </div>
      </section>

      {trailerModal && <ModalTrailer pelicula={trailerModal} onCerrar={() => setTrailerModal(null)} />}

      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 16, background: '#1c1c1c', border: '1px solid rgba(0,212,255,0.2)', color: 'white', fontSize: 14, whiteSpace: 'nowrap' }}>
            <span style={{ color: '#00d4ff' }}>✓</span> {toastMsg}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}