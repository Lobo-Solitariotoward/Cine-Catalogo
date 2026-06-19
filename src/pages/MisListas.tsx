// @ts-nocheck
import { useState, useEffect } from 'react'
import { Trash2, Star, Edit3, Check, X, BookMarked, Eye, Heart, Plus, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import log from '../utils/logger'

const TABS = [
  { key: 'por_ver',  label: 'Por ver',   icon: BookMarked },
  { key: 'visto',    label: 'Vistas',    icon: Eye },
  { key: 'favorito', label: 'Favoritos', icon: Heart },
]

const PLATAFORMAS = ['Netflix', 'Prime Video', 'HBO Max', 'Disney+', 'Apple TV+', 'Cine', 'Otro']

// ─── Modal calificación ───────────────────────────────────────
function ModalCalificar({ pelicula, onGuardar, onCerrar }) {
  const [cal, setCal] = useState(pelicula.calificacion || 5)
  const [hover, setHover] = useState(0)
  return (
    <div onClick={onCerrar}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#131313', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Calificar</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{pelicula.titulo}</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => setCal(n)}
              onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s', transform: (hover || cal) >= n ? 'scale(1.15)' : 'scale(1)', color: (hover || cal) >= n ? '#f5c518' : 'rgba(255,255,255,0.15)' }}>
              ★
            </button>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#f5c518', fontWeight: 900, fontSize: 28, marginBottom: 20 }}>
          {cal}<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 400 }}>/10</span>
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCerrar} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={() => onGuardar(cal)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal seleccionar plataforma ─────────────────────────────
function ModalPlataforma({ pelicula, onConfirmar, onCerrar }) {
  const [plataforma, setPlataforma] = useState('Netflix')
  return (
    <div onClick={onCerrar}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#131313', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>¿Dónde la viste?</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{pelicula.titulo}</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {PLATAFORMAS.map(p => (
            <button key={p} onClick={() => setPlataforma(p)}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: `1px solid ${plataforma === p ? 'rgba(245,197,24,0.4)' : 'rgba(255,255,255,0.08)'}`,
                background: plataforma === p ? 'rgba(245,197,24,0.1)' : 'transparent',
                color: plataforma === p ? '#f5c518' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCerrar} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={() => onConfirmar(plataforma)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Marcar como vista</button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal confirmar eliminar ─────────────────────────────────
function ModalConfirmar({ titulo, onConfirmar, onCerrar }) {
  return (
    <div onClick={onCerrar}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#131313', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Trash2 size={22} color="#ef4444" />
        </div>
        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>¿Eliminar de la lista?</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
          Se eliminará <span style={{ color: 'white' }}>"{titulo}"</span> de tu lista.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCerrar} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={onConfirmar} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta película en lista ────────────────────────────────
function TarjetaLista({ item, tabActual, onEliminar, onCalificar, onCambiarEstado }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const pelicula = item.pelicula || {}
  const titulo = pelicula.titulo || 'Película'
  const poster = pelicula.poster_url || null
  const anio = pelicula.anio || ''
  const genero = pelicula.tipo === 'serie' ? 'Serie' : 'Película'

  return (
    <div style={{ background: '#131313', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
      <div style={{ display: 'flex', gap: 12, padding: 12 }}>

        {/* Poster */}
        <div style={{ flexShrink: 0, width: 64, height: 96, borderRadius: 10, overflow: 'hidden', background: '#1c1c1c' }}>
          {poster
            ? <img src={poster} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎬</div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: 2, paddingBottom: 2 }}>
          <div>
            <h3 style={{ color: 'white', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titulo}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{anio} · {genero}</p>
            {item.calificacion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <Star size={12} fill="#f5c518" color="#f5c518" />
                <span style={{ color: '#f5c518', fontSize: 12, fontWeight: 700 }}>{item.calificacion}/10</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
            <button onClick={() => onCalificar(item)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f5c518'; e.currentTarget.style.background = 'rgba(245,197,24,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none' }}>
              <Star size={12} /> {item.calificacion ? 'Editar' : 'Calificar'}
            </button>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuAbierto(!menuAbierto)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none' }}>
                <Edit3 size={12} /> Mover
              </button>
              {menuAbierto && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 4, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', zIndex: 20, minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  {TABS.filter(t => t.key !== tabActual).map(t => (
                    <button key={t.key}
                      onClick={() => { onCambiarEstado(item, t.key); setMenuAbierto(false) }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'none' }}>
                      <t.icon size={12} /> {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => onEliminar(item)}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'none' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────
interface MisListasProps { sesion: any }
export default function MisListas({ sesion }: MisListasProps) {
  const [tabActual, setTabActual] = useState('por_ver')
  const [listas, setListas] = useState({ por_ver: [], visto: [], favorito: [] })
  const [cargando, setCargando] = useState(true)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [modalCalificar, setModalCalificar] = useState(null)
  const [modalPlataforma, setModalPlataforma] = useState(null)  // { item } al mover a visto
  const [toast, setToast] = useState(null)

  const mostrarToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // READ — cargar listas desde API
  useEffect(() => {
    const cargar = async () => {
      if (!sesion?.id) { setCargando(false); return }
      try {
        const { data } = await api.get(`/lists/${sesion.id}`)
        const agrupadas = { por_ver: [], visto: [], favorito: [] }
        data.forEach(item => {
          const estado = item.estado || 'por_ver'
          if (agrupadas[estado]) agrupadas[estado].push(item)
        })
        setListas(agrupadas)
      } catch (err) {
        log.error('Error cargando listas:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [sesion])

  // DELETE
  const confirmarEliminar = async () => {
    try {
      await api.delete(`/lists/${modalEliminar.id}`)
      setListas(prev => ({
        ...prev,
        [tabActual]: prev[tabActual].filter(p => p.id !== modalEliminar.id)
      }))
      mostrarToast(`"${modalEliminar.pelicula?.titulo}" eliminada`)
    } catch { mostrarToast('Error al eliminar') }
    setModalEliminar(null)
  }

  // UPDATE calificación
  const guardarCalificacion = async (cal) => {
    try {
      await api.put(`/lists/${modalCalificar.id}`, { calificacion: cal })
      setListas(prev => ({
        ...prev,
        [tabActual]: prev[tabActual].map(p =>
          p.id === modalCalificar.id ? { ...p, calificacion: cal } : p
        )
      }))
      mostrarToast(`Calificación guardada: ${cal}/10`)
    } catch { mostrarToast('Error al calificar') }
    setModalCalificar(null)
  }

  // UPDATE estado (mover entre listas) — si va a "visto" abre selector de plataforma
  const handleCambiarEstado = async (item, nuevoEstado) => {
    if (nuevoEstado === 'visto') {
      // Pedir plataforma antes de confirmar
      setModalPlataforma(item)
      return
    }
    await ejecutarCambioEstado(item, nuevoEstado)
  }

  const ejecutarCambioEstado = async (item, nuevoEstado, plataforma = null) => {
    try {
      const body = plataforma ? { estado: nuevoEstado, plataforma } : { estado: nuevoEstado }
      await api.put(`/lists/${item.id}`, body)
      setListas(prev => ({
        ...prev,
        [tabActual]: prev[tabActual].filter(p => p.id !== item.id),
        [nuevoEstado]: [...prev[nuevoEstado], { ...item, estado: nuevoEstado }]
      }))
      const tab = TABS.find(t => t.key === nuevoEstado)
      const sufijo = plataforma ? ` y registrada en historial (${plataforma})` : ''
      mostrarToast(`Movida a ${tab.label}${sufijo}`)
      log.info('Estado actualizado', { id: item.id, nuevoEstado, plataforma })
    } catch (err) {
      log.error('Error al mover entre listas', err)
      mostrarToast('Error al mover')
    }
  }

  const confirmarPlataforma = async (plataforma) => {
    if (!modalPlataforma) return
    const item = modalPlataforma
    setModalPlataforma(null)
    await ejecutarCambioEstado(item, 'visto', plataforma)
  }

  const tabInfo = TABS.find(t => t.key === tabActual)
  const itemsActuales = listas[tabActual]

  return (
    <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white', marginBottom: 4 }}>Mis Listas</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Organiza tu catálogo personal</p>
          </div>
          <Link to="/buscar"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, padding: '11px 20px', borderRadius: 12, textDecoration: 'none', fontSize: 14 }}>
            <Plus size={16} /> Agregar
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            const count = listas[tab.key].length
            const activo = tabActual === tab.key
            return (
              <button key={tab.key} onClick={() => setTabActual(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                  border: activo ? '1px solid rgba(245,197,24,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: activo ? 'rgba(245,197,24,0.1)' : '#131313',
                  color: activo ? '#f5c518' : 'rgba(255,255,255,0.5)',
                }}>
                <Icon size={15} />
                {tab.label}
                <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: activo ? 'rgba(245,197,24,0.2)' : 'rgba(255,255,255,0.08)', color: activo ? '#f5c518' : 'rgba(255,255,255,0.4)' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cargando */}
        {cargando && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 0' }}>
            <Loader size={24} style={{ color: '#f5c518', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Cargando tu lista...</span>
          </div>
        )}

        {/* Vacío */}
        {!cargando && itemsActuales.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <tabInfo.icon size={28} color="#f5c518" />
            </div>
            <h3 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18 }}>Lista vacía</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
              No tienes películas en "{tabInfo.label}" todavía.
            </p>
            <Link to="/buscar"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #f5c518, #c9a227)', color: '#080808', fontWeight: 700, padding: '11px 24px', borderRadius: 12, textDecoration: 'none', fontSize: 14, marginTop: 8 }}>
              <Plus size={16} /> Buscar películas
            </Link>
          </div>
        )}

        {/* Grid */}
        {!cargando && itemsActuales.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {itemsActuales.map(item => (
              <TarjetaLista
                key={item.id}
                item={item}
                tabActual={tabActual}
                onEliminar={setModalEliminar}
                onCalificar={setModalCalificar}
                onCambiarEstado={handleCambiarEstado}
              />
            ))}
          </div>
        )}
      </div>

      {modalEliminar && (
        <ModalConfirmar
          titulo={modalEliminar.pelicula?.titulo || 'esta película'}
          onConfirmar={confirmarEliminar}
          onCerrar={() => setModalEliminar(null)}
        />
      )}
      {modalCalificar && (
        <ModalCalificar
          pelicula={{ ...modalCalificar, titulo: modalCalificar.pelicula?.titulo }}
          onGuardar={guardarCalificacion}
          onCerrar={() => setModalCalificar(null)}
        />
      )}
      {modalPlataforma && (
        <ModalPlataforma
          pelicula={{ titulo: modalPlataforma.pelicula?.titulo || 'esta película' }}
          onConfirmar={confirmarPlataforma}
          onCerrar={() => setModalPlataforma(null)}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 16, background: '#1c1c1c', border: '1px solid rgba(245,197,24,0.2)', color: 'white', fontSize: 14, whiteSpace: 'nowrap' }}>
            <Check size={15} color="#f5c518" /> {toast}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
