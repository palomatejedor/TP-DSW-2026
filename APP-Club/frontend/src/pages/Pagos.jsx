import { useState, useEffect } from 'react'
import NavBar from '../components/Navbar'
import { Container, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { api } from '../api'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const nombrePeriodo = (periodo) => {
  if (!periodo) return '-'
  if (periodo.length === 4) return `Año ${periodo}`
  const [y, m] = periodo.split('-')
  return `${MESES[parseInt(m) - 1]} ${y}`
}

const formatearFecha = (f) => {
  if (!f) return '-'
  const [y, m, d] = String(f).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

const estadoDe = (p) => {
  if (p.estado === 'Pagada') return 'Pagada'
  return p.vencida ? 'Vencida' : 'Pendiente'
}

const CLASE = { Pagada: 'bg-success', Pendiente: 'bg-warning', Vencida: 'bg-danger' }

function Pagos() {
  const [pagos, setPagos] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const data = await api.getPagos()
      if (!Array.isArray(data)) throw new Error()
      setPagos(data)
    } catch {
      setError('No se pudieron cargar los pagos.')
    }
  }

  const registrarPago = async (p) => {
    if (!confirm(`¿Registrar el pago de ${p.socio?.nombre} ${p.socio?.apellido} (${nombrePeriodo(p.periodo)})?`)) return
    const resp = await api.pagarCuota(p.id)
    if (resp.error) { setError(resp.error); return }
    await cargar()
  }

  const filtrados = pagos.filter(p => {
    if (filtroEstado && estadoDe(p) !== filtroEstado) return false
    if (filtroPeriodo && p.periodo !== filtroPeriodo) return false
    if (busqueda) {
      const nombre = `${p.socio?.nombre || ''} ${p.socio?.apellido || ''}`.toLowerCase()
      if (!nombre.includes(busqueda.toLowerCase())) return false
    }
    return true
  })

  const cobrado = filtrados.filter(p => p.estado === 'Pagada').reduce((a, p) => a + p.monto, 0)
  const porCobrar = filtrados.filter(p => p.estado === 'Pendiente').reduce((a, p) => a + p.monto, 0)
  const vencidas = filtrados.filter(p => estadoDe(p) === 'Vencida').length

  const resumen = [
    { label: 'Cobrado', valor: `$${cobrado.toLocaleString('es-AR')}` },
    { label: 'Por cobrar', valor: `$${porCobrar.toLocaleString('es-AR')}` },
    { label: 'Cuotas vencidas', valor: vencidas },
  ]

  return (
    <>
      <NavBar rol="admin" />
      <Container className="mt-4 pb-5">
        <div className="mb-4">
          <h4 className="fw-bold mb-1">Pagos</h4>
          <p className="text-muted mb-0">Cuotas cobradas y pendientes. La cuota de un grupo familiar la paga el titular.</p>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {resumen.map(r => (
            <div key={r.label} className="card" style={{ padding: '18px 22px' }}>
              <div className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>{r.label}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 28, color: '#fff' }}>{r.valor}</div>
            </div>
          ))}
        </div>

        <Row className="g-2 mb-3">
          <Col md={4}>
            <Form.Control placeholder="Buscar socio" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option>Pagada</option>
              <option>Pendiente</option>
              <option>Vencida</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control type="month" value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} />
          </Col>
        </Row>

        <Table bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Socio</th><th>Período</th><th>Monto</th><th>Estado</th><th>Fecha de pago</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted">No hay pagos para mostrar</td></tr>
            )}
            {filtrados.map(p => {
              const est = estadoDe(p)
              return (
                <tr key={p.id}>
                  <td style={{ textTransform: 'capitalize' }}>{p.socio ? `${p.socio.nombre} ${p.socio.apellido}` : '-'}</td>
                  <td>{nombrePeriodo(p.periodo)}</td>
                  <td>${p.monto.toLocaleString('es-AR')}</td>
                  <td><span className={`badge ${CLASE[est]}`}>{est}</span></td>
                  <td>{formatearFecha(p.fecha)}</td>
                  <td>
                    {p.estado === 'Pendiente' && (
                      <Button size="sm" variant="outline-dark" onClick={() => registrarPago(p)}>Registrar pago</Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Container>
    </>
  )
}

export default Pagos