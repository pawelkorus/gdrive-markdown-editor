import React, { StrictMode } from 'react'
import {
  EditorView,
  ViewerView,
  NotificationView,
  SourceView,
  useGlobalCommands,
} from './ui'
import { useEffect, useState } from 'react'
import {
  loadGapi,
  initializeGapiClient,
  parseGoogleState,
  StateFromGoogleAction,
  authorizeInstall,
} from './google'
import { Button, Spinner } from 'react-bootstrap'
import { CommandsContextProvider, useCommandManager, useCommands } from './service/command'
import { CommandPalette } from './ui/commandPalette'
import { GdriveFileContextProvider } from './service/gdrivefile/GdriveFileContext'
import { UserContextProvider } from './service/user'
import { useGdriveFile, useGdriveFileCommands } from './service/gdrivefile'
import { openMarkdownFileCmd } from './ui/useGlobalCommands'
import HomeView from './ui/HomeView'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

function RootView(): React.ReactElement {
  const [message, setMessage] = useState(null)
  const [commands, executeCommand] = useCommands()
  const [file, loadFile] = useGdriveFile()
  const { createFile } = useGdriveFileCommands()
  const [view, setView] = useState('loading')
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
          try {
            await loadFile(googleState.fileId, googleState.userId)
            navigate(`/file`)
          }
          catch (e: unknown) {
            console.error(e)
            setNotificationView('Can\'t load file. ' + e)
          }
        }
        else if (StateFromGoogleAction.New == googleState.action) {
          try {
            createFile({ folderId: googleState.folderId })
            navigate('/file/edit')
          }
          catch (e: unknown) {
            console.error(e)
            setNotificationView('Can\'t create file. ' + e)
          }
        }
        else if (StateFromGoogleAction.Install == googleState.action) {
          try {
            await authorizeInstall()
          }
          catch (e: unknown) {
            setNotificationView('Can\'t install app into you google drive.' + e)
          }
        }
        else {
          setNotificationView('Unknown action ' + googleState.action)
        }
      }
    }

    googleApi()
  }, [])

  useEffect(() => {
    if (file) {
      setView('viewer')
    }
  }, [file.id])

  const setNotificationView = (message?: string) => {
    setMessage(message)
    setView('notification')
  }

  return (
    <>
      { view === 'loading' && (
        <div className="container-fluid h-100 d-flex">
          <div className="mx-auto my-auto">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </div>
      ) }
      { view === 'notification' && (
        <NotificationView message={message}>
          <Button onClick={() => executeCommand(openMarkdownFileCmd)}></Button>
        </NotificationView>
      ) }
      <Outlet></Outlet>
      { view !== 'loading' && <CommandPalette commands={commands} onItemSelected={item => executeCommand(item.id)}></CommandPalette> }
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootView />,
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
