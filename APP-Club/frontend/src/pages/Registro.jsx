import { useState } from 'react'
import { Link } from 'react-router-dom'
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

function Registro() {
  const [mail, setMail] = useState('')
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [repetir, setRepetir] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!mail.trim() || !dni.trim() || !password || !repetir) { setError('Completá todos los campos'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { setError('El formato del mail es inválido'); return }
    if (!/^\d{7,8}$/.test(dni)) { setError('El DNI debe tener 7 u 8 dígitos, sin puntos'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== repetir) { setError('Las contraseñas no coinciden'); return }

    setEnviando(true)
    try {
      const data = await api.registrarse(mail.trim(), dni.trim(), password)
      if (data.error) setError(data.error)
      else setEnviado(true)
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', boxSizing: 'border-box',
      background: 'radial-gradient(900px 500px at 15% 90%, rgba(91,124,255,0.28), transparent 60%), #080d19'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <img src={logo} alt="Sports Club" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'contain', background: '#0f1729' }} />
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: '#fff' }}>Sports Club</span>
        </div>

        {enviado ? (
          <>
            <h2 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 700, color: '#fff' }}>¡Solicitud enviada!</h2>
            <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.6, color: '#8d9ac0' }}>
              La administración tiene que aprobar tu cuenta. Cuando lo haga, vas a poder ingresar con tu mail y la contraseña que elegiste.
            </p>
            <Link to="/" style={{ fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Volver al inicio de sesión</Link>
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#fff' }}>Crear mi cuenta</h2>
            <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.55, color: '#7f8bab' }}>
              Usá el mismo mail y DNI que le diste a la administración cuando te cargaron como socio.
            </p>

            {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="reg-mail">
                <Form.Label>Mail</Form.Label>
                <Form.Control type="email" placeholder="tucorreo@email.com" value={mail} onChange={e => setMail(e.target.value)} style={inputStyle} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="reg-dni">
                <Form.Label>DNI</Form.Label>
                <Form.Control inputMode="numeric" placeholder="Sin puntos" value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, ''))} maxLength={8} style={inputStyle} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="reg-pass">
                <Form.Label>Contraseña</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={mostrar ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 84 }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar(!mostrar)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9db1ff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                  >
                    {mostrar ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="reg-repetir">
                <Form.Label>Repetí la contraseña</Form.Label>
                <Form.Control type={mostrar ? 'text' : 'password'} value={repetir} onChange={e => setRepetir(e.target.value)} style={inputStyle} />
              </Form.Group>

              <button
                type="submit"
                disabled={enviando}
                style={{
                  width: '100%', height: 50, border: 'none', borderRadius: 12,
                  background: 'linear-gradient(135deg, #5b7cff, #3a55e0)', color: '#fff',
                  fontSize: 16, fontWeight: 600, cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.7 : 1,
                  boxShadow: '0 10px 26px rgba(91,124,255,0.35)'
                }}
              >
                {enviando ? 'Enviando...' : 'Solicitar mi cuenta'}
              </button>
            </Form>

            <div className="text-center mt-3">
              <Link to="/" style={{ fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Ya tengo cuenta · Iniciar sesión</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Registro