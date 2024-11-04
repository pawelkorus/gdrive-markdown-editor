import React from 'react'
import { Container, Navbar, Nav, Form } from 'react-bootstrap'
import GoogleSSO from '../googleSSO'

const CustomNav = (): React.ReactElement => {
  return (
    <Container fluid>
      <Navbar expand="lg">
        <Navbar.Brand href="#">
          GdriveMarkdownEditor
        </Navbar.Brand>
        <div className="d-flex flex-grow-1 justify-content-end d-lg-none me-2">
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
        </div>
        <Navbar.Collapse id="navbarSupportedContent" className="justify-content-end">
          <Nav className="me-auto">
          </Nav>
        </Navbar.Collapse>
        <Form style={{ lineHeight: 1, fontSize: '1.5rem' }}>
          <GoogleSSO style={{ width: '2.5rem', borderRadius: '1.5rem' }}></GoogleSSO>
        </Form>
      </Navbar>
    </Container>
  )
}

export default CustomNav
