import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Inicio from './pages/Inicio'
import Buscar from './pages/Buscar'
import MisListas from './pages/MisListas'
import Historial from './pages/Historial'
import Perfil from './pages/Perfil'
import Login from './pages/Login'
import Registro from './pages/Registro'
import DetallePelicula from './pages/DetallePelicula'

interface Sesion {
  id: number
  nombre: string
  email: string
  avatar: string
}

interface RutaProtegidaProps {
  sesion: Sesion | null
  children: React.ReactNode
}

function RutaProtegida({ sesion, children }: RutaProtegidaProps) {
  if (!sesion) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    try {
      const guardada = localStorage.getItem('cinelog_sesion')
      return guardada ? JSON.parse(guardada) : null
    } catch {
      return null
    }
  })

  const login = (usuario: Sesion) => {
    setSesion(usuario)
    localStorage.setItem('cinelog_sesion', JSON.stringify(usuario))
  }

  const logout = () => {
    setSesion(null)
    localStorage.removeItem('cinelog_sesion')
    localStorage.removeItem('cinelog_token')
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #f5c518' } }} />
      <Routes>
        <Route path="/" element={sesion ? <Navigate to="/inicio" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={sesion ? <Navigate to="/inicio" replace /> : <Login onLogin={login} />} />
        <Route path="/registro" element={sesion ? <Navigate to="/inicio" replace /> : <Registro onLogin={login} />} />
        <Route element={
          <RutaProtegida sesion={sesion}>
            <Layout sesion={sesion} onLogout={logout} />
          </RutaProtegida>
        }>
          <Route path="/inicio" element={<Inicio sesion={sesion} />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/mis-listas" element={<MisListas sesion={sesion} />} />
          <Route path="/historial" element={<Historial sesion={sesion} />} />
          <Route path="/perfil" element={<Perfil sesion={sesion} />} />
          <Route path="/detalle/:imdbId" element={<DetallePelicula sesion={sesion} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
