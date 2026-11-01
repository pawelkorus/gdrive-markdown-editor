import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useAppConfig, useUpdateAppConfig } from '@app/service/appconfig'
import { useNavigateTo } from '@app/service/navigate'
import { useNavigate } from 'react-router-dom'

export default function SettingsView(): React.ReactElement {
  const config = useAppConfig()
  const updateConfig = useUpdateAppConfig()
  const navigate = useNavigate()
  const { navigateToHome } = useNavigateTo()
  const [testConfig, setTestConfig] = useState(config.testConfig)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    setTestConfig(config.testConfig)
  }, [config])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateConfig({ ...config, testConfig }).then(
      () => setStatus('saved'),
      () => setStatus('error'),
    )
  }

  const handleClose = () => {
    const state = window.history.state as { idx?: number } | null
    if (state?.idx) {
      void navigate(-1)
    } else {
      navigateToHome()
    }
  }

  return (
    <div className="container-lg mt-4">
      <h1>Settings</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="settings-testConfig">
          <Form.Label>Test config</Form.Label>
          <Form.Control
            type="text"
            value={testConfig}
            onChange={e => { setTestConfig(e.target.value); setStatus('idle') }}
          />
        </Form.Group>
        <Button type="submit">Save</Button>
        <Button variant="secondary" className="ms-2" onClick={handleClose}>Close</Button>
      </Form>
      {status === 'saved' && <Alert className="mt-3" variant="success">Settings saved</Alert>}
      {status === 'error' && <Alert className="mt-3" variant="danger">Failed to save settings</Alert>}
    </div>
  )
}
