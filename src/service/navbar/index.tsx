import React, { createContext, useContext, useState, ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'

type NavbarContextType = {
  filenamePanel: ReactNode | null
  setFilenamePanel: React.Dispatch<React.SetStateAction<ReactNode | null>>
  mainMenuSlot: React.RefObject<HTMLDivElement>
  fileNameSlot: React.RefObject<HTMLDivElement>
}

export const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filenamePanel, setFilenamePanel] = useState<ReactNode | null>(null)
  const mainMenuSlot = useRef<HTMLDivElement>(null)
  const fileNameSlot = useRef<HTMLDivElement>(null)

  return (
    <NavbarContext.Provider value={{ filenamePanel, setFilenamePanel, mainMenuSlot, fileNameSlot }}>
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
  filenamePanel: ReactNode | null
  setFilenamePanel: React.Dispatch<React.SetStateAction<ReactNode>>
  unsetFileNamePanel: () => void
}

export const useFilenamePanel = (): FilenamePanelContextType => {
  const context = useContext(NavbarContext)

  const unsetFileNamePanel = () => {
    context.setFilenamePanel(null)
  }

  return { filenamePanel: context.filenamePanel, setFilenamePanel: context.setFilenamePanel, unsetFileNamePanel }
}
