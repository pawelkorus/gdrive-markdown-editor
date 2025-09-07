import React, { useCallback, useState } from 'react'
import { IntegrationStatus, useGdriveIntegration } from '@app/service/gdrive'
import { useNotifications } from '@app/service/notification'
import { Button, Toast } from 'react-bootstrap'

export default function (): React.ReactElement {
  const { integrationStatus, integrate } = useGdriveIntegration()
  const { addNotification } = useNotifications()
  const [dismissed, setDismissed] = useState(false)

  const handleInstall = useCallback(async () => {
    await integrate()
  }, [])

  if (integrationStatus !== IntegrationStatus.NOT_INTEGRATED) return <></>

  if (dismissed) return <></>

  return addNotification(
    <Toast>
      <Toast.Body>
        Application is not installed in your Google Drive. Would you like to install it?
        <div className="mt-2 pt-2 border-top">
          <Button variant="primary" size="sm" className="me-1" onClick={() => { void handleInstall() }}>Install</Button>
          <Button variant="secondary" size="sm" data-bs-dismiss="toast" className="me-1" onClick={() => setDismissed(true)}>No, thanks!</Button>
        </div>
      </Toast.Body>
    </Toast>,
  )
}
