import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import useNavbarSlots from './useNavbarSlots'

type UseFileNameSlotAPI = {
  setFilenamePanel: React.Dispatch<React.SetStateAction<ReactNode>>
}

const useFileNameSlot = (): UseFileNameSlotAPI => {
  const { fileNameSlot } = useNavbarSlots()

  const setFileNamePanel = (panel: ReactNode): React.ReactPortal => {
    if (!fileNameSlot.current) {
      throw new Error('Filename slot not available')
    }

    return createPortal(panel, fileNameSlot.current)
  }

  return { setFilenamePanel: setFileNamePanel }
}

export default useFileNameSlot
