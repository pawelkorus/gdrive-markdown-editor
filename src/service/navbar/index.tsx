import React, { createContext, useContext, ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'

type NavbarContextType = {
  mainMenuSlot: React.RefObject<HTMLDivElement>
  fileNameSlot: React.RefObject<HTMLDivElement>
}

export const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mainMenuSlot = useRef<HTMLDivElement>(null)
  const fileNameSlot = useRef<HTMLDivElement>(null)

  return (
    <NavbarContext.Provider value={{ mainMenuSlot, fileNameSlot }}>
      {children}
    </NavbarContext.Provider>
  )
}

type MainMenuPanelContextType = {
  addPanel: (panel: ReactNode) => React.ReactPortal
}

export const useMainMenuPanel = (): MainMenuPanelContextType => {
  const context = useContext(NavbarContext)

  const addPanel = (panel: ReactNode): React.ReactPortal => {
    return createPortal(panel, context.mainMenuSlot.current)
  }

  return { addPanel }
}

type FilenamePanelContextType = {
  setFilenamePanel: React.Dispatch<React.SetStateAction<ReactNode>>
}

export const useFilenamePanel = (): FilenamePanelContextType => {
  const context = useContext(NavbarContext)

  const setFilenamePanel = (panel: ReactNode): React.ReactPortal => {
    if (!context.fileNameSlot) {
      throw new Error('Filename slot not available')
    }

    return createPortal(panel, context.fileNameSlot.current)
  }

  return { setFilenamePanel }
}
