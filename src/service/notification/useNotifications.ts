import { createPortal } from 'react-dom'
import useNotificationSlots from './useNotificationSlots'
import { ReactNode } from 'react'

interface MainMenuPanelContextType {
  addNotification: (notification: ReactNode) => React.ReactPortal
}

const useNotifications = (): MainMenuPanelContextType => {
  const { mainNotificationsSlot } = useNotificationSlots()

  const addNotification = (notification: ReactNode): React.ReactPortal => {
    if (!mainNotificationsSlot.current) {
      throw new Error('Notifiations slot is not available')
    }

    return createPortal(notification, mainNotificationsSlot.current)
  }

  return { addNotification }
}

export default useNotifications
