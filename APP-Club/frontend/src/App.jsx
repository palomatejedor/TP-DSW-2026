import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import RecuperarContrasena from './pages/RecuperarContrasena'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardSocio from './pages/DashboardSocio'
import Socios from './pages/Socios'
import Actividades from './pages/Actividades'
import Planes from './pages/Planes'
import Inscripciones from './pages/Inscripciones'
import ActividadesSocio from './pages/ActividadesSocio'
import Carnet from './pages/Carnet'
import Cuota from './pages/Cuota'
import Beneficios from './pages/Beneficios'
import BeneficiosAdmin from './pages/BeneficiosAdmin'
import PlanesSocio from './pages/PlanesSocio'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/socios" element={<Socios />} />
        <Route path="/admin/actividades" element={<Actividades />} />
        <Route path="/admin/planes" element={<Planes />} />
        <Route path="/admin/inscripciones" element={<Inscripciones />} />
        <Route path="/admin/beneficios" element={<BeneficiosAdmin />} />
        <Route path="/socio" element={<DashboardSocio />} />
        <Route path="/socio/actividades" element={<ActividadesSocio />} />
        <Route path="/socio/carnet" element={<Carnet />} />
        <Route path="/socio/cuota" element={<Cuota />} />
        <Route path="/socio/beneficios" element={<Beneficios />} />
        <Route path="/socio/planes" element={<PlanesSocio />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
