import React, { StrictMode, useState } from 'react'
import {
  HomeView,
  EditorView,
  ViewerView,
  SourceView,
  ErrorView,
  useGlobalCommands,
} from './ui'
import { useEffect } from 'react'
import {
  loadGapi,
  initializeGapiClient,
  parseGoogleState,
  StateFromGoogleAction,
} from './google'
import { CommandsContextProvider, useCommands } from './service/command'
import { CommandPalette } from './ui/commandPalette'
import { GdriveFileContextProvider } from './service/gdrivefile/GdriveFileContext'
import { UserContextProvider } from './service/user'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useSearchParams,
} from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { FileNewRoute, FileRoute } from './routes'
import { useNavigateTo } from './service/navigate'
import DraftsView from './ui/DraftsView'

function RootView(): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [commands, executeCommand] = useCommands()
  const [searchParams] = useSearchParams()
  const { navigateToHome, navigateToFileView, navigateToNewFile } = useNavigateTo()
  useGlobalCommands()

  useEffect(() => {
    const googleApi = async function () {
      await loadGapi()
      await initializeGapiClient()

      const stateParam = searchParams.get('state')
      if (stateParam) {
        const googleState = parseGoogleState(stateParam)

        if (StateFromGoogleAction.Open == googleState.action) {
          navigateToFileView({ fileId: googleState.fileId, userId: googleState.userId })
        }
        else if (StateFromGoogleAction.New == googleState.action) {
          navigateToNewFile({ folderId: googleState.folderId })
        }
        else {
          navigateToHome()
        }
      }
      setLoading(false)
    }

    googleApi()
  }, [])

  if (loading) return (
    <div className="container-fluid h-100 d-flex">
      <div className="mx-auto my-auto">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    </div>
  )

  return (
    <>
      <Outlet></Outlet>
      <CommandPalette commands={commands} onItemSelected={item => executeCommand(item.id)}></CommandPalette>
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
            path: 'source',
            element: <SourceView />,
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
    // <StrictMode>
    <UserContextProvider>
      <GdriveFileContextProvider>
        <CommandsContextProvider>
          <RouterProvider router={router} />
        </CommandsContextProvider>
      </GdriveFileContextProvider>
    </UserContextProvider>
    // </StrictMode>
  )
}
