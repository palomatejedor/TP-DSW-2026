import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import RecuperarContrasena from './pages/RecuperarContrasena'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardSocio from './pages/DashboardSocio'
import Socios from './pages/Socios'
import GrupoFamiliar from './pages/GrupoFamiliar'
import Actividades from './pages/Actividades'
import Planes from './pages/Planes'
import Inscripciones from './pages/Inscripciones'
import Pagos from './pages/Pagos'
import ActividadesSocio from './pages/ActividadesSocio'
import Carnet from './pages/Carnet'
import Cuota from './pages/Cuota'
import Beneficios from './pages/Beneficios'
import BeneficiosAdmin from './pages/BeneficiosAdmin'
import PlanesSocio from './pages/PlanesSocio'

function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null')
  } catch {
    return null
  }
}

// Solo deja pasar si hay sesión y el rol corresponde; si no, vuelve al login
function Protegida({ rol, children }) {
  const usuario = leerUsuario()
  if (!usuario) return <Navigate to="/" replace />
  if (usuario.rol !== rol) return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/socio'} replace />
  return children
}

// El login no tiene sentido si ya hay sesión: manda al panel que corresponde
function SoloSinSesion({ children }) {
  const usuario = leerUsuario()
  if (usuario) return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/socio'} replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SoloSinSesion><Login /></SoloSinSesion>} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/admin" element={<Protegida rol="admin"><DashboardAdmin /></Protegida>} />
        <Route path="/admin/socios" element={<Protegida rol="admin"><Socios /></Protegida>} />
        <Route path="/admin/grupo-familiar" element={<Protegida rol="admin"><GrupoFamiliar /></Protegida>} />
        <Route path="/admin/actividades" element={<Protegida rol="admin"><Actividades /></Protegida>} />
        <Route path="/admin/planes" element={<Protegida rol="admin"><Planes /></Protegida>} />
        <Route path="/admin/inscripciones" element={<Protegida rol="admin"><Inscripciones /></Protegida>} />
        <Route path="/admin/pagos" element={<Protegida rol="admin"><Pagos /></Protegida>} />
        <Route path="/admin/beneficios" element={<Protegida rol="admin"><BeneficiosAdmin /></Protegida>} />
        <Route path="/socio" element={<Protegida rol="socio"><DashboardSocio /></Protegida>} />
        <Route path="/socio/actividades" element={<Protegida rol="socio"><ActividadesSocio /></Protegida>} />
        <Route path="/socio/carnet" element={<Protegida rol="socio"><Carnet /></Protegida>} />
        <Route path="/socio/cuota" element={<Protegida rol="socio"><Cuota /></Protegida>} />
        <Route path="/socio/beneficios" element={<Protegida rol="socio"><Beneficios /></Protegida>} />
        <Route path="/socio/planes" element={<Protegida rol="socio"><PlanesSocio /></Protegida>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App