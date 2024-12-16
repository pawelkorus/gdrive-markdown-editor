import React, { StrictMode } from 'react'
import {
  HomeView,
  EditorView,
  ViewerView,
  ErrorView,
  DraftsView,
  RootView,
} from '@app/ui'
import { CommandsContextProvider } from '@app/service/command'
import { GdriveFileContextProvider } from '@app/service/gdrivefile/GdriveFileContext'
import { UserContextProvider } from '@app/service/user'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import { FileNewRoute, FileRoute } from '@app/routes'
import { NavbarProvider } from '@app/service/navbar'
import { CommandPaletteProvider } from '@app/ui/commandPalette'
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
            <CommandPaletteProvider>
              <NotificationProvider>
                <NavbarProvider>
                  <RouterProvider router={router} />
                </NavbarProvider>
              </NotificationProvider>
            </CommandPaletteProvider>
          </CommandsContextProvider>
        </GdriveFileContextProvider>
      </UserContextProvider>
    </StrictMode>
  )
}
