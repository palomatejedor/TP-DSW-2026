import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Alert } from 'react-bootstrap'
import logo from '../assets/logo.png'
import { api } from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos'); return }
    try {
      const data = await api.login(email, password)
      if (data.error) {
        setError('Email o contraseña incorrectos')
      } else if (data.rol === 'admin') {
        navigate('/admin')
      } else if (data.rol === 'socio') {
        navigate('/socio')
      }
    } catch {
      setError('Error al conectar con el servidor')
    }
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
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Sistema de gestión del club</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '32px'
        }}>
          <h5 style={{ color: 'white', marginBottom: '24px', fontWeight: '600' }}>Iniciá sesión</h5>

          {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Contraseña</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    borderRadius: '8px',
                    paddingRight: '40px'
                  }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
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
              Ingresar
            </Button>
          </Form>

          <div className="text-center mt-3">
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
              ¿Olvidaste tu contraseña? Contactá al administrador
            </span>
          </div>
        </div>

        <p className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          © 2026 Sports Club · UTN FRRO
        </p>
      </div>
    </div>
  )
}

export default Login