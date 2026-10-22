import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Alert } from 'react-bootstrap'
import { api } from '../api'

const formatearFecha = (f) => {
  if (!f) return '-'
  const d = new Date(f)
  return isNaN(d) ? '-' : d.toLocaleDateString('es-AR') + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const data = await api.getSolicitudes()
      if (!Array.isArray(data)) throw new Error()
      setSolicitudes(data)
    } catch {
      setError('No se pudieron cargar las solicitudes.')
    } finally {
      setCargando(false)
    }
  }

  const resolver = async (s, aprobar) => {
    const accion = aprobar ? 'aprobar' : 'rechazar'
    if (!confirm(`¿Querés ${accion} la cuenta de ${s.nombre} ${s.apellido}?`)) return
    const resp = aprobar ? await api.aprobarSolicitud(s.id) : await api.rechazarSolicitud(s.id)
    if (resp.error) { setError(resp.error); return }
    setError('')
    setExito(`Cuenta de ${s.nombre} ${s.apellido} ${aprobar ? 'aprobada' : 'rechazada'}.`)
    setTimeout(() => setExito(''), 4000)
    await cargar()
  }

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4 pb-5">
        <div className="mb-4">
          <h4 className="fw-bold mb-1">Solicitudes de cuenta</h4>
          <p className="text-muted mb-0">
            Socios que pidieron crear su cuenta. Al aprobar, el socio ya puede ingresar con la contraseña que eligió.
          </p>
        </div>

        {exito && <Alert variant="success">{exito}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <Table bordered hover responsive>
          <thead className="table-dark">
            <tr><th>Socio</th><th>DNI</th><th>Mail</th><th>Solicitada</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {!cargando && solicitudes.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">No hay solicitudes pendientes</td></tr>
            )}
            {solicitudes.map(s => (
              <tr key={s.id}>
                <td style={{ textTransform: 'capitalize' }}>{s.nombre} {s.apellido}</td>
                <td>{s.dni ? Number(s.dni).toLocaleString('es-AR') : '-'}</td>
                <td>{s.mail}</td>
                <td>{formatearFecha(s.fecha_solicitud)}</td>
                <td>
                  <Button size="sm" variant="success" className="me-2" onClick={() => resolver(s, true)}>Aprobar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => resolver(s, false)}>Rechazar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  )
}

export default Solicitudes