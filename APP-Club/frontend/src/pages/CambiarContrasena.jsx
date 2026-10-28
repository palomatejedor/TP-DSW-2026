import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
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

function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null')
  } catch {
    return null
  }
}

function CambiarContrasena() {
  const navigate = useNavigate()
  const usuario = leerUsuario()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetir, setRepetir] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!usuario) return <Navigate to="/" replace />

  const forzado = !!usuario.debeCambiarClave

  const salir = () => {
    localStorage.removeItem('usuario')
    navigate('/', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!actual || !nueva || !repetir) { setError('Completá todos los campos'); return }
    if (nueva.length < 6) { setError('La contraseña nueva debe tener al menos 6 caracteres'); return }
    if (nueva !== repetir) { setError('Las contraseñas nuevas no coinciden'); return }

    setEnviando(true)
    try {
      const data = await api.cambiarContrasena(actual, nueva)
      if (data.error) {
        setError(data.error)
        return
      }
      localStorage.setItem('usuario', JSON.stringify({ ...usuario, debeCambiarClave: false }))
      navigate(usuario.rol === 'admin' ? '/admin' : '/socio', { replace: true })
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

        <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#fff' }}>
          {forzado ? 'Elegí tu contraseña' : 'Cambiar contraseña'}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.55, color: '#7f8bab' }}>
          {forzado
            ? 'Tu cuenta tiene una contraseña temporal. Antes de continuar, elegí una propia que solo vos conozcas.'
            : 'Ingresá tu contraseña actual y elegí una nueva.'}
        </p>

        {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="cc-actual">
            <Form.Label>{forzado ? 'Contraseña temporal' : 'Contraseña actual'}</Form.Label>
            <Form.Control type={mostrar ? 'text' : 'password'} value={actual} onChange={e => setActual(e.target.value)} style={inputStyle} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="cc-nueva">
            <Form.Label>Contraseña nueva</Form.Label>
            <Form.Control type={mostrar ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={nueva} onChange={e => setNueva(e.target.value)} style={inputStyle} />
          </Form.Group>

          <Form.Group className="mb-2" controlId="cc-repetir">
            <Form.Label>Repetí la contraseña nueva</Form.Label>
            <Form.Control type={mostrar ? 'text' : 'password'} value={repetir} onChange={e => setRepetir(e.target.value)} style={inputStyle} />
          </Form.Group>

          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            style={{ background: 'none', border: 'none', padding: 0, margin: '0 0 22px', color: '#9db1ff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            {mostrar ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
          </button>

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
            {enviando ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </Form>

        <div className="text-center mt-3">
          {forzado ? (
            <button type="button" onClick={salir} style={{ background: 'none', border: 'none', color: '#7f8bab', fontSize: 14, cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          ) : (
            <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#7f8bab', fontSize: 14, cursor: 'pointer' }}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CambiarContrasena