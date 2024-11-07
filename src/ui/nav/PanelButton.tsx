import React, { PropsWithChildren } from 'react'
import { Button } from 'react-bootstrap'

type PanelButtonProps = {
  variant?: string
  onClick?: () => void
}

const PanelButton: React.FC<PropsWithChildren<PanelButtonProps>> = ({ children, variant = 'primary', onClick = () => {} }) => {
  return <Button variant={variant} onClick={onClick} className="me-2">{children}</Button>
}

export default PanelButton
