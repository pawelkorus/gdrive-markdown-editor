import React, { ReactNode } from 'react'
import { NotificationContext } from './NotificationContext'

export default ({ children }: { children: ReactNode }) => {
  const mainNotificationsSlot = React.useRef<HTMLDivElement>(null)

  return (
    <NotificationContext.Provider value={{ mainNotificationsSlot }}>
      {children}
      <div ref={mainNotificationsSlot} className="toast-container p-3 bottom-0 end-0 ">
      </div>
    </NotificationContext.Provider>
  )
}
