import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap'
import { api } from '../api'

const VACIO = { nombre: '', apellido: '', mail: '', contraseña: '' }

function Administradores() {
  const [admins, setAdmins] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  let miId = null
  try {
    miId = JSON.parse(localStorage.getItem('usuario') || 'null')?.id
  } catch { /* sin sesión */ }

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const data = await api.getAdmins()
      if (!Array.isArray(data)) throw new Error()
      setAdmins(data)
    } catch {
      setError('No se pudieron cargar los administradores.')
    }
  }

  const abrirModal = () => {
    setForm(VACIO)
    setErrores({})
    setShowModal(true)
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
    if (!form.mail.trim()) e.mail = 'El mail es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail)) e.mail = 'El formato del mail es inválido'
    if (!form.contraseña) e.contraseña = 'La contraseña temporal es obligatoria'
    else if (form.contraseña.length < 6) e.contraseña = 'Debe tener al menos 6 caracteres'
    return e
  }

  const guardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }
    const resp = await api.crearAdmin(form)
    if (resp.error) { setErrores({ mail: resp.error }); return }
    setShowModal(false)
    setExito(`Administrador ${form.nombre} ${form.apellido} creado. Va a tener que elegir su propia contraseña al ingresar.`)
    setTimeout(() => setExito(''), 6000)
    await cargar()
  }

  const eliminar = async (a) => {
    if (!confirm(`¿Seguro que querés eliminar al administrador ${a.nombre} ${a.apellido}?`)) return
    const resp = await api.eliminarAdmin(a.id, miId)
    if (resp.error) { setError(resp.error); return }
    setError('')
    await cargar()
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4 pb-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <h4 className="fw-bold mb-1">Administradores</h4>
            <p className="text-muted mb-0">Cuentas con acceso a la gestión del club.</p>
          </div>
          <Button variant="dark" onClick={abrirModal}>+ Nuevo administrador</Button>
        </div>

        {exito && <Alert variant="success">{exito}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <Table bordered hover responsive>
          <thead className="table-dark">
            <tr><th>Nombre</th><th>Mail</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id}>
                <td style={{ textTransform: 'capitalize' }}>
                  {a.nombre} {a.apellido} {a.id === miId && <Badge bg="primary" className="ms-1">Vos</Badge>}
                </td>
                <td>{a.mail}</td>
                <td>
                  {a.debe_cambiar_clave
                    ? <Badge bg="warning" text="dark">Contraseña temporal</Badge>
                    : <Badge bg="success">Activo</Badge>}
                </td>
                <td>
                  {a.id === miId ? (
                    <span className="text-muted small">No podés eliminar tu cuenta</span>
                  ) : (
                    <Button size="sm" variant="outline-danger" onClick={() => eliminar(a)}>Eliminar</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo administrador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
            <Form.Group className="mb-1">
              <Form.Label>Contraseña temporal</Form.Label>
              <Form.Control type="text" value={form.contraseña} onChange={e => setForm({ ...form, contraseña: e.target.value })} isInvalid={!!errores.contraseña} />
              <Form.Control.Feedback type="invalid">{errores.contraseña}</Form.Control.Feedback>
              <Form.Text className="text-muted">
                Pasásela a la persona. La primera vez que ingrese, el sistema le va a pedir que elija una propia.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={guardar}>Crear administrador</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Administradores