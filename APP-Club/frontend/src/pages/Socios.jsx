import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Modal, Form, Badge, Row, Col, Pagination, Alert } from 'react-bootstrap'
import { api } from '../api'

function calcularCategoria(fechaNacimiento) {
  if (!fechaNacimiento) return ''
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--

  if (edad <= 12) return 'Infantil'
  if (edad <= 17) return 'Adolescente'
  if (edad <= 64) return 'Adulto'
  return 'Tercera edad'
}

const esMenor = (categoria) => categoria === 'Infantil' || categoria === 'Adolescente'

function Socios() {
  const [socios, setSocios] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showBajaModal, setShowBajaModal] = useState(false)
  const [socioEditando, setSocioEditando] = useState(null)
  const [socioBaja, setSocioBaja] = useState(null)
  const [fechaBaja, setFechaBaja] = useState('')
  const [form, setForm] = useState({ dni: '', nombre: '', apellido: '', mail: '', categoria: '', estado: 'Activo', fecha_nacimiento: '', fecha_baja: null })
  const [errores, setErrores] = useState({})

  const [showGrupoModal, setShowGrupoModal] = useState(false)
  const [grupoAfectado, setGrupoAfectado] = useState(null)
  const [nuevoTitularId, setNuevoTitularId] = useState('')
  const [errorGrupo, setErrorGrupo] = useState('')

  const [filtros, setFiltros] = useState({ nombre: '', apellido: '', dni: '', estado: '', categoria: '' })
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      cargarSocios(1)
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  useEffect(() => {
    cargarSocios(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const cargarSocios = async (pageActual = page) => {
    const params = { page: pageActual, limit, ...filtros }
    Object.keys(params).forEach(k => { if (params[k] === '') delete params[k] })
    const res = await api.getSocios(params)
    setSocios(res.data)
    setTotalPages(res.pagination.totalPages)
    setTotal(res.pagination.total)
  }

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', apellido: '', dni: '', estado: '', categoria: '' })
  }

  const validar = () => {
    const e = {}
    if (!form.dni || !/^\d{7,8}$/.test(String(form.dni))) {
      e.dni = 'El DNI debe tener 7 u 8 dígitos numéricos'
    } else {
      const dniDuplicado = socios.some(s => String(s.dni) === String(form.dni) && s.id !== socioEditando?.id)
      if (dniDuplicado) e.dni = 'Ya existe un socio con ese DNI'
    }
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'

    const mailObligatorio = !esMenor(form.categoria)
    if (mailObligatorio && !form.mail.trim()) {
      e.mail = 'El mail es obligatorio para socios mayores de edad'
    } else if (form.mail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail)) {
      e.mail = 'El formato del mail es inválido'
    } else if (form.mail.trim()) {
      const mailDuplicado = socios.some(s => s.mail === form.mail && s.id !== socioEditando?.id)
      if (mailDuplicado) e.mail = 'Ya existe un socio con ese mail'
    }

    if (!form.fecha_nacimiento) {
      e.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
    } else {
      const hoy = new Date()
      const nacimiento = new Date(form.fecha_nacimiento)
      if (nacimiento >= hoy) e.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
      const edad = hoy.getFullYear() - nacimiento.getFullYear()
      if (edad > 120) e.fecha_nacimiento = 'La fecha de nacimiento no es válida'
    }

    return e
  }

  const abrirModalNuevo = () => {
    setSocioEditando(null)
    setForm({ dni: '', nombre: '', apellido: '', mail: '', categoria: '', estado: 'Activo', fecha_nacimiento: '', fecha_baja: null })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalEditar = (socio) => {
    setSocioEditando(socio)
    setForm({
      ...socio,
      fecha_nacimiento: socio.fecha_nacimiento ? socio.fecha_nacimiento.toString().split('T')[0] : '',
      fecha_alta: socio.fecha_alta ? socio.fecha_alta.toString().split('T')[0] : '',
      fecha_baja: socio.fecha_baja ? socio.fecha_baja.toString().split('T')[0] : null,
      mail: socio.mail || '',
    })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalBaja = async (socio) => {
    const familia = await api.getFamilia(socio.id)
    if (!familia.error && familia.titular.id === socio.id && familia.miembros.length > 0) {
      setGrupoAfectado(familia)
      setNuevoTitularId('')
      setErrorGrupo('')
      setSocioBaja(socio)
      setShowGrupoModal(true)
      return
    }
    setSocioBaja(socio)
    setFechaBaja(new Date().toISOString().split('T')[0])
    setShowBajaModal(true)
  }

  const candidatosNuevoTitular = () => {
    if (!grupoAfectado) return []
    return grupoAfectado.miembros.filter(m => m.categoria === 'Adulto' || m.categoria === 'Tercera edad')
  }

  const continuarConNuevoTitular = async () => {
    if (!nuevoTitularId) return
    setErrorGrupo('')
    const elegidoId = parseInt(nuevoTitularId)

    const r1 = await api.updateSocio(elegidoId, { titular: null })
    if (r1.error) { setErrorGrupo(r1.error); return }

    for (const m of grupoAfectado.miembros) {
      if (m.id !== elegidoId) {
        const r = await api.updateSocio(m.id, { titular: { id: elegidoId } })
        if (r.error) { setErrorGrupo(`${m.nombre} ${m.apellido}: ${r.error}`); return }
      }
    }

    setShowGrupoModal(false)
    setFechaBaja(new Date().toISOString().split('T')[0])
    setShowBajaModal(true)
  }

  const continuarDeshaciendoGrupo = async () => {
    setErrorGrupo('')
    for (const m of grupoAfectado.miembros) {
      const r = await api.updateSocio(m.id, { titular: null })
      if (r.error) { setErrorGrupo(`${m.nombre} ${m.apellido}: ${r.error}`); return }
    }
    setShowGrupoModal(false)
    setFechaBaja(new Date().toISOString().split('T')[0])
    setShowBajaModal(true)
  }

  const guardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }

    const payload = { ...form }
    if (!payload.mail) payload.mail = null

    if (socioEditando) {
      await api.updateSocio(socioEditando.id, payload)
    } else {
      await api.createSocio({ ...payload, fecha_alta: new Date().toISOString().split('T')[0] })
    }
    await cargarSocios(page)
    setShowModal(false)
  }

  const confirmarBaja = async () => {
    if (!fechaBaja) return
    await api.updateSocio(socioBaja.id, { estado: 'Inactivo', fecha_baja: fechaBaja })
    await cargarSocios(page)
    setShowBajaModal(false)
  }

  const eliminar = async (id) => {
    if (confirm('¿Seguro que querés eliminar este socio?')) {
      await api.deleteSocio(id)
      await cargarSocios(page)
    }
  }

  const renderPaginacion = () => {
    if (totalPages <= 1) return null
    const items = []
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
          {i}
        </Pagination.Item>
      )
    }
    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => p - 1)} />
        {items}
        <Pagination.Next disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
      </Pagination>
    )
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Socios</h4>
          <Button variant="dark" onClick={abrirModalNuevo}>+ Nuevo socio</Button>
        </div>

        <div className="bg-light rounded p-3 mb-3">
          <Row className="g-2">
            <Col md={2}>
              <Form.Control
                placeholder="Nombre"
                value={filtros.nombre}
                onChange={e => handleFiltroChange('nombre', e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                placeholder="Apellido"
                value={filtros.apellido}
                onChange={e => handleFiltroChange('apellido', e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                placeholder="DNI"
                value={filtros.dni}
                onChange={e => handleFiltroChange('dni', e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Form.Select value={filtros.estado} onChange={e => handleFiltroChange('estado', e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={filtros.categoria} onChange={e => handleFiltroChange('categoria', e.target.value)}>
                <option value="">Todas las categorías</option>
                <option value="Infantil">Infantil</option>
                <option value="Adolescente">Adolescente</option>
                <option value="Adulto">Adulto</option>
                <option value="Tercera edad">Tercera edad</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </Col>
          </Row>
        </div>

        <p className="text-muted small mb-2">{total} socio{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>

        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>DNI</th><th>Nombre</th><th>Apellido</th><th>Mail</th><th>Categoría</th><th>Plan</th><th>Familia</th><th>Estado</th><th>Fecha baja</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {socios.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-muted py-4">No se encontraron socios</td>
              </tr>
            )}
            {socios.map(s => (
              <tr key={s.id}>
                <td>{s.dni}</td>
                <td>{s.nombre}</td>
                <td>{s.apellido}</td>
                <td>{s.mail || <span className="text-muted">-</span>}</td>
                <td>{s.categoria}</td>
                <td>{s.plan ? s.plan.nombre : <span className="text-muted">Sin plan</span>}</td>
                <td>
                  {s.titular
                    ? <Badge bg="info">Miembro de {s.titular.nombre} {s.titular.apellido}</Badge>
                    : <span className="text-muted">-</span>}
                </td>
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

        {renderPaginacion()}
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
              <Form.Label>
                Mail {esMenor(form.categoria) && <span className="text-muted small">(opcional para menores de edad)</span>}
              </Form.Label>
              <Form.Control type="email" value={form.mail} onChange={e => setForm({ ...form, mail: e.target.value })} isInvalid={!!errores.mail} />
              <Form.Control.Feedback type="invalid">{errores.mail}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de nacimiento</Form.Label>
              <Form.Control type="date" value={form.fecha_nacimiento} onChange={e => setForm(prev => ({ ...prev, fecha_nacimiento: e.target.value, categoria: calcularCategoria(e.target.value) }))} isInvalid={!!errores.fecha_nacimiento} />
              <Form.Control.Feedback type="invalid">{errores.fecha_nacimiento}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría (calculada automáticamente según la fecha de nacimiento)</Form.Label>
              <Form.Control value={form.categoria || '—'} disabled readOnly />
            </Form.Group>
            {socioEditando && (
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={guardar}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showGrupoModal} onHide={() => setShowGrupoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Grupo familiar afectado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorGrupo && <Alert variant="danger" className="py-2">{errorGrupo}</Alert>}
          {grupoAfectado && (
            <>
              <Alert variant="warning">
                <b>{socioBaja?.nombre} {socioBaja?.apellido}</b> es titular de un grupo familiar con {grupoAfectado.miembros.length} integrante{grupoAfectado.miembros.length !== 1 ? 's' : ''}.
                Antes de dar la baja, elegí qué hacer con el resto del grupo.
              </Alert>

              {candidatosNuevoTitular().length > 0 ? (
                <Form.Group className="mb-3">
                  <Form.Label>Opción 1: asignar un nuevo titular</Form.Label>
                  <Form.Select value={nuevoTitularId} onChange={e => setNuevoTitularId(e.target.value)}>
                    <option value="">Elegí quién pasa a ser el nuevo titular...</option>
                    {candidatosNuevoTitular().map(m => (
                      <option key={m.id} value={m.id}>{m.nombre} {m.apellido} ({m.categoria})</option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="dark"
                    className="w-100 mt-2"
                    disabled={!nuevoTitularId}
                    onClick={continuarConNuevoTitular}
                  >
                    Confirmar y mantener el grupo
                  </Button>
                </Form.Group>
              ) : (
                <p className="text-muted small">No hay ningún integrante mayor de edad disponible para ser el nuevo titular.</p>
              )}

              <hr />

              <p className="mb-2">Opción 2: no asignar un nuevo titular</p>
              <p className="text-muted small">
                El grupo familiar se deshace: los {grupoAfectado.miembros.length} integrantes quedan como socios independientes, activos, cada uno con su propio plan.
              </p>
              <Button variant="outline-danger" className="w-100" onClick={continuarDeshaciendoGrupo}>
                Deshacer el grupo y continuar con la baja
              </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGrupoModal(false)}>Cancelar todo</Button>
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