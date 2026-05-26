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
            <Navbar sesion={sesion} onLogout={onLogout} />
            <main className="pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
