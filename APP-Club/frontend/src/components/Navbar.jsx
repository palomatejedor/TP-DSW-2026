import { useState, useEffect } from 'react'
import { api } from '../api'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import { tiempoRestante, cerrarPorVencimiento } from '../sesion'

const ICONOS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  socios: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 4.65a3.5 3.5 0 0 1 0 6.7',
  familia: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 12a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zM3.5 19c.4-3 2.6-5 5.5-5s5.1 2 5.5 5M15.5 14.3c2.4-.3 4.4 1.2 5 4',
  actividades: 'M3 12h4l3-8 4 16 3-8h4',
  planes: 'M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5zM3 10h18',
  inscripciones: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c.4-3.4 2.8-5.5 6-5.5s5.6 2.1 6 5.5M16 11l2 2 4-4',
  beneficios: 'M3 8h18v4H3zM5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3-5-1s3 1 5 1zM12 8c1.5-3 5-3 5-1s-3 1-5 1z',
  carnet: 'M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5zM7 10h5M7 14h3',
  cuota: 'M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.6 0-4.5 1.2-4.5 3s1.6 2.6 4.5 3 4.5 1.2 4.5 3-1.9 3-4.5 3c-2.1 0-3.7-.8-4.5-2',
  salir: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  solicitudes: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  cerrar: 'M6 6l12 12M18 6L6 18',
}

const GRUPOS = {
  admin: [
    {
      titulo: 'General',
      items: [
        { ruta: '/admin', texto: 'Inicio', icono: 'home' },
        { ruta: '/admin/socios', texto: 'Socios', icono: 'socios' },
        { ruta: '/admin/grupo-familiar', texto: 'Grupo Familiar', icono: 'familia' },
        { ruta: '/admin/solicitudes', texto: 'Solicitudes de cuenta', icono: 'solicitudes' },
        { ruta: '/admin/administradores', texto: 'Administradores', icono: 'socios' },
      ],
    },
    {
      titulo: 'Gestión',
      items: [
        { ruta: '/admin/actividades', texto: 'Actividades', icono: 'actividades' },
        { ruta: '/admin/planes', texto: 'Planes', icono: 'planes' },
        { ruta: '/admin/inscripciones', texto: 'Inscripciones', icono: 'inscripciones' },
        { ruta: '/admin/pagos', texto: 'Pagos', icono: 'cuota' },
        { ruta: '/admin/beneficios', texto: 'Beneficios', icono: 'beneficios' },
      ],
    },
  ],
  socio: [
    {
      titulo: 'Mi cuenta',
      items: [
        { ruta: '/socio', texto: 'Inicio', icono: 'home' },
        { ruta: '/socio/carnet', texto: 'Mi Carnet', icono: 'carnet' },
      ],
    },
    {
      titulo: 'Club',
      items: [
        { ruta: '/socio/actividades', texto: 'Actividades', icono: 'actividades' },
        { ruta: '/socio/planes', texto: 'Planes', icono: 'planes' },
        { ruta: '/socio/cuota', texto: 'Cuota', icono: 'cuota' },
        { ruta: '/socio/beneficios', texto: 'Beneficios', icono: 'beneficios' },
      ],
    },
  ],
}

function Icono({ nombre, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONOS[nombre]} />
    </svg>
  )
}

function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null')
  } catch {
    return null
  }
}

function NavBar({ rol }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [abierto, setAbierto] = useState(false)
  const usuario = leerUsuario()
  const [pendientes, setPendientes] = useState(0)

  // El administrador ve cuántas solicitudes de cuenta esperan aprobación
  useEffect(() => {
    if (rol !== 'admin') return
    api.getSolicitudes()
      .then(d => setPendientes(Array.isArray(d) ? d.length : 0))
      .catch(() => {})
  }, [rol, location.pathname])

  // Cuando se cumple la hora de sesión del socio, la cierra aunque siga en la misma pantalla
  useEffect(() => {
    const restante = tiempoRestante(leerUsuario())
    if (restante === Infinity) return
    const timer = setTimeout(() => {
      cerrarPorVencimiento()
      navigate('/', { replace: true })
    }, Math.max(restante, 0))
    return () => clearTimeout(timer)
  }, [navigate])

  // Le avisa al CSS que esta pantalla tiene barra lateral (deja lugar a la izquierda)
  useEffect(() => {
    document.body.classList.add('has-sidebar')
    return () => document.body.classList.remove('has-sidebar')
  }, [])

  const irA = (ruta) => {
    setAbierto(false) // cierra el menú en celular/tablet
    navigate(ruta)
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    setAbierto(false)
    navigate('/', { replace: true })
  }

  const nombre = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : ''
  const nombreMostrado = nombre || (rol === 'admin' ? 'Administrador' : 'Socio')
  const iniciales = nombre
    ? nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
    : (rol === 'admin' ? 'AD' : 'SO')
  const grupos = GRUPOS[rol] || []
  const inicio = rol === 'admin' ? '/admin' : '/socio'

  return (
    <>
      {/* Barra superior: solo se ve en celular y tablet */}
      <header className="sc-topbar">
        <div className="sc-brand" role="button" onClick={() => irA(inicio)}>
          <img src={logo} alt="Sports Club" className="sc-logo" />
          <span className="sc-brand-nombre">Sports Club</span>
        </div>
        <button type="button" className="sc-icon-btn" aria-label="Abrir menú" onClick={() => setAbierto(true)}>
          <Icono nombre="menu" size={22} />
        </button>
      </header>

      {abierto && <div className="sc-overlay" onClick={() => setAbierto(false)} />}

      <aside className={`sc-sidebar ${abierto ? 'abierto' : ''}`}>
        <div className="sc-sidebar-cabecera">
          <div className="sc-brand" role="button" onClick={() => irA(inicio)}>
            <img src={logo} alt="Sports Club" className="sc-logo" />
            <div>
              <div className="sc-brand-nombre">Sports Club</div>
              <div className="sc-brand-sub">{rol === 'admin' ? 'Gestión del club' : 'Área del socio'}</div>
            </div>
          </div>
          <button type="button" className="sc-icon-btn sc-cerrar-menu" aria-label="Cerrar menú" onClick={() => setAbierto(false)}>
            <Icono nombre="cerrar" size={20} />
          </button>
        </div>

        <nav className="sc-nav">
          {grupos.map(g => (
            <div key={g.titulo} className="sc-nav-grupo">
              <div className="sc-nav-titulo">{g.titulo}</div>
              {g.items.map(it => (
                <a
                  key={it.ruta}
                  href={it.ruta}
                  className={`sc-link ${location.pathname === it.ruta ? 'activo' : ''}`}
                  onClick={(e) => { e.preventDefault(); irA(it.ruta) }}
                >
                  <Icono nombre={it.icono} />
                  {it.texto}
                  {it.ruta === '/admin/solicitudes' && pendientes > 0 && (
                    <span style={{
                      marginLeft: 'auto', minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999,
                      background: '#5b7cff', color: '#fff', fontSize: 12, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}>{pendientes}</span>
                  )}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="sc-usuario">
          <div className="sc-avatar">{iniciales}</div>
          <div className="sc-usuario-datos">
            <div className="sc-usuario-nombre">{nombreMostrado}</div>
            <div className="sc-usuario-rol">{rol === 'admin' ? 'Administrador' : 'Socio'}</div>
          </div>
          <button type="button" className="sc-icon-btn" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={handleLogout}>
            <Icono nombre="salir" />
          </button>
        </div>
      </aside>
    </>
  )
}

export default NavBar