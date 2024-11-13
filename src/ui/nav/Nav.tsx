import React, { Fragment } from 'react'
import { Container, Navbar, Form, Nav } from 'react-bootstrap'
import { useMainMenuPanel, useFilenamePanel } from '../../service/navbar'
import GoogleSSO from '../googleSSO'

const CustomNav = (): React.ReactElement => {
  const { panels } = useMainMenuPanel()
  const { filenamePanel } = useFilenamePanel()

  return (
    <Container fluid>
      <Navbar expand="lg">
        { filenamePanel ? filenamePanel : <Navbar.Brand href="#">GdriveMarkdownEditor</Navbar.Brand> }
        <div className="d-flex flex-grow-1 justify-content-end d-lg-none me-2">
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
        </div>
        <Form style={{ lineHeight: 1, fontSize: '1.5rem' }} className="ms-0 ms-lg-2 order-lg-last">
          <GoogleSSO style={{ width: '2.5rem', borderRadius: '1.5rem' }}></GoogleSSO>
        </Form>
        <Navbar.Collapse id="navbarSupportedContent" className="justify-content-end">
          <Nav className="me-auto">
          </Nav>
          {panels.map((item: React.ReactNode, index: number) => (
            <Fragment key={index}>
              {item}
            </Fragment>
          ))}
        </Navbar.Collapse>
      </Navbar>
    </Container>
  )
}

export default CustomNav
