import { useState } from 'react'
import NavBar from '../components/Navbar'
import { Container, Card, Badge, Button, Modal, Alert, Row, Col } from 'react-bootstrap'

const cuotasMock = [
  { id: 1, mes: 'Abril 2026', monto: 5000, estado: 'Pagada', fecha_pago: '2026-04-05' },
  { id: 2, mes: 'Mayo 2026', monto: 5000, estado: 'Pagada', fecha_pago: '2026-05-03' },
  { id: 3, mes: 'Junio 2026', monto: 5000, estado: 'Pendiente', fecha_pago: null },
]

function Cuota() {
  const [cuotas, setCuotas] = useState(cuotasMock)
  const [showModal, setShowModal] = useState(false)
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null)
  const [exito, setExito] = useState('')

  const abrirModal = (cuota) => {
    setCuotaSeleccionada(cuota)
    setShowModal(true)
  }

  const confirmarPago = () => {
    setCuotas(cuotas.map(c =>
      c.id === cuotaSeleccionada.id
        ? { ...c, estado: 'Pagada', fecha_pago: new Date().toISOString().split('T')[0] }
        : c
    ))
    setShowModal(false)
    setExito(`Pago de ${cuotaSeleccionada.mes} registrado correctamente!`)
    setTimeout(() => setExito(''), 4000)
  }

  const pendientes = cuotas.filter(c => c.estado === 'Pendiente')

  return (
    <>
      <NavBar rol="socio" />
      <Container className="mt-4" style={{ maxWidth: '600px' }}>
        <h4 className="fw-bold mb-1">Mi Cuota Social</h4>
        <p className="text-muted mb-4">Consultá y pagá tu cuota mensual</p>

        {exito && <Alert variant="success">{exito}</Alert>}

        {pendientes.length > 0 && (
          <Alert variant="warning" className="mb-4">
            Tenés <b>{pendientes.length} cuota{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''}</b> de pago.
          </Alert>
        )}

        <div className="d-flex flex-column gap-3">
          {cuotas.map(c => (
            <Card key={c.id} className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <Row className="align-items-center">
                  <Col>
                    <div className="fw-bold">{c.mes}</div>
                    <div className="text-muted small">
                      {c.fecha_pago
                        ? `Pagada el ${new Date(c.fecha_pago).toLocaleDateString('es-AR')}`
                        : 'Sin fecha de pago'}
                    </div>
                  </Col>
                  <Col xs="auto">
                    <span className="fw-bold me-3">${c.monto.toLocaleString()}</span>
                    <Badge bg={c.estado === 'Pagada' ? 'success' : 'warning'} text={c.estado === 'Pagada' ? undefined : 'dark'}>
                      {c.estado}
                    </Badge>
                  </Col>
                  {c.estado === 'Pendiente' && (
                    <Col xs="auto">
                      <Button size="sm" variant="dark" onClick={() => abrirModal(c)}>
                        Pagar
                      </Button>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cuotaSeleccionada && (
            <>
              <p>¿Confirmás el pago de la cuota de <b>{cuotaSeleccionada.mes}</b>?</p>
              <p className="text-muted small">Monto: <b>${cuotaSeleccionada.monto.toLocaleString()}</b></p>
              <p className="text-muted small">⚠️ Este es un pago simulado para fines del TP.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={confirmarPago}>Confirmar pago</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Cuota