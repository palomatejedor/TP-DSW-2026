import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap'
import { api } from '../api'

function Beneficios() {
  const [beneficios, setBeneficios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [socioActivo, setSocioActivo] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
        if (usuario?.mail) {
          const socio = await api.getSocioByMail(usuario.mail)
          if (socio && !socio.error && socio.estado !== 'Activo') {
            setSocioActivo(false)
            setCargando(false)
            return
          }
        }
        const data = await api.getBeneficios()
        if (!Array.isArray(data)) throw new Error()
        setBeneficios(data)
      } catch {
        setError('No se pudieron cargar los beneficios')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const activos = beneficios.filter(b => b.estado === 'Activo')

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4">
        <h4 className="fw-bold mb-1">Beneficios disponibles</h4>
        <p className="text-muted mb-4">Estos son los beneficios exclusivos para socios activos</p>

        {!cargando && !socioActivo && (
          <Alert variant="warning">
            <Alert.Heading className="h6 fw-bold">Tu membresía no está activa</Alert.Heading>
            Los beneficios están disponibles solo para socios activos. Comunicate con el club para regularizar tu situación.
          </Alert>
        )}

        {cargando && <div className="text-center my-4"><Spinner animation="border" /></div>}
        {error && <p className="text-danger">{error}</p>}
        {!cargando && !error && socioActivo && activos.length === 0 && (
          <p className="text-muted">Por el momento no hay beneficios disponibles.</p>
        )}

        <Row className="g-3">
          {socioActivo && activos.map(b => (
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