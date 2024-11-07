import React, { createContext, useContext, useState, ReactNode } from 'react'

type MenuItem = {
  id: string
  label: string
  action: () => void
}

type NavbarContextType = {
  mainMenuItems: MenuItem[]
  setMainMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>
  panels: ReactNode[]
  setPanels: React.Dispatch<React.SetStateAction<ReactNode[]>>
  filenamePanel: ReactNode | null
  setFilenamePanel: React.Dispatch<React.SetStateAction<ReactNode | null>>
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mainMenuItems, setMainMenuItems] = useState<MenuItem[]>([])
  const [panels, setPanels] = useState<ReactNode[]>([])
  const [filenamePanel, setFilenamePanel] = useState<ReactNode | null>(null)

  return (
    <NavbarContext.Provider value={{ mainMenuItems, setMainMenuItems, panels, setPanels, filenamePanel, setFilenamePanel }}>
      {children}
    </NavbarContext.Provider>
  )
}

export const useMainMenu = (): [MenuItem[], (items: MenuItem[]) => void] => {
  const context = useContext(NavbarContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }

  return [context.mainMenuItems, context.setMainMenuItems]
}

type MainMenuPanelContextType = {
  panels: ReactNode[]
  addPanel: (panel: ReactNode) => void
  removePanel: (panel: ReactNode) => void
}

export const useMainMenuPanel = (): MainMenuPanelContextType => {
  const context = useContext(NavbarContext)

  const addPanel = (panel: ReactNode) => {
    context.setPanels((prev: ReactNode[]) => [...prev, panel])
  }

  const removePanel = (panel: ReactNode) => {
    context.setPanels((prev: ReactNode[]) => prev.filter(p => p !== panel))
  }

  return { panels: context.panels, addPanel, removePanel }
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
