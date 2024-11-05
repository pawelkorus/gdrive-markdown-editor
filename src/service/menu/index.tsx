import React, { createContext, useContext, useState, ReactNode } from 'react'

type MenuItem = {
  id: string
  label: string
  action: () => void
}

type MenuContextType = {
  menuItems: MenuItem[]
  setMenuItems: (items: MenuItem[]) => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  return (
    <MenuContext.Provider value={{ menuItems, setMenuItems }}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = (): [MenuItem[], (items: MenuItem[]) => void] => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }

  return [context.menuItems, context.setMenuItems]
}
