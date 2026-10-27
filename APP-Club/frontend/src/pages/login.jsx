import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Alert } from 'react-bootstrap'
import logo from '../assets/logo.png'
import { api } from '../api'

const inputStyle = {
  height: 48,
  padding: '0 16px',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  fontSize: 15,
  color: '#fff',
  background: 'rgba(255,255,255,0.04)',
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [expirada] = useState(() => localStorage.getItem('sesionExpirada') === '1')
  const navigate = useNavigate()

  // El aviso de sesión expirada se muestra una sola vez
  useEffect(() => {
    localStorage.removeItem('sesionExpirada')
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos'); return }
    try {
      const data = await api.login(email, password)
      if (data.error) {
        setError(data.inactivo || data.pendiente || data.rechazado ? data.error : 'Email o contraseña incorrectos')
      } else {
        localStorage.setItem('usuario', JSON.stringify({ ...data, inicioSesion: Date.now() }))
        if (data.rol === 'admin') {
          navigate('/admin', { replace: true })
        } else if (data.rol === 'socio') {
          navigate('/socio', { replace: true })
        }
      }
    } catch {
      setError('Error al conectar con el servidor')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: '#080d19' }}>

      {/* Lado izquierdo: marca */}
      <div style={{
        flex: '1 1 520px', minHeight: 360, position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '56px 64px', boxSizing: 'border-box',
        background: 'radial-gradient(900px 500px at 20% 90%, rgba(91,124,255,0.35), transparent 60%), radial-gradient(600px 400px at 90% 10%, rgba(56,208,232,0.18), transparent 60%), #0a1020'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          <g fill="none" stroke="#ffffff" strokeWidth="2">
            <rect x="-40" y="120" width="680" height="560" rx="6" />
            <line x1="-40" y1="400" x2="640" y2="400" />
            <circle cx="300" cy="400" r="96" />
            <rect x="150" y="120" width="300" height="130" />
            <rect x="150" y="550" width="300" height="130" />
          </g>
        </svg>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={logo} alt="Sports Club" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'contain', background: '#0f1729' }} />
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 22, color: '#fff' }}>Sports Club</span>
        </div>

        <div style={{ position: 'relative', maxWidth: 460, margin: '40px 0' }}>
          <h1 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.05, color: '#fff' }}>
            Todo tu club, en un solo lugar.
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: '#8d9ac0' }}>
            Socios, actividades, planes y beneficios. Desde cualquier dispositivo.
          </p>
        </div>

        <div style={{ position: 'relative', fontSize: 13, color: '#566283' }}>© 2026 Sports Club · UTN FRRO</div>
      </div>

      {/* Lado derecho: formulario */}
      <div style={{
        flex: '1 1 480px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', boxSizing: 'border-box', background: '#0b1220'
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 700, color: '#fff' }}>Iniciá sesión</h2>
          <p style={{ margin: '0 0 28px', fontSize: 15, color: '#7f8bab' }}>Ingresá con tu mail y contraseña.</p>

          {expirada && !error && (
            <Alert variant="warning" className="py-2" style={{ fontSize: '0.85rem' }}>
              El tiempo límite de sesión ha expirado. Volvé a iniciar sesión.
            </Alert>
          )}
          {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="login-mail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="login-pass">
              <Form.Label>Contraseña</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 84 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#9db1ff', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </Form.Group>

            <button
              type="submit"
              style={{
                width: '100%', height: 50, border: 'none', borderRadius: 12,
                background: 'linear-gradient(135deg, #5b7cff, #3a55e0)', color: '#fff',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 10px 26px rgba(91,124,255,0.35)'
              }}
            >
              Ingresar
            </button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/recuperar-contrasena" style={{ fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#7f8bab' }}>¿Primera vez en la app?</p>
            <Link to="/registro" style={{ fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Registrarme
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login