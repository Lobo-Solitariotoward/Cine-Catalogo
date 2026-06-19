// @ts-nocheck
import { useEffect, useState } from 'react'
import { Sparkles, Loader, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import log from '../utils/logger'

interface Props { sesion: any }

// Películas recomendadas curadas — luego se pueden enriquecer con OMDb
const SUGERENCIAS = [
    { imdb_id: 'tt0468569', titulo: 'The Dark Knight', anio: '2008', rating: '9.0', razon: 'Si te gusta acción y drama' },
    { imdb_id: 'tt1375666', titulo: 'Inception', anio: '2010', rating: '8.8', razon: 'Ciencia ficción imprescindible' },
    { imdb_id: 'tt0816692', titulo: 'Interstellar', anio: '2014', rating: '8.7', razon: 'Aventura espacial épica' },
    { imdb_id: 'tt0109830', titulo: 'Forrest Gump', anio: '1994', rating: '8.8', razon: 'Drama clásico' },
    { imdb_id: 'tt0110912', titulo: 'Pulp Fiction', anio: '1994', rating: '8.9', razon: 'Cine de culto de Tarantino' },
    { imdb_id: 'tt0167260', titulo: 'El Señor de los Anillos: El Retorno del Rey', anio: '2003', rating: '9.0', razon: 'Épica fantasía' },
    { imdb_id: 'tt0073486', titulo: 'One Flew Over the Cuckoo\'s Nest', anio: '1975', rating: '8.7', razon: 'Drama poderoso' },
    { imdb_id: 'tt0118799', titulo: 'La vida es bella', anio: '1997', rating: '8.6', razon: 'Drama italiano' },
]

export default function Recomendaciones({ sesion }: Props) {
    const [posters, setPosters] = useState<Record<string, string>>({})
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            const map: Record<string, string> = {}
            for (const sug of SUGERENCIAS) {
                try {
                    const { data } = await api.get(`/movies/mysql/${sug.imdb_id}`)
                    if (data?.poster_url) map[sug.imdb_id] = data.poster_url
                } catch {
                    // Cachear desde OMDb si no estaba
                    try {
                        await api.get(`/movies/${sug.imdb_id}`)
                        const { data: d2 } = await api.get(`/movies/mysql/${sug.imdb_id}`)
                        if (d2?.poster_url) map[sug.imdb_id] = d2.poster_url
                    } catch (e) {
                        log.warn(`No se pudo cargar poster de ${sug.titulo}`, e)
                    }
                }
            }
            setPosters(map)
            setCargando(false)
        }
        cargar()
    }, [])

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 24px 0' }}>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <Sparkles size={26} style={{ color: '#f5c518' }} />
                        <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white' }}>Recomendaciones</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                        Películas y series que podrían gustarte, seleccionadas por nuestro equipo
                    </p>
                </div>

                {cargando && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0' }}>
                        <Loader size={22} style={{ animation: 'spin 1s linear infinite', color: '#f5c518' }} />
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Buscando recomendaciones...</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {SUGERENCIAS.map(sug => {
                        const poster = posters[sug.imdb_id]
                        return (
                            <Link key={sug.imdb_id} to={`/detalle/${sug.imdb_id}`}
                                style={{ textDecoration: 'none', display: 'block' }}>
                                <div style={{ background: '#141414', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,197,24,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                                    <div style={{ aspectRatio: '2/3', background: '#1c1c1c' }}>
                                        {poster ? (
                                            <img src={poster} alt={sug.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎬</div>
                                        )}
                                    </div>
                                    <div style={{ padding: 14 }}>
                                        <h3 style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {sug.titulo}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 }}>
                                            <span>{sug.anio}</span>
                                            <span>·</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Star size={10} fill="#f5c518" color="#f5c518" />
                                                <span style={{ color: '#f5c518', fontWeight: 700 }}>{sug.rating}</span>
                                            </div>
                                        </div>
                                        <p style={{ color: 'rgba(0,212,255,0.7)', fontSize: 11, fontStyle: 'italic' }}>{sug.razon}</p>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
