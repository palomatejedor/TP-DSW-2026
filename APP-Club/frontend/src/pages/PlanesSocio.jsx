import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Row, Col, Card, Badge, Button, Modal, Alert, Spinner } from 'react-bootstrap'
import { api } from '../api'

function PlanesSocio() {
  const [planes, setPlanes] = useState([])
  const [socio, setSocio] = useState(null)
  const [esMiembroNoTitular, setEsMiembroNoTitular] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [exito, setExito] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
    if (!usuario?.mail) {
      setError('No se encontró la sesión. Volvé a iniciar sesión.')
      setCargando(false)
      return
    }
    try {
      const miSocio = await api.getSocioByMail(usuario.mail)
      if (miSocio.error) {
        setError('No se encontraron datos de socio para este usuario.')
        setCargando(false)
        return
      }
      setSocio(miSocio)
      setEsMiembroNoTitular(!!miSocio.titular)

      const planesData = await api.getPlanes()
      setPlanes(planesData.filter(p => p.estado === 'Activo'))
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const abrirModal = (plan) => {
    setPlanSeleccionado(plan)
    setShowModal(true)
  }

  const confirmarPlan = async () => {
    const resultado = await api.updateSocio(socio.id, { plan: { id: planSeleccionado.id } })
    setShowModal(false)
    if (resultado.error) {
      setError(resultado.error)
      return
    }
    setExito(`Te suscribiste a ${planSeleccionado.nombre} correctamente!`)
    setTimeout(() => setExito(''), 4000)
    await cargarDatos()
  }

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

  if (esMiembroNoTitular) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-4">
          <h4 className="fw-bold mb-1">Mi plan</h4>
          <p className="text-muted mb-4">Formás parte de un grupo familiar</p>
          <Alert variant="info">
            Tu plan lo gestiona el titular de tu grupo familiar: <b>{socio.titular.nombre} {socio.titular.apellido}</b>.
            Todos los integrantes de un mismo grupo comparten el mismo plan.
          </Alert>
          <Card className="border-0 shadow-sm" style={{ maxWidth: '400px' }}>
            <Card.Body className="p-4">
              <div className="text-muted small mb-1">PLAN ACTUAL</div>
              <h5 className="fw-bold">{socio.plan ? socio.plan.nombre : 'Sin plan asignado'}</h5>
              {socio.plan && <div className="text-muted">${Number(socio.plan.precio).toLocaleString()}/mes</div>}
            </Card.Body>
          </Card>
        </Container>
      </>
    )
  }

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4">
        <h4 className="fw-bold mb-1">Planes disponibles</h4>
        <p className="text-muted mb-4">Elegí el plan que más te convenga</p>

        {exito && <Alert variant="success">{exito}</Alert>}

        {socio?.plan && (
          <Alert variant="info">
            Tu plan actual es: <b>{socio.plan.nombre}</b>
          </Alert>
        )}

        <Row className="g-3">
          {planes.length === 0 && (
            <p className="text-muted">No hay planes disponibles por el momento.</p>
          )}
          {planes.map(p => {
            const esActual = socio?.plan?.id === p.id
            return (
              <Col md={4} key={p.id}>
                <Card className={`border-0 shadow-sm h-100 ${esActual ? 'border border-success' : ''}`}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="fw-bold mb-0">{p.nombre}</Card.Title>
                      {esActual && <Badge bg="success">Tu plan</Badge>}
                    </div>
                    <Card.Text className="text-muted small">{p.descripcion}</Card.Text>
                    <h5 className="fw-bold mb-3">${Number(p.precio).toLocaleString()}<span className="text-muted fw-normal fs-6">/mes</span></h5>
                    {esActual ? (
                      <Button variant="success" disabled className="w-100">✓ Plan actual</Button>
                    ) : (
                      <Button variant="dark" className="w-100" onClick={() => abrirModal(p)}>
                        Elegir este plan
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar cambio de plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {planSeleccionado && (
            <p>¿Confirmás que querés suscribirte a <b>{planSeleccionado.nombre}</b> por ${Number(planSeleccionado.precio).toLocaleString()}/mes?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={confirmarPlan}>Confirmar</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default PlanesSocio