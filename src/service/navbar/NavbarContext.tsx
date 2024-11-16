import React, { createContext, ReactNode, useRef } from 'react'

type NavbarContextState = {
  mainMenuSlot: React.RefObject<HTMLDivElement>
  fileNameSlot: React.RefObject<HTMLDivElement>
}

export const NavbarContext = createContext<NavbarContextState | undefined>(undefined)

export const NavbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mainMenuSlot = useRef<HTMLDivElement>(null)
  const fileNameSlot = useRef<HTMLDivElement>(null)

  return (
    <NavbarContext.Provider value={{ mainMenuSlot, fileNameSlot }}>
      {children}
    </NavbarContext.Provider>
  )
}
