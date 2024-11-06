import React from 'react'
import { Container, Navbar, Nav, Form, Button } from 'react-bootstrap'
import GoogleSSO from '../googleSSO'
import { useMainMenu } from '../../service/navbar'

const CustomNav = (): React.ReactElement => {
  const [menuItems] = useMainMenu()

  return (
    <Container fluid>
      <Navbar expand="lg">
        <Navbar.Brand href="#">
          GdriveMarkdownEditor
        </Navbar.Brand>
        <div className="d-flex flex-grow-1 justify-content-end d-lg-none me-2">
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
        </div>
        <Form style={{ lineHeight: 1, fontSize: '1.5rem' }} className="ms-0 ms-lg-2 order-lg-last">
          <GoogleSSO style={{ width: '2.5rem', borderRadius: '1.5rem' }}></GoogleSSO>
        </Form>
        <Navbar.Collapse id="navbarSupportedContent" className="justify-content-end">
          <Nav className="me-auto">
          </Nav>
          <Form>
            {menuItems.map(item => (
              <Button key={item.id} onClick={item.action} variant="primary">
                {item.label}
              </Button>
            ))}
          </Form>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  )
}

export default CustomNav
