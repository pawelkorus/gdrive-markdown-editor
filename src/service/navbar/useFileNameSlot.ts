import { ReactNode, useContext } from 'react'
import { NavbarContext } from '.'
import { createPortal } from 'react-dom'

type UseFileNameSlotAPI = {
  setFilenamePanel: React.Dispatch<React.SetStateAction<ReactNode>>
}

const useFileNameSlot = (): UseFileNameSlotAPI => {
  const context = useContext(NavbarContext)

  const setFileNamePanel = (panel: ReactNode): React.ReactPortal => {
    if (!context.fileNameSlot) {
      throw new Error('Filename slot not available')
    }

    return createPortal(panel, context.fileNameSlot.current)
  }

  return { setFilenamePanel: setFileNamePanel }
}

export default useFileNameSlot
