import NavBar from '../components/Navbar'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function DashboardAdmin() {
  const navigate = useNavigate()

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <h4 className="fw-bold mb-1">Panel de Administración</h4>
        <p className="text-muted mb-4">Gestioná todos los recursos del club</p>
        <Row className="g-3">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/socios')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>👥</div>
                <Card.Title className="mt-2">Socios</Card.Title>
                <Card.Text className="text-muted small">Gestionar socios del club</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/grupo-familiar')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>👨‍👩‍👧‍👦</div>
                <Card.Title className="mt-2">Grupo Familiar</Card.Title>
                <Card.Text className="text-muted small">Armar y gestionar grupos familiares</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/actividades')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>🏃</div>
                <Card.Title className="mt-2">Actividades</Card.Title>
                <Card.Text className="text-muted small">Gestionar actividades deportivas</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/planes')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>📋</div>
                <Card.Title className="mt-2">Planes</Card.Title>
                <Card.Text className="text-muted small">Gestionar planes del club</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/inscripciones')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>📅</div>
                <Card.Title className="mt-2">Inscripciones</Card.Title>
                <Card.Text className="text-muted small">Ver inscripciones a actividades</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/beneficios')}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '2rem' }}>🎁</div>
                <Card.Title className="mt-2">Beneficios</Card.Title>
                <Card.Text className="text-muted small">Gestionar beneficios del club</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default DashboardAdmin