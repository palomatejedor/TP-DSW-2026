import { useNavigate } from 'react-router-dom'
import { Navbar, Container, Nav, Button } from 'react-bootstrap'

function NavBar({ rol }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#">⚽ Sports Club</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {rol === 'admin' && (
              <>
                <Nav.Link onClick={() => navigate('/admin')}>Inicio</Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/socios')}>Socios</Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/actividades')}>Actividades</Nav.Link>
                <Nav.Link onClick={() => navigate('/admin/planes')}>Planes</Nav.Link>
              </>
            )}
            {rol === 'socio' && (
              <>
                <Nav.Link onClick={() => navigate('/socio')}>Inicio</Nav.Link>
                <Nav.Link onClick={() => navigate('/socio/actividades')}>Actividades</Nav.Link>
                <Nav.Link onClick={() => navigate('/socio/carnet')}>Mi Carnet</Nav.Link>
              </>
            )}
          </Nav>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar