import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Button, Modal } from 'react-bootstrap'
import logo from '../assets/logo.png'
import { api } from '../api'

function RecuperarContrasena() {
  const [numeroSocio, setNumeroSocio] = useState('')
  const [dni, setDni] = useState('')
  const [mail, setMail] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!numeroSocio.trim() || !dni.trim() || !mail.trim()) {
      setErrorMensaje('Verifique sus datos y vuelva a intentarlo')
      setShowErrorModal(true)
      return
    }

    try {
      const data = await api.recuperarContrasena(numeroSocio, dni, mail)
      if (data.error) {
        setErrorMensaje('Verifique sus datos y vuelva a intentarlo')
        setShowErrorModal(true)
      } else {
        setShowSuccessModal(true)
      }
    } catch {
      setErrorMensaje('Error al conectar con el servidor')
      setShowErrorModal(true)
    }
  }

  const cerrarExito = () => {
    setShowSuccessModal(false)
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div className="text-center mb-4">
          <img
            src={logo}
            alt="Sports Club"
            style={{ width: '100px', height: '100px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
          />
          <h2 style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>Sports Club</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Recuperar contraseña</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '32px'
        }}>
          <h5 style={{ color: 'white', marginBottom: '8px', fontWeight: '600' }}>Recuperá tu contraseña</h5>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Completá tus datos y te enviaremos una nueva contraseña por mail.
          </p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>N° de Socio</Form.Label>
              <Form.Control
                type="number"
                placeholder="N° de Socio"
                value={numeroSocio}
                onChange={e => setNumeroSocio(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>N° de Documento</Form.Label>
              <Form.Control
                type="number"
                placeholder="N° de Documento"
                value={dni}
                onChange={e => setDni(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="tucorreo@email.com"
                value={mail}
                onChange={e => setMail(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100"
              style={{
                background: 'linear-gradient(135deg, #4a9eff, #7c3aed)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Enviar nueva contraseña
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none' }}>
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>

        <p className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          © 2026 Sports Club · UTN FRRO
        </p>
      </div>

      {/* Modal de error */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Body className="text-center py-4">
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '3px solid #dc3545', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '2rem', color: '#dc3545'
          }}>
            ✕
          </div>
          <h5 className="fw-bold mb-2">Registro incompleto</h5>
          <p className="text-muted mb-4">{errorMensaje}</p>
          <Button variant="primary" onClick={() => setShowErrorModal(false)} style={{ minWidth: '100px' }}>
            OK
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal de éxito */}
      <Modal show={showSuccessModal} onHide={cerrarExito} centered>
        <Modal.Body className="text-center py-4">
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '3px solid #28a745', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '2rem', color: '#28a745'
          }}>
            ✓
          </div>
          <h5 className="fw-bold mb-2">Registro exitoso</h5>
          <p className="text-muted mb-1">Tu contraseña fue enviada al correo</p>
          <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
            También revisá por favor la carpeta de correo no deseado.
          </p>
          <Button variant="primary" onClick={cerrarExito} style={{ minWidth: '100px' }}>
            OK
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default RecuperarContrasena
