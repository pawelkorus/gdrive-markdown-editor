import React, { useContext } from 'react'
import { Container, Navbar, Form } from 'react-bootstrap'
import { useFilenamePanel, NavbarContext } from '../../service/navbar'
import GoogleSSO from '../googleSSO'

const CustomNav = (): React.ReactElement => {
  const { filenamePanel } = useFilenamePanel()
  const { mainMenuSlot, fileNameSlot } = useContext(NavbarContext)

  return (
    <Container fluid>
      <Navbar expand="lg">
        <div ref={fileNameSlot}></div>
        { filenamePanel ? filenamePanel : <Navbar.Brand href="#">GdriveMarkdownEditor</Navbar.Brand> }
        <div className="d-flex flex-grow-1 justify-content-end d-lg-none me-2">
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
        </div>
        <Form style={{ lineHeight: 1, fontSize: '1.5rem' }} className="ms-0 ms-lg-2 order-lg-last">
          <GoogleSSO style={{ width: '2.5rem', borderRadius: '1.5rem' }}></GoogleSSO>
        </Form>
        <Navbar.Collapse id="navbarSupportedContent" className="justify-content-end" ref={mainMenuSlot}>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  )
}

export default CustomNav
