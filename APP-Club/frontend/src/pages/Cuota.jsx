import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/Navbar'
import { Container, Button, Modal, Alert, Spinner } from 'react-bootstrap'
import { api } from '../api'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const nombrePeriodo = (periodo) => {
  if (!periodo) return 'Cuota'
  if (periodo.length === 4) return `Año ${periodo}`
  const [y, m] = periodo.split('-')
  return `${MESES[parseInt(m) - 1]} ${y}`
}

const formatearFecha = (f) => {
  if (!f) return ''
  const [y, m, d] = String(f).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function estadoDe(c) {
  if (c.estado === 'Pagada') return { texto: 'Pagada', clase: 'bg-success' }
  if (c.vencida) return { texto: 'Vencida', clase: 'bg-danger' }
  return { texto: 'Pendiente', clase: 'bg-warning' }
}

function Cuota() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null)
  const [exito, setExito] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
      if (!usuario?.mail) {
        setError('No se encontró la sesión. Volvé a iniciar sesión.')
        return
      }
      const yo = await api.getSocioByMail(usuario.mail)
      if (!yo || yo.error) {
        setError('No se encontraron datos de socio para este usuario.')
        return
      }
      const resp = await api.getCuotasSocio(yo.id)
      if (resp.error) {
        setError(resp.error)
        return
      }
      setDatos(resp)
    } catch {
      setError('Error al conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }

  const confirmarPago = async () => {
    const cuota = cuotaSeleccionada
    setCuotaSeleccionada(null)
    try {
      const resp = await api.pagarCuota(cuota.id)
      if (resp.error) {
        setError(resp.error)
        return
      }
      setExito(`Pago de ${nombrePeriodo(cuota.periodo)} registrado correctamente.`)
      setTimeout(() => setExito(''), 4000)
      await cargar()
    } catch {
      setError('No se pudo registrar el pago.')
    }
  }

  const encabezado = (
    <>
      <h4 className="fw-bold mb-1">Mi cuota social</h4>
      <p className="text-muted mb-4">Consultá y pagá tu cuota mensual.</p>
    </>
  )

  if (cargando) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-5 text-center"><Spinner animation="border" /></Container>
      </>
    )
  }

  if (error && !datos) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-4" style={{ maxWidth: 760 }}>
          {encabezado}
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    )
  }

  // Miembro de un grupo familiar: la cuota la paga el titular
  if (datos.pagaTitular) {
    return (
      <>
        <NavBar rol="socio" />
        <Container className="mt-4" style={{ maxWidth: 760 }}>
          {encabezado}
          <Alert variant="info">
            Tu cuota la paga el titular de tu grupo familiar
            {datos.titular ? <> (<b style={{ textTransform: 'capitalize' }}>{datos.titular.nombre} {datos.titular.apellido}</b>)</> : ''}.
            No tenés que pagar nada por tu cuenta.
          </Alert>
        </Container>
      </>
    )
  }

  const cuotas = datos.cuotas
  const pendientes = cuotas.filter(c => c.estado === 'Pendiente')
  const total = pendientes.reduce((acc, c) => acc + c.monto, 0)

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4 pb-5" style={{ maxWidth: 760 }}>
        {encabezado}

        {exito && <Alert variant="success">{exito}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {!datos.plan ? (
          <Alert variant="warning">
            Todavía no tenés un plan, así que no hay cuota para pagar.{' '}
            <a href="/socio/planes" onClick={(e) => { e.preventDefault(); navigate('/socio/planes') }}>Elegí un plan</a>
          </Alert>
        ) : (
          <>
            <div style={{
              borderRadius: 20, padding: '24px 28px', marginBottom: 24,
              background: 'linear-gradient(120deg, #2b50ff 0%, #1a2f8f 60%, #101a2e 100%)',
              display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c3cdf5' }}>Tu plan</p>
                <p style={{ margin: '0 0 2px', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 26, color: '#fff' }}>{datos.plan.nombre}</p>
                <p style={{ margin: 0, fontSize: 14, color: '#c3cdf5' }}>Cuota {datos.plan.periodicidad === 'Anual' ? 'anual' : 'mensual'} de ${Number(datos.plan.precio).toLocaleString('es-AR')}
                  {datos.plan.tipo === 'Familiar' && ` por integrante × ${datos.integrantes} integrante${datos.integrantes > 1 ? 's' : ''}`}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 6px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c3cdf5' }}>Total a pagar</p>
                <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff' }}>${total.toLocaleString('es-AR')}</p>
              </div>
            </div>

            {pendientes.length > 0 && (
              <Alert variant="warning" className="mb-4">
                Tenés <b>{pendientes.length} cuota{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''}</b> de pago.
                {' '}Tu cuota vence el <b>{formatearFecha(pendientes[pendientes.length - 1].vencimiento)}</b>.
              </Alert>
            )}

            <div className="d-flex flex-column gap-3">
              {cuotas.map(c => {
                const est = estadoDe(c)
                return (
                  <div key={c.id} className="card" style={{ padding: '16px 20px', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: '1 1 160px' }}>
                      <div className="fw-bold" style={{ color: '#fff' }}>{nombrePeriodo(c.periodo)}</div>
                      <div className="text-muted small">
                        {c.fecha
                          ? `Pagada el ${formatearFecha(c.fecha)}`
                          : `${c.vencida ? 'Venció' : 'Vence'} el ${formatearFecha(c.vencimiento)}`}
                      </div>
                    </div>
                    <span className="fw-bold" style={{ color: '#fff' }}>${c.monto.toLocaleString('es-AR')}</span>
                    <span className={`badge ${est.clase}`}>{est.texto}</span>
                    {c.estado === 'Pendiente' && (
                      <Button size="sm" variant="dark" onClick={() => setCuotaSeleccionada(c)}>Pagar</Button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Container>

      <Modal show={!!cuotaSeleccionada} onHide={() => setCuotaSeleccionada(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cuotaSeleccionada && (
            <>
              <p>¿Confirmás el pago de la cuota de <b>{nombrePeriodo(cuotaSeleccionada.periodo)}</b>?</p>
              <p className="text-muted small mb-1">Monto: <b>${cuotaSeleccionada.monto.toLocaleString('es-AR')}</b></p>
              <p className="text-muted small mb-0">Este es un pago simulado para fines del TP.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCuotaSeleccionada(null)}>Cancelar</Button>
          <Button variant="dark" onClick={confirmarPago}>Confirmar pago</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Cuota