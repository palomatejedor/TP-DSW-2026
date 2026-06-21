import NavBar from '../components/Navbar'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function DashboardSocio() {
  const navigate = useNavigate()

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4">
        <h4 className="fw-bold mb-1">Bienvenido, Socio</h4>
        <p className="text-muted mb-4">Accedé a los servicios del club</p>
        <Row className="g-3">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/socio/carnet')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>🪪</div>
                <Card.Title className="mt-2">Mi Carnet</Card.Title>
                <Card.Text className="text-muted small">Ver carnet digital</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/socio/actividades')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>🏃</div>
                <Card.Title className="mt-2">Actividades</Card.Title>
                <Card.Text className="text-muted small">Inscribite a actividades deportivas</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/socio/planes')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>📋</div>
                <Card.Title className="mt-2">Planes</Card.Title>
                <Card.Text className="text-muted small">Consultá los planes disponibles</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/socio/cuota')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>💳</div>
                <Card.Title className="mt-2">Mi Cuota</Card.Title>
                <Card.Text className="text-muted small">Consultá y pagá tu cuota social</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/socio/beneficios')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>🎁</div>
                <Card.Title className="mt-2">Beneficios</Card.Title>
                <Card.Text className="text-muted small">Ver beneficios exclusivos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default DashboardSocio