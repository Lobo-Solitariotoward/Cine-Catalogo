import { useEffect, useRef, useState } from 'react'
import { Loader } from 'lucide-react'

declare global {
    interface Window {
        YT: any
        onYouTubeIframeAPIReady?: () => void
    }
}

interface Props {
    videoIds: string[]
    titulo: string
    onAllFailed: () => void
}

/**
 * Reproduce el primer videoId de la lista que sea embebible.
 * Si YouTube devuelve error 101/150 (embed bloqueado) o 100 (no encontrado),
 * automáticamente prueba con el siguiente. Si todos fallan, llama onAllFailed.
 */
export default function YouTubePlayer({ videoIds, titulo, onAllFailed }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [reproduciendo, setReproduciendo] = useState(false)

    // Carga el script de la IFrame Player API una sola vez
    useEffect(() => {
        if (window.YT && window.YT.Player) return
        if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
    }, [])

    // Crea/recrea el player al cambiar de videoId o cuando la API termina de cargar
    useEffect(() => {
        setReproduciendo(false)
        if (!videoIds || videoIds.length === 0) return

        let cancelado = false

        const crearPlayer = () => {
            if (cancelado) return false
            if (!containerRef.current || !window.YT || !window.YT.Player) return false

            // Limpia el contenedor antes de meter el nuevo player
            containerRef.current.innerHTML = ''
            const div = document.createElement('div')
            div.style.width = '100%'
            div.style.height = '100%'
            containerRef.current.appendChild(div)

            try { playerRef.current?.destroy() } catch { }

            playerRef.current = new window.YT.Player(div, {
                videoId: videoIds[currentIndex],
                width: '100%',
                height: '100%',
                playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
                events: {
                    onReady: (e: any) => {
                        if (cancelado) return
                        try { e.target.playVideo() } catch { }
                    },
                    onStateChange: (e: any) => {
                        // 1 = playing, 3 = buffering — significa que el video sí cargó
                        if (e.data === 1 || e.data === 3) setReproduciendo(true)
                    },
                    onError: () => {
                        if (cancelado) return
                        // Cualquier error → siguiente candidato. Si no quedan, avisamos.
                        if (currentIndex + 1 < videoIds.length) {
                            setCurrentIndex(i => i + 1)
                        } else {
                            onAllFailed()
                        }
                    }
                }
            })
            return true
        }

        // Si la API ya está cargada, crear el player inmediatamente
        if (crearPlayer()) {
            return () => {
                cancelado = true
                try { playerRef.current?.destroy() } catch { }
                playerRef.current = null
            }
        }

        // Si la API aún no está, hacer polling hasta que esté disponible
        const intervalo = setInterval(() => {
            if (crearPlayer()) clearInterval(intervalo)
        }, 200)
        const timeout = setTimeout(() => {
            clearInterval(intervalo)
            if (!cancelado && !playerRef.current) onAllFailed()
        }, 10000)

        return () => {
            cancelado = true
            clearInterval(intervalo)
            clearTimeout(timeout)
            try { playerRef.current?.destroy() } catch { }
            playerRef.current = null
        }
    }, [currentIndex, videoIds])

    return (
        <>
            <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            {!reproduciendo && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#000', pointerEvents: 'none' }}>
                    <Loader size={32} style={{ color: '#f5c518', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                        {currentIndex === 0
                            ? 'Cargando tráiler...'
                            : `Probando otro tráiler... (${currentIndex + 1}/${videoIds.length})`}
                    </p>
                </div>
            )}
        </>
    )
}
