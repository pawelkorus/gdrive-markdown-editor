import React, { useEffect, useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { Nav } from '@app/ui/nav'
import { CommandPalette } from '@app/ui/commandPalette'
import { useCommands } from '@app/service/command'
import { useNavigateTo } from '@app/service/navigate'
import { useUser } from '@app/service/user'
import useGlobalCommands from './useGlobalCommands'
import { initializeGapiClient, parseGoogleState, StateFromGoogleAction } from '@app/google'
import IntegrationCheck from '@app/ui/components/IntegrationCheck'

export default function RootView(): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [commands, executeCommand] = useCommands()
  const [searchParams] = useSearchParams()
  const [user] = useUser()
  const { navigateToHome, navigateToFileView, navigateToFileNew } = useNavigateTo()
  useGlobalCommands()

  useEffect(() => {
    if (!user) return

    async function initialize() {
      await initializeGapiClient()

      const stateParam = searchParams.get('state')

      if (stateParam) {
        const googleState = parseGoogleState(stateParam)

        if (StateFromGoogleAction.Open == googleState.action) {
          navigateToFileView({ fileId: googleState.fileId, userId: googleState.userId })
        }
        else if (StateFromGoogleAction.New == googleState.action) {
          navigateToFileNew({ folderId: googleState.folderId })
        }
        else {
          navigateToHome()
        }
      }

      setLoading(false)
    }

    initialize()
  }, [user])

  return (
    <>
      <Nav></Nav>
      { loading && (
        <div className="container-fluid h-100 d-flex">
          <div className="mx-auto my-auto">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </div>
      )}
      { !loading && (
        <>
          <Outlet></Outlet>
          <CommandPalette commands={commands} onItemSelected={item => executeCommand(item.id)}></CommandPalette>
          <IntegrationCheck></IntegrationCheck>
        </>
      )}
    </>
  )
}
