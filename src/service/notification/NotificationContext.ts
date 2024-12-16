import React, { createContext } from 'react'

interface NotificationContextType {
  mainNotificationsSlot: React.RefObject<HTMLDivElement>
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)
