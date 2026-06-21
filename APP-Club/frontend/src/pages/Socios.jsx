import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Modal, Form, Badge } from 'react-bootstrap'
import { api } from '../api'

function Socios() {
  const [socios, setSocios] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showBajaModal, setShowBajaModal] = useState(false)
  const [socioEditando, setSocioEditando] = useState(null)
  const [socioBaja, setSocioBaja] = useState(null)
  const [fechaBaja, setFechaBaja] = useState('')
  const [form, setForm] = useState({ dni: '', nombre: '', apellido: '', mail: '', categoria: 'Adulto', estado: 'Activo', fecha_alta: '', fecha_baja: null })
  const [errores, setErrores] = useState({})

  useEffect(() => {
    cargarSocios()
  }, [])

  const cargarSocios = async () => {
    const data = await api.getSocios()
    setSocios(data)
  }

  const validar = () => {
    const e = {}
    if (!form.dni || isNaN(form.dni) || String(form.dni).length < 7) e.dni = 'DNI inválido'
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
    if (!form.mail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail)) e.mail = 'Email inválido'
    if (!form.fecha_alta) e.fecha_alta = 'La fecha de alta es obligatoria'
    return e
  }

  const abrirModalNuevo = () => {
    setSocioEditando(null)
    setForm({ dni: '', nombre: '', apellido: '', mail: '', categoria: 'Adulto', estado: 'Activo', fecha_alta: '', fecha_baja: null })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalEditar = (socio) => {
    setSocioEditando(socio)
    setForm({ ...socio })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalBaja = (socio) => {
    setSocioBaja(socio)
    setFechaBaja(new Date().toISOString().split('T')[0])
    setShowBajaModal(true)
  }

  const guardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }
    if (socioEditando) {
      await api.updateSocio(socioEditando.id, form)
    } else {
      await api.createSocio(form)
    }
    await cargarSocios()
    setShowModal(false)
  }

  const confirmarBaja = async () => {
    if (!fechaBaja) return
    await api.updateSocio(socioBaja.id, { ...socioBaja, estado: 'Inactivo', fecha_baja: fechaBaja })
    await cargarSocios()
    setShowBajaModal(false)
  }

  const eliminar = async (id) => {
    if (confirm('¿Seguro que querés eliminar este socio?')) {
      await api.deleteSocio(id)
      await cargarSocios()
    }
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Socios</h4>
          <Button variant="dark" onClick={abrirModalNuevo}>+ Nuevo socio</Button>
        </div>
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
            <th>DNI</th><th>Nombre</th><th>Apellido</th><th>Mail</th><th>Categoría</th><th>Plan</th><th>Estado</th><th>Fecha baja</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {socios.map(s => (
              <tr key={s.id}>
               <td>{s.dni}</td>
                <td>{s.nombre}</td>
                <td>{s.apellido}</td>
                <td>{s.mail}</td>
                <td>{s.categoria}</td>
                <td>{s.plan ? s.plan.nombre : <span className="text-muted">Sin plan</span>}</td>
                <td><Badge bg={s.estado === 'Activo' ? 'success' : 'secondary'}>{s.estado}</Badge></td>
                <td>{s.fecha_baja ? new Date(s.fecha_baja).toLocaleDateString('es-AR') : '-'}</td>
                <td>
                  <Button size="sm" variant="outline-dark" className="me-1" onClick={() => abrirModalEditar(s)}>Editar</Button>
                  {s.estado === 'Activo' && (
                    <Button size="sm" variant="outline-warning" className="me-1" onClick={() => abrirModalBaja(s)}>Dar de baja</Button>
                  )}
                  <Button size="sm" variant="outline-danger" onClick={() => eliminar(s.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{socioEditando ? 'Editar socio' : 'Nuevo socio'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>DNI</Form.Label>
              <Form.Control type="number" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} isInvalid={!!errores.dni} />
              <Form.Control.Feedback type="invalid">{errores.dni}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} isInvalid={!!errores.nombre} />
              <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} isInvalid={!!errores.apellido} />
              <Form.Control.Feedback type="invalid">{errores.apellido}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mail</Form.Label>
              <Form.Control type="email" value={form.mail} onChange={e => setForm({ ...form, mail: e.target.value })} isInvalid={!!errores.mail} />
              <Form.Control.Feedback type="invalid">{errores.mail}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option>Adulto</option>
                <option>Adolescente</option>
                <option>Infantil</option>
                <option>Tercera edad</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option>Activo</option>
                <option>Inactivo</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de alta</Form.Label>
              <Form.Control type="date" value={form.fecha_alta} onChange={e => setForm({ ...form, fecha_alta: e.target.value })} isInvalid={!!errores.fecha_alta} />
              <Form.Control.Feedback type="invalid">{errores.fecha_alta}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={guardar}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBajaModal} onHide={() => setShowBajaModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Dar de baja socio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {socioBaja && (
            <>
              <p>¿Confirmás la baja de <b>{socioBaja.nombre} {socioBaja.apellido}</b>?</p>
              <Form.Group className="mt-3">
                <Form.Label>Fecha de baja</Form.Label>
                <Form.Control type="date" value={fechaBaja} onChange={e => setFechaBaja(e.target.value)} />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBajaModal(false)}>Cancelar</Button>
          <Button variant="warning" onClick={confirmarBaja}>Confirmar baja</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Socios