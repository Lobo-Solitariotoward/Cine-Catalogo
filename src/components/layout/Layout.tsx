import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  sesion: any
  onLogout: () => void
}

export default function Layout({ sesion, onLogout }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#f5c518] focus:text-black focus:rounded-lg focus:font-semibold">
                Saltar al contenido principal
            </a>
            <Navbar sesion={sesion} onLogout={onLogout} />
            <main id="main-content" className="pt-16" tabIndex={-1}>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
