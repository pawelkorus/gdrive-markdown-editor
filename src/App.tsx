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
  loadGis,
  initializeTokenClient,
  initializeGapiClient,
  parseGoogleState,
  StateFromGoogleAction,
  authorizeInstall,
} from './google'
import { Button, Spinner } from 'react-bootstrap'
import { CommandsContextProvider, useCommandManager, useCommands } from './service/command'
import { CommandPalette } from './ui/commandPalette'
import { GdriveFileContextProvider } from './service/gdrivefile/GdriveFileContext'
import { UserContextProvider, useUser } from './service/user'
import { useGdriveFile, useGdriveFileCommands } from './service/gdrivefile'
import { openMarkdownFileCmd } from './ui/useGlobalCommands'
import GoogleSSO from './ui/googleSSO'

function RootView(): React.ReactElement {
  const [message, setMessage] = useState(null)
  const [commands, executeCommand] = useCommands()
  const [file, loadFile] = useGdriveFile()
  const { createFile } = useGdriveFileCommands()
  const [view, setView] = useState('loading')
  const [user] = useUser()
  useGlobalCommands()

  const [registerCommand, unregisterCommand] = useCommandManager()
  useEffect(() => {
    const commands = [
      {
        id: 'editUsingSourceEditor',
        name: 'Edit using source editor',
        execute: () => {
          setSourceView()
        },
      },
      {
        id: 'editUsingWyswygEditor',
        name: 'Edit using WYSWYG editor',
        execute: () => {
          setEditorView()
        },
      },
    ]

    registerCommand(commands)
    return () => {
      unregisterCommand(commands)
    }
  }, [])

  useEffect(() => {
    const load = async function () {
      await loadGis()
      setAuthenticationView()
    }

    load()
  }, [])

  useEffect(() => {
    if (!user) return

    const googleApi = async function () {
      initializeTokenClient(user.id)
      const googleState = await loadGapi().then(initializeGapiClient).then(parseGoogleState)

      if (StateFromGoogleAction.Open == googleState.action) {
        try {
          await loadFile(googleState.fileId, googleState.userId)
          setViewerView()
        }
        catch (e: unknown) {
          console.error(e)
          setNotificationView('Can\'t load file. ' + e)
        }
      }
      else if (StateFromGoogleAction.New == googleState.action) {
        try {
          createFile({ folderId: googleState.folderId })
          setEditorView()
        }
        catch (e: unknown) {
          console.error(e)
          setNotificationView('Can\'t create file. ' + e)
        }
      }
      else if (StateFromGoogleAction.Install == googleState.action) {
        try {
          await authorizeInstall()
          setNotificationView('Application installed into your google drive successfully.')
        }
        catch (e: unknown) {
          setNotificationView('Can\'t install app into you google drive.' + e)
        }
      }
      else {
        setNotificationView('Unknown action ' + googleState.action)
      }
    }

    googleApi()
  }, [user])

  useEffect(() => {
    if (file) {
      setView('viewer')
    }
  }, [file.id])

  const enableEditMode = () => {
    setEditorView()
  }

  const closeEditMode = () => {
    setViewerView()
  }

  const setEditorView = () => {
    setView('editor')
  }

  const setViewerView = () => {
    setView('viewer')
  }

  const setSourceView = () => {
    setView('source')
  }

  const setNotificationView = (message?: string) => {
    setMessage(message)
    setView('notification')
  }

  const setAuthenticationView = () => {
    setView('authentication')
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
      { view === 'authentication' && <GoogleSSO></GoogleSSO> }
      { view === 'notification' && (
        <NotificationView message={message}>
          <Button onClick={() => executeCommand(openMarkdownFileCmd)}></Button>
        </NotificationView>
      ) }
      { view === 'editor' && <EditorView onCloseClicked={closeEditMode} /> }
      { view === 'source' && <SourceView onCloseClicked={closeEditMode} /> }
      { view === 'viewer' && <ViewerView onEditClicked={enableEditMode} /> }
      { view !== 'loading' && <CommandPalette commands={commands} onItemSelected={item => executeCommand(item.id)}></CommandPalette> }
    </>
  )
}

export default (): React.ReactElement => {
  return (
    <StrictMode>
      <UserContextProvider>
        <GdriveFileContextProvider>
          <CommandsContextProvider>
            <RootView />
          </CommandsContextProvider>
        </GdriveFileContextProvider>
      </UserContextProvider>
    </StrictMode>
  )
}
