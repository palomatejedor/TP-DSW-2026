import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const ACCESOS = [
  { ruta: '/socio/actividades', titulo: 'Actividades', texto: 'Inscribite o dalo de baja.', icono: 'M3 12h4l3-8 4 16 3-8h4' },
  { ruta: '/socio/planes', titulo: 'Planes', texto: 'Mirá y cambiá tu plan.', icono: 'M6 4h12v17H6zM9 8h6M9 12h6M9 16h4' },
  { ruta: '/socio/cuota', titulo: 'Cuota', texto: 'Estado de tus pagos.', icono: 'M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.6 0-4.5 1.2-4.5 3s1.6 2.6 4.5 3 4.5 1.2 4.5 3-1.9 3-4.5 3c-2.1 0-3.7-.8-4.5-2' },
  { ruta: '/socio/beneficios', titulo: 'Beneficios', texto: 'Descuentos para socios.', icono: 'M3 8h18v4H3zM5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3-5-1s3 1 5 1zM12 8c1.5-3 5-3 5-1s-3 1-5 1z' },
]

const hora = (h) => (h ? String(h).slice(0, 5) : '')

function DashboardSocio() {
  const navigate = useNavigate()
  const [socio, setSocio] = useState(null)
  const [misActividades, setMisActividades] = useState([])

  let usuario = null
  try {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  } catch { /* sin sesión */ }

  useEffect(() => {
    const cargar = async () => {
      try {
        if (!usuario?.mail) return
        const yo = await api.getSocioByMail(usuario.mail)
        if (!yo || yo.error) return
        setSocio(yo)
        const inscripciones = await api.getInscripciones()
        setMisActividades(
          (inscripciones || []).filter(i => i.socio?.id === yo.id && i.estado !== 'Baja')
        )
      } catch { /* si falla, se muestra la pantalla sin datos */ }
    }
    cargar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4 pb-5">
        <div className="mb-4">
          <h4 className="fw-bold mb-1">Hola, {usuario?.nombre || 'socio'}</h4>
          <p className="text-muted mb-0">Esto es lo que necesitás de tu club.</p>
        </div>

        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 22, padding: '28px 32px', marginBottom: 32,
          background: 'linear-gradient(120deg, #2b50ff 0%, #1a2f8f 60%, #101a2e 100%)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          boxShadow: '0 20px 50px rgba(43,80,255,0.22)'
        }}>
          <svg width="260" height="260" viewBox="0 0 320 320" aria-hidden="true" style={{ position: 'absolute', right: -60, top: -70, opacity: 0.14 }}>
            <g fill="none" stroke="#ffffff" strokeWidth="3"><circle cx="160" cy="160" r="150" /><circle cx="160" cy="160" r="96" /></g>
          </svg>
          <div style={{ position: 'relative' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c3cdf5' }}>Tu membresía</p>
            <p style={{ margin: '0 0 4px', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 28, color: '#fff' }}>
              {socio?.plan?.nombre || 'Sin plan'}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#c3cdf5' }}>
              {socio ? `Categoría ${socio.categoria || '-'} · N° de socio ${String(socio.id).padStart(4, '0')}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/socio/carnet')}
            style={{ position: 'relative', height: 46, padding: '0 22px', borderRadius: 12, border: 'none', background: '#fff', color: '#1a2f8f', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Ver mi carnet →
          </button>
        </div>

        <div style={{ marginBottom: 16, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#566283' }}>Accesos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 36 }}>
          {ACCESOS.map(m => (
            <div
              key={m.ruta}
              className="card"
              style={{ cursor: 'pointer', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}
              onClick={() => navigate(m.ruta)}
            >
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(91,124,255,0.14)', border: '1px solid rgba(91,124,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9db1ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={m.icono} /></svg>
              </div>
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{m.titulo}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>{m.texto}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#566283' }}>Mis actividades</div>
        <div className="card" style={{ overflow: 'hidden' }}>
          {misActividades.length === 0 && (
            <div className="text-muted" style={{ padding: '22px' }}>Todavía no estás inscripto en ninguna actividad.</div>
          )}
          {misActividades.map((i, idx) => (
            <div
              key={i.id}
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 20px', padding: '18px 22px', borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: 2 }}>{i.actividad?.nombre}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  {i.actividad?.dias}
                  {i.actividad?.horario_desde ? ` · ${hora(i.actividad.horario_desde)} a ${hora(i.actividad.horario_hasta)}` : ''}
                </div>
              </div>
              <span className={`badge ${i.estado === 'Confirmada' ? 'bg-success' : 'bg-warning'}`}>{i.estado}</span>
            </div>
          ))}
        </div>
      </Container>
    </>
  )
}

export default DashboardSocio