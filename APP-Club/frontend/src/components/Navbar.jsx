import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Navbar, Container, Nav, Button } from 'react-bootstrap'

const LINKS = {
  admin: [
    { ruta: '/admin', texto: 'Inicio' },
    { ruta: '/admin/socios', texto: 'Socios' },
    { ruta: '/admin/grupo-familiar', texto: 'Grupo Familiar' },
    { ruta: '/admin/actividades', texto: 'Actividades' },
    { ruta: '/admin/planes', texto: 'Planes' },
    { ruta: '/admin/inscripciones', texto: 'Inscripciones' },
    { ruta: '/admin/beneficios', texto: 'Beneficios' },
  ],
  socio: [
    { ruta: '/socio', texto: 'Inicio' },
    { ruta: '/socio/actividades', texto: 'Actividades' },
    { ruta: '/socio/carnet', texto: 'Mi Carnet' },
    { ruta: '/socio/planes', texto: 'Planes' },
    { ruta: '/socio/cuota', texto: 'Cuota' },
    { ruta: '/socio/beneficios', texto: 'Beneficios' },
  ],
}

function NavBar({ rol }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)

  const irA = (ruta) => {
    setExpanded(false) // cierra el menú hamburguesa en celular/tablet al elegir una opción
    navigate(ruta)
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario') // borra la sesión guardada
    setExpanded(false)
    navigate('/')
  }

  const links = LINKS[rol] || []

  return (
    <Navbar bg="dark" variant="dark" expand="lg" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <Navbar.Brand
          role="button"
          onClick={() => irA(rol === 'admin' ? '/admin' : '/socio')}
        >
          ⚽ Sports Club
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {links.map(l => (
              <Nav.Link
                key={l.ruta}
                active={location.pathname === l.ruta}
                onClick={() => irA(l.ruta)}
              >
                {l.texto}
              </Nav.Link>
            ))}
          </Nav>
          <Button variant="outline-light" size="sm" className="mt-2 mt-lg-0" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar