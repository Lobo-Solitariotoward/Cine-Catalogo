import { Mail, Shield, FileText, Info } from 'lucide-react'

interface Props {
    tipo: 'acerca' | 'privacidad' | 'terminos' | 'contacto'
}

const CONTENIDO = {
    acerca: {
        icono: Info,
        titulo: 'Acerca de CineLog',
        secciones: [
            {
                titulo: '¿Qué es CineLog?',
                texto: 'CineLog es tu catálogo personal de películas y series. Aquí puedes organizar lo que ya viste, lo que quieres ver, dejar reseñas y descubrir nuevo contenido — todo en un solo lugar.'
            },
            {
                titulo: 'Datos',
                texto: 'Usamos OMDb API como fuente principal de información sobre películas y series (títulos, posters, sinopsis, calificaciones IMDb). Los tráilers se obtienen dinámicamente de YouTube.'
            },
            {
                titulo: 'Tecnología',
                texto: 'CineLog está construido con React + TypeScript en el frontend, y Node.js + Express + MySQL + MongoDB en el backend. Es un proyecto de portafolio sin ánimo de lucro.'
            },
            {
                titulo: 'Versión',
                texto: 'v2.0.0 — última actualización mayo 2026.'
            }
        ]
    },
    privacidad: {
        icono: Shield,
        titulo: 'Política de Privacidad',
        secciones: [
            {
                titulo: 'Qué datos guardamos',
                texto: 'Cuando creas una cuenta guardamos tu nombre, correo electrónico y una versión cifrada de tu contraseña (hash bcrypt). También guardamos lo que añadas a tus listas, tus reseñas, calificaciones y registro de actividad.'
            },
            {
                titulo: 'Qué no hacemos',
                texto: 'No vendemos tus datos. No los compartimos con terceros con fines publicitarios. No mostramos anuncios. No usamos cookies de seguimiento.'
            },
            {
                titulo: 'Tus derechos',
                texto: 'Puedes editar o eliminar tu información en cualquier momento desde la página de Perfil. Si quieres eliminar tu cuenta por completo, contáctanos.'
            },
            {
                titulo: 'Seguridad',
                texto: 'Las contraseñas se almacenan con bcrypt (algoritmo de hashing irreversible). La comunicación con el servidor está cifrada con HTTPS. Las sesiones usan JWT con expiración de 7 días.'
            }
        ]
    },
    terminos: {
        icono: FileText,
        titulo: 'Términos de Uso',
        secciones: [
            {
                titulo: 'Uso aceptable',
                texto: 'CineLog es para uso personal. Está prohibido usar la plataforma para spam, distribuir contenido ilegal, o hacer ingeniería inversa del servicio.'
            },
            {
                titulo: 'Tu cuenta',
                texto: 'Eres responsable de mantener segura tu contraseña. Si sospechas que alguien accedió a tu cuenta sin permiso, cambia tu contraseña inmediatamente desde Perfil.'
            },
            {
                titulo: 'Contenido de usuarios',
                texto: 'Las reseñas y comentarios que publiques son tuyos. Nos reservamos el derecho a eliminar contenido que viole estas reglas (acoso, spam, contenido ilegal).'
            },
            {
                titulo: 'Disponibilidad',
                texto: 'CineLog se ofrece "tal cual". No garantizamos disponibilidad 24/7 ya que está desplegado en un plan gratuito de hosting.'
            }
        ]
    },
    contacto: {
        icono: Mail,
        titulo: 'Contacto',
        secciones: [
            {
                titulo: '¿Tienes una sugerencia?',
                texto: 'Nos encantaría escucharte. Puedes enviarnos cualquier idea, comentario o reporte de bug.'
            },
            {
                titulo: 'Email',
                texto: 'Para cualquier consulta: hola@cinelog.app (este es un correo de ejemplo del proyecto de portafolio)'
            },
            {
                titulo: 'Reportar un bug',
                texto: 'Si encontraste algo que no funciona, déjanos saber qué pasó, qué esperabas y qué viste. Cuanto más detalle, mejor podremos arreglarlo.'
            },
            {
                titulo: 'Tiempo de respuesta',
                texto: 'Normalmente respondemos en 2-3 días hábiles.'
            }
        ]
    }
}

export default function InfoPage({ tipo }: Props) {
    const data = CONTENIDO[tipo]
    const Icono = data.icono

    return (
        <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 80 }}>
            <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '40px 24px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icono size={22} style={{ color: '#f5c518' }} />
                    </div>
                    <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 32, color: 'white' }}>{data.titulo}</h1>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 36, marginLeft: 62 }}>
                    Última actualización: mayo 2026
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {data.secciones.map((sec, i) => (
                        <div key={i}>
                            <h2 style={{ color: 'white', fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
                                {sec.titulo}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
                                {sec.texto}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
