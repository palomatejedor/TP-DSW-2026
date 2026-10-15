import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Button, Modal, Form, Badge, Card, Row, Col } from 'react-bootstrap'
import { api } from '../api'

function Planes() {
  const [planes, setPlanes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [planEditando, setPlanEditando] = useState(null)
  const [vistaDetalle, setVistaDetalle] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', estado: 'Activo', tipo: 'Individual', periodicidad: 'Mensual' })
  const [errores, setErrores] = useState({})

  useEffect(() => {
    cargarPlanes()
  }, [])

  const cargarPlanes = async () => {
    const data = await api.getPlanes()
    setPlanes(data)
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria'
    if (!form.precio || isNaN(form.precio) || form.precio <= 0) e.precio = 'El precio debe ser un número mayor a 0'
    return e
  }

  const abrirModalNuevo = () => {
    setPlanEditando(null)
    setForm({ nombre: '', descripcion: '', precio: '', estado: 'Activo', tipo: 'Individual', periodicidad: 'Mensual' })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalEditar = (plan) => {
    setPlanEditando(plan)
    setForm({ ...plan, tipo: plan.tipo || 'Individual', periodicidad: plan.periodicidad || 'Mensual' })
    setErrores({})
    setShowModal(true)
  }

  const guardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }
    if (planEditando) {
      await api.updatePlan(planEditando.id, form)
    } else {
      await api.createPlan(form)
    }
    await cargarPlanes()
    setShowModal(false)
  }

  const eliminar = async (id) => {
    if (confirm('¿Seguro que querés eliminar este plan?')) {
      await api.deletePlan(id)
      await cargarPlanes()
    }
  }

  if (vistaDetalle) {
    return (
      <>
        <NavBar rol="admin" />
        <Container className="mt-4">
          <Button variant="outline-dark" className="mb-3" onClick={() => setVistaDetalle(null)}>← Volver</Button>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="fw-bold">{vistaDetalle.nombre}</h4>
              <div className="d-flex gap-2 mb-3">
                <Badge bg={vistaDetalle.estado === 'Activo' ? 'success' : 'secondary'}>{vistaDetalle.estado}</Badge>
                <Badge bg="primary">{vistaDetalle.tipo || 'Individual'}</Badge>
                <Badge bg="info">{vistaDetalle.periodicidad || 'Mensual'}</Badge>
              </div>
              <p className="text-muted">{vistaDetalle.descripcion}</p>
              <h5 className="fw-bold">Precio: ${Number(vistaDetalle.precio).toLocaleString()}{vistaDetalle.periodicidad === 'Anual' ? '/año' : '/mes'}</h5>
            </Card.Body>
          </Card>
        </Container>
      </>
    )
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Planes</h4>
          <Button variant="dark" onClick={abrirModalNuevo}>+ Nuevo plan</Button>
        </div>
        <Row className="g-3">
          {planes.map(p => (
            <Col md={4} key={p.id}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="fw-bold mb-0">{p.nombre}</Card.Title>
                    <Badge bg={p.estado === 'Activo' ? 'success' : 'secondary'}>{p.estado}</Badge>
                  </div>
                  <div className="d-flex gap-2 mb-2">
                    <Badge bg="primary">{p.tipo || 'Individual'}</Badge>
                    <Badge bg="info">{p.periodicidad || 'Mensual'}</Badge>
                  </div>
                  <Card.Text className="text-muted small">{p.descripcion}</Card.Text>
                  <h5 className="fw-bold">${Number(p.precio).toLocaleString()}<span className="text-muted fw-normal fs-6">{p.periodicidad === 'Anual' ? '/año' : '/mes'}</span></h5>
                  <div className="d-flex gap-2 mt-3">
                    <Button size="sm" variant="outline-dark" onClick={() => setVistaDetalle(p)}>Ver detalle</Button>
                    <Button size="sm" variant="outline-dark" onClick={() => abrirModalEditar(p)}>Editar</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => eliminar(p.id)}>Eliminar</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{planEditando ? 'Editar plan' : 'Nuevo plan'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} isInvalid={!!errores.nombre} />
              <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} isInvalid={!!errores.descripcion} />
              <Form.Control.Feedback type="invalid">{errores.descripcion}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} isInvalid={!!errores.precio} />
              <Form.Control.Feedback type="invalid">{errores.precio}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de plan</Form.Label>
              <Form.Select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option>Individual</option>
                <option>Familiar</option>
              </Form.Select>
              <Form.Text className="text-muted">Los planes familiares solo los puede contratar el titular de un grupo familiar.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Periodicidad del pago</Form.Label>
              <Form.Select value={form.periodicidad} onChange={e => setForm({ ...form, periodicidad: e.target.value })}>
                <option>Mensual</option>
                <option>Anual</option>
              </Form.Select>
              <Form.Text className="text-muted">El precio es lo que se paga en cada período (por mes o por año).</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option>Activo</option>
                <option>Inactivo</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={guardar}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Planes