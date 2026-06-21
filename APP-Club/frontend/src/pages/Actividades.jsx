import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Modal, Form, Badge } from 'react-bootstrap'
import { api } from '../api'

function Actividades() {
  const [actividades, setActividades] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [actividadEditando, setActividadEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', dias: '', horario: '', cupo_maximo: '', estado: 'Activo' })
  const [errores, setErrores] = useState({})

  useEffect(() => {
    cargarActividades()
  }, [])

  const cargarActividades = async () => {
    const data = await api.getActividades()
    setActividades(data)
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria'
    if (!form.dias.trim()) e.dias = 'Los días son obligatorios'
    if (!form.horario.trim()) e.horario = 'El horario es obligatorio'
    if (!form.cupo_maximo || isNaN(form.cupo_maximo) || form.cupo_maximo <= 0) e.cupo_maximo = 'El cupo debe ser un número mayor a 0'
    return e
  }

  const abrirModalNuevo = () => {
    setActividadEditando(null)
    setForm({ nombre: '', descripcion: '', dias: '', horario: '', cupo_maximo: '', estado: 'Activo' })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalEditar = (actividad) => {
    setActividadEditando(actividad)
    setForm({ ...actividad })
    setErrores({})
    setShowModal(true)
  }

  const guardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }
    if (actividadEditando) {
      await api.updateActividad(actividadEditando.id, form)
    } else {
      await api.createActividad(form)
    }
    await cargarActividades()
    setShowModal(false)
  }

  const eliminar = async (id) => {
    if (confirm('¿Seguro que querés eliminar esta actividad?')) {
      await api.deleteActividad(id)
      await cargarActividades()
    }
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Actividades</h4>
          <Button variant="dark" onClick={abrirModalNuevo}>+ Nueva actividad</Button>
        </div>
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th><th>Descripción</th><th>Días</th><th>Horario</th><th>Cupo máximo</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map(a => (
              <tr key={a.id}>
                <td>{a.nombre}</td><td>{a.descripcion}</td><td>{a.dias}</td><td>{a.horario}</td><td>{a.cupo_maximo}</td>
                <td><Badge bg={a.estado === 'Activo' ? 'success' : 'secondary'}>{a.estado}</Badge></td>
                <td>
                  <Button size="sm" variant="outline-dark" className="me-2" onClick={() => abrirModalEditar(a)}>Editar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => eliminar(a.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{actividadEditando ? 'Editar actividad' : 'Nueva actividad'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {[['nombre', 'Nombre'], ['descripcion', 'Descripción'], ['dias', 'Días'], ['horario', 'Horario']].map(([campo, label]) => (
              <Form.Group className="mb-3" key={campo}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  value={form[campo]}
                  onChange={e => setForm({ ...form, [campo]: e.target.value })}
                  isInvalid={!!errores[campo]}
                />
                <Form.Control.Feedback type="invalid">{errores[campo]}</Form.Control.Feedback>
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Cupo máximo</Form.Label>
              <Form.Control
                type="number"
                value={form.cupo_maximo}
                onChange={e => setForm({ ...form, cupo_maximo: e.target.value })}
                isInvalid={!!errores.cupo_maximo}
              />
              <Form.Control.Feedback type="invalid">{errores.cupo_maximo}</Form.Control.Feedback>
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

export default Actividades