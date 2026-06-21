import NavBar from '../components/Navbar'
import { Container, Row, Col, Card, Badge } from 'react-bootstrap'

const beneficiosMock = [
  { id: 1, nombre: 'Descuento en indumentaria', descripcion: '20% de descuento en la tienda oficial del club en compras de ropa y accesorios deportivos.', estado: 'Activo' },
  { id: 2, nombre: 'Clases de natación gratis', descripcion: 'Los socios activos tienen acceso gratuito a 2 clases de natación por mes.', estado: 'Activo' },
  { id: 3, nombre: 'Estacionamiento gratuito', descripcion: 'Acceso sin costo al estacionamiento del club en días de partido o evento.', estado: 'Activo' },
  { id: 4, nombre: 'Invitados con descuento', descripcion: 'Podés traer hasta 2 invitados por mes con 50% de descuento en la entrada.', estado: 'Activo' },
  { id: 5, nombre: 'Acceso anticipado a eventos', descripcion: 'Los socios tienen prioridad para comprar entradas a eventos y torneos del club.', estado: 'Inactivo' },
]

function Beneficios() {
  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4">
        <h4 className="fw-bold mb-1">Beneficios disponibles</h4>
        <p className="text-muted mb-4">Estos son los beneficios exclusivos para socios activos</p>
        <Row className="g-3">
          {beneficiosMock.filter(b => b.estado === 'Activo').map(b => (
            <Col md={6} key={b.id}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="fw-bold mb-0">🎁 {b.nombre}</Card.Title>
                    <Badge bg="success">{b.estado}</Badge>
                  </div>
                  <Card.Text className="text-muted">{b.descripcion}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  )
}

export default Beneficios