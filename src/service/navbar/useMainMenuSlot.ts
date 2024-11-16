import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import useNavbarSlots from './useNavbarSlots'

type MainMenuPanelContextType = {
  addPanel: (panel: ReactNode) => React.ReactPortal
}

const useMainMenuSlot = (): MainMenuPanelContextType => {
  const { mainMenuSlot } = useNavbarSlots()

  const addPanel = (panel: ReactNode): React.ReactPortal => {
    return createPortal(panel, mainMenuSlot.current)
  }

  return { addPanel }
}

export default useMainMenuSlot
