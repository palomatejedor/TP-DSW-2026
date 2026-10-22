import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Modal, Form, Badge } from 'react-bootstrap'
import { api } from '../api'

function Actividades() {
  const [actividades, setActividades] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [actividadEditando, setActividadEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', dias: '', horario_desde: '', horario_hasta: '', cupo_maximo: '', edad_minima: '', edad_maxima: '', estado: 'Activo' })
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
    if (!form.horario_desde) e.horario_desde = 'El horario de inicio es obligatorio'
    if (!form.horario_hasta) e.horario_hasta = 'El horario de fin es obligatorio'
    if (form.horario_desde && form.horario_hasta && form.horario_hasta <= form.horario_desde) {
      e.horario_hasta = 'Debe ser posterior al horario de inicio'
    }
    if (!form.cupo_maximo || isNaN(form.cupo_maximo) || form.cupo_maximo <= 0) e.cupo_maximo = 'El cupo debe ser un número mayor a 0'
    const tieneMin = form.edad_minima !== '' && form.edad_minima !== null && form.edad_minima !== undefined
    const tieneMax = form.edad_maxima !== '' && form.edad_maxima !== null && form.edad_maxima !== undefined
    if (tieneMin && (!/^\d+$/.test(String(form.edad_minima)) || Number(form.edad_minima) > 120)) {
      e.edad_minima = 'Ingresá una edad entre 0 y 120'
    }
    if (tieneMax && (!/^\d+$/.test(String(form.edad_maxima)) || Number(form.edad_maxima) > 120)) {
      e.edad_maxima = 'Ingresá una edad entre 0 y 120'
    } else if (tieneMax && Number(form.edad_maxima) < (tieneMin ? Number(form.edad_minima) : 0)) {
      e.edad_maxima = 'La edad máxima no puede ser menor que la mínima'
    }
    return e
  }

  const abrirModalNuevo = () => {
    setActividadEditando(null)
    setForm({ nombre: '', descripcion: '', dias: '', horario_desde: '', horario_hasta: '', cupo_maximo: '', edad_minima: '', edad_maxima: '', estado: 'Activo' })
    setErrores({})
    setShowModal(true)
  }

  const abrirModalEditar = (actividad) => {
    setActividadEditando(actividad)
    setForm({
      ...actividad,
      horario_desde: actividad.horario_desde ? actividad.horario_desde.slice(0, 5) : '',
      horario_hasta: actividad.horario_hasta ? actividad.horario_hasta.slice(0, 5) : '',
      edad_minima: actividad.edad_minima ?? '',
      edad_maxima: actividad.edad_maxima ?? '',
    })
    setErrores({})
    setShowModal(true)
  }

  const guardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }
    // Vacío en la mínima = 0 (desde cualquier edad); vacío en la máxima = sin límite
    const datos = {
      ...form,
      edad_minima: form.edad_minima === '' || form.edad_minima === null ? 0 : Number(form.edad_minima),
      edad_maxima: form.edad_maxima === '' || form.edad_maxima === null ? null : Number(form.edad_maxima),
    }
    if (actividadEditando) {
      await api.updateActividad(actividadEditando.id, datos)
    } else {
      await api.createActividad(datos)
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

  const formatHora = (h) => h ? h.slice(0, 5) : '-'

  const formatEdades = (a) => {
    const min = a.edad_minima || 0
    if (a.edad_maxima == null) return min > 0 ? `Desde ${min} años` : 'Todas las edades'
    return `${min} a ${a.edad_maxima} años`
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
              <th>Nombre</th><th>Descripción</th><th>Días</th><th>Horario</th><th>Edades</th><th>Cupo máximo</th><th>Inscriptos</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map(a => {
              const ocupado = a.cupo_ocupado || 0
              const lleno = ocupado >= a.cupo_maximo
              return (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>{a.descripcion}</td>
                  <td>{a.dias}</td>
                  <td>{formatHora(a.horario_desde)} - {formatHora(a.horario_hasta)}</td>
                  <td>{formatEdades(a)}</td>
                  <td>{a.cupo_maximo}</td>
                  <td>
                    <Badge bg={lleno ? 'danger' : 'secondary'}>
                      {ocupado} {lleno ? '(lleno)' : ''}
                    </Badge>
                  </td>
                  <td><Badge bg={a.estado === 'Activo' ? 'success' : 'secondary'}>{a.estado}</Badge></td>
                  <td>
                    <Button size="sm" variant="outline-dark" className="me-2" onClick={() => abrirModalEditar(a)}>Editar</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => eliminar(a.id)}>Eliminar</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
        <p className="text-muted small">
          <b>Estado:</b> "Activo" significa que la actividad se muestra a los socios y admite inscripciones nuevas.
          "Inactivo" la oculta del panel de socios (no aparece para inscribirse), pero conserva el historial de quienes ya estaban inscriptos.
        </p>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{actividadEditando ? 'Editar actividad' : 'Nueva actividad'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {[['nombre', 'Nombre'], ['descripcion', 'Descripción'], ['dias', 'Días']].map(([campo, label]) => (
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
            <div className="d-flex gap-2">
              <Form.Group className="mb-3 flex-fill">
                <Form.Label>Horario desde</Form.Label>
                <Form.Control
                  type="time"
                  value={form.horario_desde}
                  onChange={e => setForm({ ...form, horario_desde: e.target.value })}
                  isInvalid={!!errores.horario_desde}
                />
                <Form.Control.Feedback type="invalid">{errores.horario_desde}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3 flex-fill">
                <Form.Label>Horario hasta</Form.Label>
                <Form.Control
                  type="time"
                  value={form.horario_hasta}
                  onChange={e => setForm({ ...form, horario_hasta: e.target.value })}
                  isInvalid={!!errores.horario_hasta}
                />
                <Form.Control.Feedback type="invalid">{errores.horario_hasta}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="d-flex gap-2">
              <Form.Group className="mb-3 flex-fill">
                <Form.Label>Edad mínima</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Sin mínimo"
                  value={form.edad_minima}
                  onChange={e => setForm({ ...form, edad_minima: e.target.value })}
                  isInvalid={!!errores.edad_minima}
                />
                <Form.Control.Feedback type="invalid">{errores.edad_minima}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3 flex-fill">
                <Form.Label>Edad máxima</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Sin máximo"
                  value={form.edad_maxima}
                  onChange={e => setForm({ ...form, edad_maxima: e.target.value })}
                  isInvalid={!!errores.edad_maxima}
                />
                <Form.Control.Feedback type="invalid">{errores.edad_maxima}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="text-muted small mb-3" style={{ marginTop: -8 }}>
              Edades en años cumplidos. Dejá en blanco lo que no tenga límite (por ejemplo, mini básquet: de 6 a 10).
            </div>
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
              <div className="text-muted small mt-1">
                Activo: visible para los socios, admite inscripciones. Inactivo: se oculta del panel de socios, pero no se borran las inscripciones existentes.
              </div>
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