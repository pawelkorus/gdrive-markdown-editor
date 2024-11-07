import React, { createContext, useContext, useState, ReactNode } from 'react'

type MenuItem = {
  id: string
  label: string
  action: () => void
}

type NavbarContextType = {
  mainMenuItems: MenuItem[]
  setMainMenuItems: (items: MenuItem[] | ((prevItems: MenuItem[]) => MenuItem[])) => void
  panels: ReactNode[]
  setPanels: (panels: ReactNode[] | ((prevPanels: ReactNode[]) => ReactNode[])) => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mainMenuItems, setMainMenuItems] = useState<MenuItem[]>([])
  const [panels, setPanels] = useState<ReactNode[]>([])

  return (
    <NavbarContext.Provider value={{ mainMenuItems, setMainMenuItems, panels, setPanels }}>
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

export const useMainMenuPanel = ():MainMenuPanelContextType => {
  const context = useContext(NavbarContext)

  const addPanel = (panel: ReactNode) => {
    context.setPanels( (prev:ReactNode[]) => [...prev, panel])
  }

  const removePanel = (panel: ReactNode) => {
    context.setPanels((prev:ReactNode[]) => prev.filter(p => p !== panel))
  }

  return { panels: context.panels, addPanel, removePanel }
}
