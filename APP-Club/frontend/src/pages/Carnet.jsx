import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Card, Badge, Row, Col, Spinner } from 'react-bootstrap'
import { api } from '../api'

function Carnet() {
  const [socio, setSocio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarSocio = async () => {
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || 'null')
      if (!usuarioGuardado?.mail) {
        setError('No se encontró la sesión. Volvé a iniciar sesión.')
        setCargando(false)
        return
      }
      try {
        const data = await api.getSocioByMail(usuarioGuardado.mail)
        if (data.error) {
          setError('No se encontraron datos de socio para este usuario.')
        } else {
          setSocio(data)
        }
      } catch {
        setError('Error al conectar con el servidor.')
      } finally {
        setCargando(false)
      }
    }
    cargarSocio()
  }, [])

  const antiguedad = () => {
    if (!socio?.fecha_alta) return '-'
    const inicio = new Date(socio.fecha_alta)
    const hoy = new Date()
    const totalMeses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
    if (totalMeses < 12) return `${totalMeses} meses`
    return `${Math.floor(totalMeses / 12)} año${Math.floor(totalMeses / 12) > 1 ? 's' : ''}`
  }

  const numeroCarnet = socio ? `SC-${String(socio.id).padStart(5, '0')}` : ''
  const iniciales = socio ? `${socio.nombre[0]}${socio.apellido[0]}` : ''

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
        <Container className="mt-4" style={{ maxWidth: '500px' }}>
          <p className="text-danger">{error}</p>
        </Container>
      </>
    )
  }

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4" style={{ maxWidth: '500px' }}>
        <h4 className="fw-bold mb-1">Mi Carnet</h4>
        <p className="text-muted mb-4">Tu identificación digital como socio</p>

        <Card className="border-0 shadow" style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)',
          borderRadius: '16px',
          color: 'white'
        }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, letterSpacing: '1px' }}>SPORTS CLUB</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>CARNET DIGITAL</div>
              </div>
              <Badge bg={socio.estado === 'Activo' ? 'success' : 'secondary'}>
                {socio.estado}
              </Badge>
            </div>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4a9eff, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: 'white',
                flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                {iniciales}
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {socio.nombre} {socio.apellido}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                  DNI: {socio.dni.toLocaleString()}
                </div>
              </div>
            </div>

            <Row className="g-3">
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>CATEGORÍA</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{socio.categoria}</div>
              </Col>
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>PLAN</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                  {socio.plan ? socio.plan.nombre : 'Sin plan'}
                </div>
              </Col>
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>ANTIGÜEDAD</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{antiguedad()}</div>
              </Col>
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>N° SOCIO</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{numeroCarnet}</div>
              </Col>
            </Row>

            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.75rem',
              opacity: 0.5
            }}>
              {socio.fecha_alta && (
                <>Miembro desde {new Date(socio.fecha_alta).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}</>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

export default Carnet
