import React from 'react'
import { useRouteError } from 'react-router-dom'

export default function (): React.ReactElement {
  const error = useRouteError() as Error

  return (
    <div className="container-lg mt-4">
      <div className="row content">
        {error.message}
      </div>
    </div>
  )
}
