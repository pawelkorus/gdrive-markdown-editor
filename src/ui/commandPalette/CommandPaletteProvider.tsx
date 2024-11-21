import React, { PropsWithChildren, useState } from 'react'
import { CommandPaletteContext } from './CommandPaletteContext'

export function CommandPaletteProvider({ children }: PropsWithChildren): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <CommandPaletteContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </CommandPaletteContext.Provider>
  )
};
