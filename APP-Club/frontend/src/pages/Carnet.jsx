import NavBar from '../components/Navbar'
import { Container, Card, Badge, Row, Col } from 'react-bootstrap'

const socioMock = {
  nombre: 'María',
  apellido: 'Gómez',
  dni: 87654321,
  categoria: 'Adolescente',
  estado: 'Activo',
  fecha_alta: '2024-03-15',
  numero_carnet: 'SC-00042',
  plan: 'Plan Full',
}

function Carnet() {
  const antiguedad = () => {
    const inicio = new Date(socioMock.fecha_alta)
    const hoy = new Date()
    const totalMeses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
    if (totalMeses < 12) return `${totalMeses} meses`
    return `${Math.floor(totalMeses / 12)} año${Math.floor(totalMeses / 12) > 1 ? 's' : ''}`
  }

  const iniciales = `${socioMock.nombre[0]}${socioMock.apellido[0]}`

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
              <Badge bg={socioMock.estado === 'Activo' ? 'success' : 'secondary'}>
                {socioMock.estado}
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
                  {socioMock.nombre} {socioMock.apellido}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                  DNI: {socioMock.dni.toLocaleString()}
                </div>
              </div>
            </div>

            <Row className="g-3">
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>CATEGORÍA</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{socioMock.categoria}</div>
              </Col>
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>PLAN</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{socioMock.plan}</div>
              </Col>
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>ANTIGÜEDAD</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{antiguedad()}</div>
              </Col>
              <Col xs={6}>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>N° SOCIO</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{socioMock.numero_carnet}</div>
              </Col>
            </Row>

            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.75rem',
              opacity: 0.5
            }}>
              Miembro desde {new Date(socioMock.fecha_alta).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

export default Carnet