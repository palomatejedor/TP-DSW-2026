import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const MODULOS = [
  { ruta: '/admin/socios', titulo: 'Socios', texto: 'Alta, edición, baja y búsqueda de socios.', icono: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15 4.65a3.5 3.5 0 0 1 0 6.7' },
  { ruta: '/admin/grupo-familiar', titulo: 'Grupo Familiar', texto: 'Grupos con plan compartido.', icono: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 12a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zM3.5 19c.4-3 2.6-5 5.5-5s5.1 2 5.5 5M15.5 14.3c2.4-.3 4.4 1.2 5 4' },
  { ruta: '/admin/actividades', titulo: 'Actividades', texto: 'Horarios, cupos y estado.', icono: 'M3 12h4l3-8 4 16 3-8h4' },
  { ruta: '/admin/planes', titulo: 'Planes', texto: 'Planes y cuotas del club.', icono: 'M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5zM3 10h18' },
  { ruta: '/admin/inscripciones', titulo: 'Inscripciones', texto: 'Quién está en qué actividad.', icono: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c.4-3.4 2.8-5.5 6-5.5s5.6 2.1 6 5.5M16 11l2 2 4-4' },
  { ruta: '/admin/beneficios', titulo: 'Beneficios', texto: 'Ventajas para socios activos.', icono: 'M3 8h18v4H3zM5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3-5-1s3 1 5 1zM12 8c1.5-3 5-3 5-1s-3 1-5 1z' },
]

function saludo() {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buen día'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function DashboardAdmin() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(null)

  let nombre = ''
  try {
    nombre = JSON.parse(localStorage.getItem('usuario') || 'null')?.nombre || ''
  } catch { /* sin sesión */ }

  useEffect(() => {
    const cargar = async () => {
      try {
        const [activos, actividades, inscripciones, todos] = await Promise.all([
          api.getSocios({ estado: 'Activo', limit: 1 }),
          api.getActividades(),
          api.getInscripciones(),
          api.getSocios({ limit: 1000 }),
        ])
        const titulares = new Set(
          (todos.data || []).filter(s => s.titular).map(s => s.titular.id)
        )
        setDatos({
          sociosActivos: activos.pagination?.total ?? 0,
          actividadesActivas: (actividades || []).filter(a => a.estado === 'Activo').length,
          inscripcionesActivas: (inscripciones || []).filter(i => i.estado !== 'Baja').length,
          grupos: titulares.size,
        })
      } catch {
        setDatos(null)
      }
    }
    cargar()
  }, [])

  const kpis = [
    { label: 'Socios activos', valor: datos?.sociosActivos },
    { label: 'Actividades activas', valor: datos?.actividadesActivas },
    { label: 'Inscripciones activas', valor: datos?.inscripcionesActivas },
    { label: 'Grupos familiares', valor: datos?.grupos },
  ]

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4 pb-5">
        <div className="mb-4">
          <h4 className="fw-bold mb-1">{saludo()}{nombre ? `, ${nombre}` : ''}</h4>
          <p className="text-muted mb-0">Este es el resumen de tu club.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          {kpis.map(k => (
            <div key={k.label} className="card" style={{ padding: '20px 22px' }}>
              <div className="text-muted" style={{ fontSize: '13px', marginBottom: '10px' }}>{k.label}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff' }}>
                {k.valor ?? '—'}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '16px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#566283' }}>
          Módulos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {MODULOS.map(m => (
            <div
              key={m.ruta}
              className="card"
              style={{ cursor: 'pointer', padding: '20px', flexDirection: 'row', alignItems: 'center', gap: '16px' }}
              onClick={() => navigate(m.ruta)}
            >
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(91,124,255,0.14)', border: '1px solid rgba(91,124,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9db1ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={m.icono} />
                </svg>
              </div>
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>{m.titulo}</div>
                <div className="text-muted" style={{ fontSize: '13px', lineHeight: 1.45 }}>{m.texto}</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5677" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          ))}
        </div>
      </Container>
    </>
  )
}

export default DashboardAdmin