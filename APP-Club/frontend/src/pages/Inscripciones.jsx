import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Modal, Form, Badge } from 'react-bootstrap'
import { api } from '../api'

function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [inscripcionEditando, setInscripcionEditando] = useState(null)
  const [estado, setEstado] = useState('Pendiente')

  useEffect(() => {
    cargarInscripciones()
  }, [])

  const cargarInscripciones = async () => {
    const data = await api.getInscripciones()
    setInscripciones(data)
  }

  const abrirModalEstado = (ins) => {
    setInscripcionEditando(ins)
    setEstado(ins.estado)
    setShowModal(true)
  }

  const guardarEstado = async () => {
    await api.updateInscripcion(inscripcionEditando.id, { ...inscripcionEditando, estado })
    await cargarInscripciones()
    setShowModal(false)
  }

  const eliminar = async (id) => {
    if (confirm('¿Seguro que querés eliminar esta inscripción?')) {
      await api.deleteInscripcion(id)
      await cargarInscripciones()
    }
  }

  const getBadge = (estado) => {
    if (estado === 'Confirmada') return 'success'
    if (estado === 'Pendiente') return 'warning'
    return 'secondary'
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Inscripciones</h4>
        </div>
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Socio</th><th>Actividad</th><th>Fecha</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">No hay inscripciones registradas</td></tr>
            )}
            {inscripciones.map(i => (
              <tr key={i.id}>
                <td>{i.socio ? `${i.socio.nombre} ${i.socio.apellido}` : '-'}</td>
                <td>{i.actividad ? i.actividad.nombre : '-'}</td>
                <td>{i.fecha}</td>
                <td><Badge bg={getBadge(i.estado)}>{i.estado}</Badge></td>
                <td>
                  <Button size="sm" variant="outline-dark" className="me-2" onClick={() => abrirModalEstado(i)}>Cambiar estado</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => eliminar(i.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar estado de inscripción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {inscripcionEditando && (
            <>
              <p><b>{inscripcionEditando.socio?.nombre} {inscripcionEditando.socio?.apellido}</b> — {inscripcionEditando.actividad?.nombre}</p>
              <Form.Group className="mt-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select value={estado} onChange={e => setEstado(e.target.value)}>
                  <option>Pendiente</option>
                  <option>Confirmada</option>
                  <option>Cancelada</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={guardarEstado}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Inscripciones