import { SetStateAction, useContext } from 'react'
import { CommandPaletteContext } from './CommandPaletteContext'

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext)

  const toggleVisibility = (v?: SetStateAction<boolean>) => {
    if (v === undefined) {
      context.setIsVisible(prev => !prev)
    }
    else {
      context.setIsVisible(v)
    }
  }

  if (!context) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider')
  }

  return { isVisible: context.isVisible, toggleVisibility: toggleVisibility }
}
