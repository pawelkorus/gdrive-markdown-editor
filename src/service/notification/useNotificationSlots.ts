import { useContext } from 'react'
import { NotificationContext } from './NotificationContext'

const useNotificationSlots = () => {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotificationSlot must be used within a NotificationProvider')
  }

  return { mainNotificationsSlot: context.mainNotificationsSlot }
}

export default useNotificationSlots
