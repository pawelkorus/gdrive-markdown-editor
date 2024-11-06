import React, { createContext, useContext, useState, ReactNode } from 'react'

type MenuItem = {
  id: string
  label: string
  action: () => void
}

type NavbarContextType = {
  mainMenuItems: MenuItem[]
  setMainMenuItems: (items: MenuItem[]) => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mainMenuItems, setMainMenuItems] = useState<MenuItem[]>([])

  return (
    <NavbarContext.Provider value={{ mainMenuItems, setMainMenuItems }}>
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
