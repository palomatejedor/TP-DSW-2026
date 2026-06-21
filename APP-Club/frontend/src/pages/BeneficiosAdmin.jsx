import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Modal, Form, Badge } from 'react-bootstrap'
import { api } from '../api'

function BeneficiosAdmin() {
  const [beneficios, setBeneficios] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [beneficioEditando, setBeneficioEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', estado: 'Activo' })
  const [errores, setErrores] = useState({})

  useEffect(() => {
    cargarBeneficios()
  }, [])

  const cargarBeneficios = async () => {
    const data = await api.getBeneficios()
    setBeneficios(data)
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria'
    return e
  }

  const abrirModalNuevo = () => {
    setBeneficioEditando(null)
    setForm({ nombre: '', descripcion: '', estado: 'Activo' })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalEditar = (beneficio) => {
    setBeneficioEditando(beneficio)
    setForm({ ...beneficio })
    setErrores({})
    setShowModal(true)
  }

  const guardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }
    if (beneficioEditando) {
      await api.updateBeneficio(beneficioEditando.id, form)
    } else {
      await api.createBeneficio(form)
    }
    await cargarBeneficios()
    setShowModal(false)
  }

  const eliminar = async (id) => {
    if (confirm('¿Seguro que querés eliminar este beneficio?')) {
      await api.deleteBeneficio(id)
      await cargarBeneficios()
    }
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Beneficios</h4>
          <Button variant="dark" onClick={abrirModalNuevo}>+ Nuevo beneficio</Button>
        </div>
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {beneficios.length === 0 && (
              <tr><td colSpan={4} className="text-center text-muted">No hay beneficios registrados</td></tr>
            )}
            {beneficios.map(b => (
              <tr key={b.id}>
                <td>{b.nombre}</td>
                <td>{b.descripcion}</td>
                <td><Badge bg={b.estado === 'Activo' ? 'success' : 'secondary'}>{b.estado}</Badge></td>
                <td>
                  <Button size="sm" variant="outline-dark" className="me-2" onClick={() => abrirModalEditar(b)}>Editar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => eliminar(b.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{beneficioEditando ? 'Editar beneficio' : 'Nuevo beneficio'}</Modal.Title>
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
              <Form.Control as="textarea" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} isInvalid={!!errores.descripcion} />
              <Form.Control.Feedback type="invalid">{errores.descripcion}</Form.Control.Feedback>
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

export default BeneficiosAdmin