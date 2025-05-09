import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const NavigationBar: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">TravelTales</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/search">Search Countries</Nav.Link>
              {isAuthenticated && (
                <>
                  <Nav.Link as={Link} to="/feed">Feed</Nav.Link>
                  <Nav.Link as={Link} to="/create">Create Post</Nav.Link>
                  <Nav.Link as={Link} to={`/profile/${user?.id}`}>My Profile</Nav.Link>
                </>
              )}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="outline-light" className="me-2" onClick={() => setShowLogin(true)}>
                    Login
                  </Button>
                  <Button variant="light" onClick={() => setShowRegister(true)}>
                    Register
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} onHide={() => setShowRegister(false)} />
    </>
  );
};

export default NavigationBar; 