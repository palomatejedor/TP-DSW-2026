import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Row, Col, Card, Badge, Button, Modal, Alert, Spinner, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

function ActividadesSocio() {
  const navigate = useNavigate()
  const [planTitular, setPlanTitular] = useState(null) // plan del titular, para los integrantes de un grupo
  const [actividades, setActividades] = useState([])
  const [inscripciones, setInscripciones] = useState([]) // [{ inscripcionId, actividadId, socioId, socioNombre }]
  const [personas, setPersonas] = useState([]) // socios que este usuario puede gestionar (yo, o yo+familia si soy titular)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorAccion, setErrorAccion] = useState('') // error al inscribir (no reemplaza toda la pantalla)

  const [showModal, setShowModal] = useState(false)
  const [showBajaModal, setShowBajaModal] = useState(false)
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null)
  const [personaElegidaId, setPersonaElegidaId] = useState('')
  const [inscripcionABaja, setInscripcionABaja] = useState(null)
  const [exito, setExito] = useState('')

  useEffect(() => {
    iniciar()
  }, [])

  const iniciar = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
    if (!usuario?.mail) {
      setError('No se encontró la sesión. Volvé a iniciar sesión.')
      setCargando(false)
      return
    }
    try {
      const yo = await api.getSocioByMail(usuario.mail)
      if (yo.error) {
        setError('No se encontraron datos de socio para este usuario.')
        setCargando(false)
        return
      }

      // Si soy titular de una familia, puedo gestionar a todos. Si no, solo a mí mismo.
      let listaPersonas = [yo]
      const familia = await api.getFamilia(yo.id)
      if (!familia.error && familia.titular.id === yo.id) {
        listaPersonas = [familia.titular, ...familia.miembros]
      }
      setPlanTitular(familia.error ? null : (familia.titular?.plan || null))
      setPersonas(listaPersonas)
      await cargarDatos(listaPersonas)
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const cargarDatos = async (listaPersonas) => {
    const idsGestionables = listaPersonas.map(p => p.id)
    const [acts, ins] = await Promise.all([
      api.getActividades(),
      api.getInscripciones()
    ])
    setActividades(acts.filter(a => a.estado === 'Activo'))
    setInscripciones(
      ins
        .filter(i => idsGestionables.includes(i.socio?.id) && i.estado !== 'Baja')
        .map(i => ({
          inscripcionId: i.id,
          actividadId: i.actividad?.id,
          socioId: i.socio?.id,
          socioNombre: `${i.socio?.nombre} ${i.socio?.apellido}`,
        }))
    )
  }

  // Edad en años cumplidos
  const edadDe = (fechaNacimiento) => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nac = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const mes = hoy.getMonth() - nac.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  // ¿La edad de la persona entra en el rango de la actividad?
  const edadOk = (persona, actividad) => {
    const edad = edadDe(persona.fecha_nacimiento)
    if (edad === null) return true
    const min = actividad.edad_minima || 0
    return edad >= min && (actividad.edad_maxima == null || edad <= actividad.edad_maxima)
  }

  const textoEdades = (a) => {
    const min = a.edad_minima || 0
    if (a.edad_maxima == null) return min > 0 ? `Desde ${min} años` : 'Todas las edades'
    return `${min} a ${a.edad_maxima} años`
  }

  const inscriptosEnActividad = (actividadId) => inscripciones.filter(i => i.actividadId === actividadId)

  // Para practicar una actividad hace falta un plan (el propio, o el del titular del grupo)
  const tienePlan = (p) => !!(p.plan || p.titular?.plan || planTitular)
  const hayAlguienConPlan = personas.some(tienePlan)

  // Quiénes pueden sumarse: tienen plan, la edad corresponde y todavía no están inscriptos
  const personasDisponiblesPara = (actividad) => {
    const yaInscriptos = inscriptosEnActividad(actividad.id).map(i => i.socioId)
    return personas.filter(p => !yaInscriptos.includes(p.id) && tienePlan(p) && edadOk(p, actividad))
  }

  const abrirModal = (actividad) => {
    const disponibles = personasDisponiblesPara(actividad)
    setActividadSeleccionada(actividad)
    setPersonaElegidaId(disponibles.length ? String(disponibles[0].id) : '')
    setShowModal(true)
  }

  const abrirModalBaja = (actividad, inscripcion) => {
    setActividadSeleccionada(actividad)
    setInscripcionABaja(inscripcion)
    setShowBajaModal(true)
  }

  const confirmarInscripcion = async () => {
    if (!personaElegidaId) return
    const resp = await api.createInscripcion({
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      socio: { id: parseInt(personaElegidaId) },
      actividad: { id: actividadSeleccionada.id }
    })
    setShowModal(false)
    if (resp.error) {
      setErrorAccion(resp.error)
      return
    }
    setErrorAccion('')
    const persona = personas.find(p => p.id === parseInt(personaElegidaId))
    setExito(`Inscribiste a ${persona?.nombre} en ${actividadSeleccionada.nombre} correctamente!`)
    setTimeout(() => setExito(''), 4000)
    await cargarDatos(personas)
  }

  const confirmarBaja = async () => {
    if (!inscripcionABaja) return
    await api.updateInscripcion(inscripcionABaja.inscripcionId, { estado: 'Baja' })
    setShowBajaModal(false)
    setExito(`${inscripcionABaja.socioNombre} se dio de baja de ${actividadSeleccionada.nombre}.`)
    setTimeout(() => setExito(''), 4000)
    await cargarDatos(personas)
  }

  const getCupoColor = (actividad) => {
    const disponible = actividad.cupo_maximo - (actividad.cupo_ocupado || 0)
    if (disponible <= 0) return 'danger'
    if (disponible <= 3) return 'warning'
    return 'success'
  }

  const formatHora = (h) => h ? h.slice(0, 5) : '-'

  if (cargando) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-5 text-center">
          <Spinner animation="border" />
        </Container>
      </>
    )
  }

  if (error) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-4">
          <p className="text-danger">{error}</p>
        </Container>
      </>
    )
  }

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4">
        <h4 className="fw-bold mb-1">Actividades deportivas</h4>
        <p className="text-muted mb-4">
          {personas.length > 1
            ? 'Inscribí o dá de baja a cualquier integrante de tu grupo familiar'
            : 'Inscribite a las actividades disponibles del club'}
        </p>

        {exito && <Alert variant="success">{exito}</Alert>}
        {errorAccion && <Alert variant="danger" dismissible onClose={() => setErrorAccion('')}>{errorAccion}</Alert>}

        {!hayAlguienConPlan && (
          <Alert variant="warning" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span>
              {personas.length > 1
                ? 'Tu grupo familiar todavía no tiene un plan. Para inscribirte a una actividad primero necesitás contratar uno.'
                : 'Todavía no tenés un plan. Para inscribirte a una actividad primero necesitás contratar uno.'}
            </span>
            <Button size="sm" variant="dark" onClick={() => navigate('/socio/planes')}>Ver planes</Button>
          </Alert>
        )}

        <Row className="g-3">
          {actividades.map(a => {
            const disponible = a.cupo_maximo - (a.cupo_ocupado || 0)
            const inscriptos = inscriptosEnActividad(a.id)
            const hayDisponiblesParaSumar = personasDisponiblesPara(a).length > 0

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
                    <div className="small mb-1">👤 <b>Edades:</b> {textoEdades(a)}</div>
                    <div className="small mb-3">🕐 <b>Horario:</b> {formatHora(a.horario_desde)} a {formatHora(a.horario_hasta)}</div>

                    {inscriptos.length > 0 && (
                      <div className="mb-3">
                        {inscriptos.map(i => (
                          <div key={i.inscripcionId} className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1 bg-light">
                            <span className="small">✓ {i.socioNombre}</span>
                            <Button size="sm" variant="link" className="text-danger p-0" onClick={() => abrirModalBaja(a, i)}>
                              Dar de baja
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!hayAlguienConPlan ? (
                      <Button variant="secondary" disabled className="w-100">Necesitás un plan para inscribirte</Button>
                    ) : hayDisponiblesParaSumar ? (
                      disponible <= 0 ? (
                        <Button variant="secondary" disabled className="w-100">Sin cupo disponible</Button>
                      ) : (
                        <Button variant="dark" className="w-100" onClick={() => abrirModal(a)}>
                          {personas.length > 1 ? 'Inscribir a un integrante' : 'Inscribirme'}
                        </Button>
                      )
                    ) : (
                      inscriptos.length > 0 ? (
                        <Button variant="success" disabled className="w-100">
                          {personas.length > 1 ? '✓ Ya hay integrantes inscriptos' : '✓ Inscripto'}
                        </Button>
                      ) : (
                        <>
                          <Button variant="secondary" disabled className="w-100">No disponible para tu edad</Button>
                          <div className="text-muted small mt-2 text-center">
                            {personas.length > 1
                              ? `Ningún integrante de tu grupo tiene la edad para esta actividad (${textoEdades(a)})`
                              : `Esta actividad es para ${textoEdades(a).toLowerCase()}`}
                          </div>
                        </>
                      )
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
              {personas.length > 1 && (
                <Form.Group className="mb-3">
                  <Form.Label>¿Para quién es la inscripción?</Form.Label>
                  <Form.Select value={personaElegidaId} onChange={e => setPersonaElegidaId(e.target.value)}>
                    {personasDisponiblesPara(actividadSeleccionada).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <p>¿Confirmás la inscripción a <b>{actividadSeleccionada.nombre}</b>?</p>
              <p className="text-muted small">
                📅 {actividadSeleccionada.dias} — 🕐 {formatHora(actividadSeleccionada.horario_desde)} a {formatHora(actividadSeleccionada.horario_hasta)}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={confirmarInscripcion}>Confirmar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBajaModal} onHide={() => setShowBajaModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Darse de baja</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actividadSeleccionada && inscripcionABaja && (
            <p>¿Confirmás que <b>{inscripcionABaja.socioNombre}</b> se dé de baja de <b>{actividadSeleccionada.nombre}</b>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBajaModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarBaja}>Confirmar baja</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ActividadesSocio