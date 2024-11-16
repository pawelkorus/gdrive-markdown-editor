import { useContext } from 'react'
import { NavbarContext } from './NavbarContext'

export default () => {
  const context = useContext(NavbarContext)

  return { mainMenuSlot: context.mainMenuSlot, fileNameSlot: context.fileNameSlot }
}
