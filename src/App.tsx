import React, { StrictMode, useState, useEffect } from 'react'
import {
  HomeView,
  EditorView,
  ViewerView,
  ErrorView,
  useGlobalCommands,
} from '@app/ui'
import {
  initializeGapiClient,
  parseGoogleState,
  StateFromGoogleAction,
} from '@app/google'
import { CommandsContextProvider, useCommands } from '@app/service/command'
import { CommandPalette } from '@app/ui/commandPalette'
import { GdriveFileContextProvider } from '@app/service/gdrivefile/GdriveFileContext'
import { UserContextProvider, useUser } from '@app/service/user'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useSearchParams,
} from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { FileNewRoute, FileRoute } from '@app/routes'
import { useNavigateTo } from '@app/service/navigate'
import DraftsView from '@app/ui/DraftsView'
import { Nav } from '@app/ui/nav'
import { NavbarProvider } from '@app/service/navbar'

function RootView(): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [commands, executeCommand] = useCommands()
  const [searchParams] = useSearchParams()
  const [user] = useUser()
  const { navigateToHome, navigateToFileView, navigateToFileNew } = useNavigateTo()
  useGlobalCommands()

  useEffect(() => {
    initializeGapiClient()
  }, [])

  useEffect(() => {
    if (!user) return
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
        </>
      )}
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootView />,
    ErrorBoundary: ErrorView,
    children: [
      {
        index: true,
        element: <HomeView />,
      },
      {
        path: 'file/new',
        element: <FileNewRoute />,
      },
      {
        path: 'file',
        element: <FileRoute />,
        children: [
          {
            index: true,
            element: <ViewerView />,
          },
          {
            path: 'edit',
            children: [
              {
                index: true,
                element: <EditorView />,
              },
            ],
          },
          {
            path: 'drafts',
            element: <DraftsView />,
          },
        ],
      },
    ],
  },
])

export default (): React.ReactElement => {
  return (
    <StrictMode>
      <UserContextProvider>
        <GdriveFileContextProvider>
          <CommandsContextProvider>
            <NavbarProvider>
              <RouterProvider router={router} />
            </NavbarProvider>
          </CommandsContextProvider>
        </GdriveFileContextProvider>
      </UserContextProvider>
    </StrictMode>
  )
}
