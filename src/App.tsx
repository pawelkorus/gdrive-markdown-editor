import React, { StrictMode } from 'react'
import {
  HomeView,
  EditorView,
  ViewerView,
  ErrorView,
  DraftsView,
  RootView,
  SettingsView,
} from '@app/ui'
import { CommandsContextProvider } from '@app/service/command'
import { FileContextProvider } from '@app/service/file/FileContext'
import { AppConfigProvider } from '@app/service/appconfig'
import { UserContextProvider } from '@app/service/user'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import { FileNewRoute, FileRoute } from '@app/routes'
import { NavbarProvider } from '@app/service/navbar'
import { CommandPaletteProvider } from '@app/ui/commandPalette'
import { StorageApiProvider } from '@app/service/storage'
import { googleDriveApi } from '@app/google'
import { NotificationProvider } from '@app/service/notification'

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
        path: 'settings',
        element: <SettingsView />,
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
      <StorageApiProvider api={googleDriveApi}>
        <UserContextProvider>
          <AppConfigProvider>
            <FileContextProvider>
              <CommandsContextProvider>
                <CommandPaletteProvider>
                  <NotificationProvider>
                    <NavbarProvider>
                      <RouterProvider router={router} />
                    </NavbarProvider>
                  </NotificationProvider>
                </CommandPaletteProvider>
              </CommandsContextProvider>
            </FileContextProvider>
          </AppConfigProvider>
        </UserContextProvider>
      </StorageApiProvider>
    </StrictMode>
  )
}
