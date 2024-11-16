import React from 'react'
import { Container, Navbar, Form } from 'react-bootstrap'
import { useNavbarSlots } from '@app/service/navbar'
import GoogleSSO from '../googleSSO'

const CustomNav = (): React.ReactElement => {
  const { mainMenuSlot, fileNameSlot } = useNavbarSlots()

  return (
    <Container fluid>
      <Navbar expand="lg">
        <Navbar.Brand href="#">MarkdownEditor</Navbar.Brand>
        <div ref={fileNameSlot}></div>
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
