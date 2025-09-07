import React from 'react'
import { useUser } from '../../service/user'

interface Props {
  className?: string
  style?: React.CSSProperties
}

const GoogleSSO = (props: Props): React.ReactElement => {
  const [user] = useUser()

  if (!user) {
    return <span></span>
  }

  return (
    <img src={user.avatarUrl} alt={user.name} className={props.className} style={props.style} />
  )
}

export default GoogleSSO
