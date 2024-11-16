import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import useNavbarSlots from './useNavbarSlots'

type MainMenuPanelContextType = {
  addPanel: (panel: ReactNode) => React.ReactPortal
}

const useMainMenuSlot = (): MainMenuPanelContextType => {
  const { mainMenuSlot } = useNavbarSlots()

  const addPanel = (panel: ReactNode): React.ReactPortal => {
    if (!mainMenuSlot.current) {
      throw new Error('Navbar main menu slot is not available')
    }

    return createPortal(panel, mainMenuSlot.current)
  }

  return { addPanel }
}

export default useMainMenuSlot
