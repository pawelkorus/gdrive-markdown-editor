import { ReactNode, useContext } from 'react'
import { NavbarContext } from './index'
import { createPortal } from 'react-dom'

type MainMenuPanelContextType = {
  addPanel: (panel: ReactNode) => React.ReactPortal
}

const useMainMenuSlot = (): MainMenuPanelContextType => {
  const context = useContext(NavbarContext)

  const addPanel = (panel: ReactNode): React.ReactPortal => {
    return createPortal(panel, context.mainMenuSlot.current)
  }

  return { addPanel }
}

export default useMainMenuSlot
