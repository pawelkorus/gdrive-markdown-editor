import React, { StrictMode, useState } from 'react'
import {
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
import { CommandsContextProvider, useCommandManager, useCommands } from './service/command'
import { CommandPalette } from './ui/commandPalette'
import { GdriveFileContextProvider } from './service/gdrivefile/GdriveFileContext'
import { UserContextProvider } from './service/user'
import { useGdriveFile, useGdriveFileCommands } from './service/gdrivefile'
import HomeView from './ui/HomeView'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { Spinner } from 'react-bootstrap'

function RootView(): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [commands, executeCommand] = useCommands()
  const [, loadFile] = useGdriveFile()
  const { createFile } = useGdriveFileCommands()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  useGlobalCommands()

  const [registerCommand, unregisterCommand] = useCommandManager()
  useEffect(() => {
    const commands = [
      {
        id: 'editUsingSourceEditor',
        name: 'Edit using source editor',
        execute: () => {
          navigate('/file/source')
        },
      },
      {
        id: 'editUsingWyswygEditor',
        name: 'Edit using WYSWYG editor',
        execute: () => {
          navigate('/file/edit')
        },
      },
    ]

    registerCommand(commands)
    return () => {
      unregisterCommand(commands)
    }
  }, [])

  useEffect(() => {
    const googleApi = async function () {
      await loadGapi()
      await initializeGapiClient()

      const stateParam = searchParams.get('state')
      if (stateParam) {
        const googleState = parseGoogleState(searchParams.get('state'))

        if (StateFromGoogleAction.Open == googleState.action) {
          await loadFile(googleState.fileId, googleState.userId)
          navigate('/file')
        }
        else if (StateFromGoogleAction.New == googleState.action) {
          await createFile({ folderId: googleState.folderId })
          navigate('/file/edit')
        }
        else {
          throw new Error('Unknown action ' + googleState.action)
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
        path: 'file',
        element: <ViewerView />,
      },
      {
        path: 'file/edit',
        element: <EditorView />,
      },
      {
        path: 'file/source',
        element: <SourceView />,
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
            <RouterProvider router={router} />
          </CommandsContextProvider>
        </GdriveFileContextProvider>
      </UserContextProvider>
    </StrictMode>
  )
}
