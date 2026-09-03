import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Button, Modal, Form, Badge, Card, Row, Col, Alert } from 'react-bootstrap'
import { api } from '../api'

function GrupoFamiliar() {
  const [todos, setTodos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [titularId, setTitularId] = useState('')
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState([])
  const [errorGeneral, setErrorGeneral] = useState('')

  useEffect(() => {
    cargarTodo()
  }, [])

  const cargarTodo = async () => {
    const res = await api.getSocios({ limit: 1000 })
    const lista = res.data
    setTodos(lista)

    const mapa = {}
    lista.forEach(s => {
      if (s.titular) {
        if (!mapa[s.titular.id]) mapa[s.titular.id] = { titular: s.titular, miembros: [] }
        mapa[s.titular.id].miembros.push(s)
      }
    })
    setGrupos(Object.values(mapa))
  }

  const titularesCandidatos = () => {
    const idsConGrupo = new Set(grupos.map(g => g.titular.id))
    return todos.filter(s =>
      (s.categoria === 'Adulto' || s.categoria === 'Tercera edad') &&
      !s.titular &&
      !idsConGrupo.has(s.id)
    )
  }

  const miembrosCandidatos = () => {
    if (!titularId) return []
    return todos.filter(s => s.id !== parseInt(titularId) && !s.titular)
  }

  const abrirModalNuevo = () => {
    setModoEdicion(false)
    setTitularId('')
    setMiembrosSeleccionados([])
    setErrorGeneral('')
    setShowModal(true)
  }

  const abrirModalGestionar = (grupo) => {
    setModoEdicion(true)
    setTitularId(String(grupo.titular.id))
    setMiembrosSeleccionados(grupo.miembros.map(m => m.id))
    setErrorGeneral('')
    setShowModal(true)
  }

  const toggleMiembro = (id) => {
    setMiembrosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const apellidoDelTitular = () => {
    const t = todos.find(s => s.id === parseInt(titularId))
    return t ? t.apellido : ''
  }

  const guardarGrupo = async () => {
    setErrorGeneral('')
    if (!titularId) {
      setErrorGeneral('Elegí un titular para el grupo')
      return
    }

    const titular = todos.find(s => s.id === parseInt(titularId))
    const planTitular = titular?.plan ? { id: titular.plan.id } : null

    const grupoActual = grupos.find(g => g.titular.id === parseInt(titularId))
    const idsActuales = grupoActual ? grupoActual.miembros.map(m => m.id) : []

    const aAgregar = miembrosSeleccionados.filter(id => !idsActuales.includes(id))
    const aQuitar = idsActuales.filter(id => !miembrosSeleccionados.includes(id))

    for (const id of aAgregar) {
      const socio = todos.find(s => s.id === id)
      const resultado = await api.updateSocio(id, {
        titular: { id: parseInt(titularId) },
        plan: planTitular,
      })
      if (resultado.error) {
        setErrorGeneral(`${socio.nombre} ${socio.apellido}: ${resultado.error}`)
        await cargarTodo()
        return
      }
    }

    for (const id of aQuitar) {
      const socio = todos.find(s => s.id === id)
      const resultado = await api.updateSocio(id, { titular: null })
      if (resultado.error) {
        setErrorGeneral(`${socio.nombre} ${socio.apellido}: ${resultado.error}`)
        await cargarTodo()
        return
      }
    }

    await cargarTodo()
    setShowModal(false)
  }

  const quitarDelGrupo = async (socio) => {
    if (!confirm(`¿Sacar a ${socio.nombre} ${socio.apellido} del grupo familiar?`)) return
    const resultado = await api.updateSocio(socio.id, { titular: null })
    if (resultado.error) {
      alert(resultado.error)
    }
    await cargarTodo()
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-1">Grupo Familiar</h4>
            <p className="text-muted mb-0">Agrupá socios existentes bajo un titular. Todos comparten el mismo plan.</p>
          </div>
          <Button variant="dark" onClick={abrirModalNuevo}>+ Nuevo grupo familiar</Button>
        </div>

        {grupos.length === 0 && (
          <p className="text-muted mt-4">Todavía no hay grupos familiares armados.</p>
        )}

        <Row className="g-3 mt-1">
          {grupos.map(g => (
            <Col md={6} key={g.titular.id}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <Badge bg="dark" className="mb-1">Titular</Badge>
                      <Card.Title className="fw-bold mb-0">{g.titular.nombre} {g.titular.apellido}</Card.Title>
                      <div className="text-muted small">DNI {g.titular.dni} · Plan: {g.titular.plan ? g.titular.plan.nombre : 'Sin plan'}</div>
                    </div>
                    <Badge bg={g.miembros.length + 1 >= 5 ? 'danger' : 'secondary'}>
                      {g.miembros.length + 1} / 5
                    </Badge>
                  </div>

                  <hr />

                  {g.miembros.length === 0 && <p className="text-muted small">Sin integrantes todavía.</p>}
                  {g.miembros.map(m => (
                    <div key={m.id} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{m.nombre} {m.apellido} <span className="text-muted small">({m.categoria})</span></span>
                      <Button size="sm" variant="outline-danger" onClick={() => quitarDelGrupo(m)}>Quitar</Button>
                    </div>
                  ))}

                  <Button size="sm" variant="outline-dark" className="mt-2" onClick={() => abrirModalGestionar(g)}>
                    Gestionar grupo
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? 'Gestionar grupo familiar' : 'Nuevo grupo familiar'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorGeneral && <Alert variant="danger" className="py-2">{errorGeneral}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Titular del grupo</Form.Label>
            <Form.Select
              value={titularId}
              onChange={e => { setTitularId(e.target.value); setMiembrosSeleccionados([]) }}
              disabled={modoEdicion}
            >
              <option value="">Elegí el titular...</option>
              {(modoEdicion ? todos.filter(s => String(s.id) === titularId) : titularesCandidatos()).map(t => (
                <option key={t.id} value={t.id}>
                  {t.apellido}, {t.nombre} (DNI {t.dni})
                </option>
              ))}
            </Form.Select>
            <div className="text-muted small mt-1">Solo adultos o de tercera edad que no sean ya titulares de otro grupo.</div>
          </Form.Group>

          {titularId && (
            <Form.Group className="mb-3">
              <Form.Label>
                Integrantes ({miembrosSeleccionados.length + 1} / 5 con el titular)
              </Form.Label>
              <div style={{ maxHeight: '260px', overflowY: 'auto' }} className="border rounded p-2">
                {miembrosCandidatos().length === 0 && (
                  <p className="text-muted small mb-0">No hay socios disponibles para agregar (deben no pertenecer ya a otro grupo).</p>
                )}
                {miembrosCandidatos().map(s => {
                  const coincideApellido = s.apellido?.trim().toLowerCase() === apellidoDelTitular()?.trim().toLowerCase()
                  const yaSeleccionado = miembrosSeleccionados.includes(s.id)
                  const sinLugar = !yaSeleccionado && miembrosSeleccionados.length >= 4
                  return (
                    <Form.Check
                      key={s.id}
                      type="checkbox"
                      className="mb-1"
                      disabled={sinLugar}
                      checked={yaSeleccionado}
                      onChange={() => toggleMiembro(s.id)}
                      label={
                        <span>
                          {s.nombre} {s.apellido} <span className="text-muted small">({s.categoria}, DNI {s.dni})</span>
                          {!coincideApellido && <span className="text-warning small"> · apellido distinto al del titular</span>}
                        </span>
                      }
                    />
                  )
                })}
              </div>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={guardarGrupo}>Guardar grupo</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default GrupoFamiliar