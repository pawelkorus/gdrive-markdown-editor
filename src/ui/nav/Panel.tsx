import React, { PropsWithChildren } from 'react'
import { Form } from 'react-bootstrap'

const Panel: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Form className="float-start">
      {children}
    </Form>
  )
}

export default Panel
