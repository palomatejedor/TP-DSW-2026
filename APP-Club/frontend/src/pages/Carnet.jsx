import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Spinner } from 'react-bootstrap'
import { api } from '../api'

const ETIQUETA = { margin: '0 0 2px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c3cdf5' }
const VALOR = { margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }
const SECCION = { marginBottom: 16, fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#566283' }

const formatearFecha = (f) => {
  if (!f) return '-'
  const [y, m, d] = String(f).slice(0, 10).split('-')
  return y && m && d ? `${d}/${m}/${y}` : '-'
}

function TarjetaCarnet({ socio }) {
  const numeroCarnet = `SC-${String(socio.id).padStart(5, '0')}`
  const activo = socio.estado === 'Activo'

  const antiguedad = () => {
    if (!socio?.fecha_alta) return '-'
    // Se lee la fecha como texto (AAAA-MM-DD) para que la zona horaria no corra el día
    const [y, m] = String(socio.fecha_alta).slice(0, 10).split('-').map(Number)
    if (!y || !m) return '-'
    const hoy = new Date()
    const totalMeses = (hoy.getFullYear() - y) * 12 + (hoy.getMonth() + 1 - m)
    if (totalMeses <= 0) return 'Menos de 1 mes' // incluye altas de este mes o con fecha futura
    if (totalMeses < 12) return `${totalMeses} ${totalMeses === 1 ? 'mes' : 'meses'}`
    const anios = Math.floor(totalMeses / 12)
    return `${anios} ${anios === 1 ? 'año' : 'años'}`
  }

  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 24, padding: 30, boxSizing: 'border-box',
      minHeight: 270, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24,
      background: 'linear-gradient(145deg, #3a5bff 0%, #1a2f8f 55%, #0e1630 100%)',
      boxShadow: '0 30px 70px rgba(43,80,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
    }}>
      <svg width="320" height="320" viewBox="0 0 320 320" aria-hidden="true" style={{ position: 'absolute', right: -90, bottom: -110, opacity: 0.16 }}>
        <g fill="none" stroke="#ffffff" strokeWidth="3">
          <circle cx="160" cy="160" r="150" /><circle cx="160" cy="160" r="96" /><line x1="10" y1="160" x2="310" y2="160" />
        </g>
      </svg>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>Sports Club</div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#c3cdf5' }}>CARNET DIGITAL</div>
        </div>
        <span style={{
          padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          background: activo ? 'rgba(255,255,255,0.18)' : 'rgba(255,123,110,0.25)', color: '#fff'
        }}>
          {socio.estado}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c3cdf5' }}>Socio</p>
        <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: '-0.01em', color: '#fff', textTransform: 'capitalize', lineHeight: 1.1 }}>
          {socio.nombre} {socio.apellido}
        </p>
      </div>

      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '14px 32px' }}>
        <div><p style={ETIQUETA}>N° socio</p><p style={VALOR}>{numeroCarnet}</p></div>
        <div><p style={ETIQUETA}>Plan</p><p style={VALOR}>{socio.plan ? socio.plan.nombre : 'Sin plan'}</p></div>
        <div><p style={ETIQUETA}>Categoría</p><p style={VALOR}>{socio.categoria}</p></div>
        <div><p style={ETIQUETA}>Antigüedad</p><p style={VALOR}>{antiguedad()}</p></div>
      </div>
    </div>
  )
}

function BotonFlecha({ onClick, label, d }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ width: 40, height: 40, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', color: '#e6eaf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    </button>
  )
}

function Carnet() {
  const [personas, setPersonas] = useState([])
  const [indice, setIndice] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || 'null')
    if (!usuarioGuardado?.mail) {
      setError('No se encontró la sesión. Volvé a iniciar sesión.')
      setCargando(false)
      return
    }
    try {
      const yo = await api.getSocioByMail(usuarioGuardado.mail)
      if (yo.error) {
        setError('No se encontraron datos de socio para este usuario.')
        setCargando(false)
        return
      }

      const familia = await api.getFamilia(yo.id)
      if (familia.error) {
        setPersonas([yo])
      } else {
        setPersonas([familia.titular, ...familia.miembros])
      }
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const anterior = () => setIndice(i => (i === 0 ? personas.length - 1 : i - 1))
  const siguiente = () => setIndice(i => (i === personas.length - 1 ? 0 : i + 1))

  if (cargando) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-5 text-center">
          <Spinner animation="border" />
        </Container>
      </>
    )
  }

  if (error) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-4">
          <p className="text-danger">{error}</p>
        </Container>
      </>
    )
  }

  const actual = personas[indice]
  const hayFamilia = personas.length > 1
  const datos = [
    { label: 'Nombre', valor: actual.nombre },
    { label: 'Apellido', valor: actual.apellido },
    { label: 'DNI', valor: actual.dni ? Number(actual.dni).toLocaleString('es-AR') : '-' },
    { label: 'Mail', valor: actual.mail || 'Sin mail' },
    { label: 'Fecha de alta', valor: formatearFecha(actual.fecha_alta) },
    { label: 'Nacimiento', valor: formatearFecha(actual.fecha_nacimiento) },
  ]

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4 pb-5">
        <h4 className="fw-bold mb-1">Mi carnet</h4>
        <p className="text-muted mb-4">
          {hayFamilia
            ? 'Deslizá para ver el carnet de cada integrante de tu grupo familiar.'
            : 'Presentalo en la entrada del club.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>

          <div style={{ flex: '1 1 400px', maxWidth: 500 }}>
            <TarjetaCarnet socio={actual} />

            {hayFamilia && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 24 }}>
                  <BotonFlecha onClick={anterior} label="Carnet anterior" d="M15 6l-6 6 6 6" />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {personas.map((p, i) => (
                      <span
                        key={p.id}
                        role="button"
                        aria-label={`Ver carnet de ${p.nombre}`}
                        onClick={() => setIndice(i)}
                        style={{
                          width: i === indice ? 24 : 8, height: 8, borderRadius: 999, cursor: 'pointer',
                          background: i === indice ? '#5b7cff' : '#2a3756', transition: 'all 0.2s'
                        }}
                      />
                    ))}
                  </div>
                  <BotonFlecha onClick={siguiente} label="Carnet siguiente" d="M9 6l6 6-6 6" />
                </div>
                <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 14, color: '#7f8bab', textTransform: 'capitalize' }}>
                  {actual.nombre} {actual.apellido}{indice === 0 ? ' · titular del grupo' : ''}
                </p>
              </>
            )}
          </div>

          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={SECCION}>Datos del socio</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 24px' }}>
                {datos.map(d => (
                  <div key={d.label} style={{ minWidth: 0 }}>
                    <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', overflowWrap: 'anywhere' }}>{d.valor}</div>
                  </div>
                ))}
              </div>
            </div>

            {hayFamilia && (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ ...SECCION, marginBottom: 12 }}>Grupo familiar · {personas.length} de 5</div>
                {personas.map((p, i) => (
                  <div
                    key={p.id}
                    role="button"
                    onClick={() => setIndice(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      opacity: i === indice ? 1 : 0.75
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                      background: i === indice ? 'rgba(91,124,255,0.3)' : 'rgba(91,124,255,0.16)', color: '#9db1ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {p.nombre[0]}{p.apellido[0]}
                    </div>
                    <div style={{ flexGrow: 1, fontSize: 14, fontWeight: 500, color: '#fff', textTransform: 'capitalize' }}>
                      {p.nombre} {p.apellido}
                    </div>
                    <span className="text-muted" style={{ fontSize: 12 }}>{i === 0 ? 'Titular' : 'Miembro'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  )
}

export default Carnet