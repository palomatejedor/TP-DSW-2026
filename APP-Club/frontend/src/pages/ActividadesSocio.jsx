import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Row, Col, Card, Badge, Button, Modal, Alert } from 'react-bootstrap'
import { api } from '../api'

function ActividadesSocio() {
  const [actividades, setActividades] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null)
  const [exito, setExito] = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
const SOCIO_ID = usuario.socioId

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [acts, ins] = await Promise.all([
      api.getActividades(),
      api.getInscripciones()
    ])
    setActividades(acts.filter(a => a.estado === 'Activo'))
    setInscripciones(ins.filter(i => i.socio?.id === SOCIO_ID).map(i => i.actividad?.id))
  }

  const yaInscripto = (id) => inscripciones.includes(id)

  const abrirModal = (actividad) => {
    setActividadSeleccionada(actividad)
    setShowModal(true)
  }

  const confirmarInscripcion = async () => {
    await api.createInscripcion({
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      socio: { id: SOCIO_ID },
      actividad: { id: actividadSeleccionada.id }
    })
    setShowModal(false)
    setExito(`Te inscribiste a ${actividadSeleccionada.nombre} correctamente!`)
    setTimeout(() => setExito(''), 4000)
    await cargarDatos()
  }

  const getCupoColor = (actividad) => {
    const disponible = actividad.cupo_maximo - (actividad.cupo_ocupado || 0)
    if (disponible <= 0) return 'danger'
    if (disponible <= 3) return 'warning'
    return 'success'
  }

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4">
        <h4 className="fw-bold mb-1">Actividades deportivas</h4>
        <p className="text-muted mb-4">Inscribite a las actividades disponibles del club</p>

        {exito && <Alert variant="success">{exito}</Alert>}

        <Row className="g-3">
          {actividades.map(a => {
            const disponible = a.cupo_maximo - (a.cupo_ocupado || 0)
            const inscripto = yaInscripto(a.id)
            return (
              <Col md={6} key={a.id}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="fw-bold mb-0">{a.nombre}</Card.Title>
                      <Badge bg={getCupoColor(a)}>
                        {disponible <= 0 ? 'Sin cupo' : `${disponible} lugares`}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small mb-3">{a.descripcion}</Card.Text>
                    <div className="small mb-1">📅 <b>Días:</b> {a.dias}</div>
                    <div className="small mb-3">🕐 <b>Horario:</b> {a.horario}</div>
                    {inscripto ? (
                      <Button variant="success" disabled className="w-100">✓ Inscripto</Button>
                    ) : disponible <= 0 ? (
                      <Button variant="secondary" disabled className="w-100">Sin cupo disponible</Button>
                    ) : (
                      <Button variant="dark" className="w-100" onClick={() => abrirModal(a)}>
                        Inscribirme
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
          <Modal.Title>Confirmar inscripción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actividadSeleccionada && (
            <>
              <p>¿Confirmás tu inscripción a <b>{actividadSeleccionada.nombre}</b>?</p>
              <p className="text-muted small">📅 {actividadSeleccionada.dias} — 🕐 {actividadSeleccionada.horario}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={confirmarInscripcion}>Confirmar</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ActividadesSocio