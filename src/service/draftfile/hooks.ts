import { useCallback, useEffect, useState } from 'react'
import * as googleApi from '../../google'

type FileDetails = googleApi.FileDetails

type DraftFileDetails = FileDetails & {
  isNew: boolean
}

type DraftFileApi = {
  fileDetails: DraftFileDetails | null
  loadContent: () => Promise<string>
  updateContent: (content: string) => Promise<void>
  discard: () => Promise<void>
}

export function useDraftFileNotContext(origFileDetails:FileDetails): DraftFileApi {
  const [fileDetails, setFileDetails] = useState<DraftFileDetails | null>(null)

  useEffect(() => {
    const initialize = async () => {
      const existingFile = await googleApi.findFileInAppDirectory("draft_" + origFileDetails.name)
      if (existingFile) {
        setFileDetails({ ...existingFile, isNew: false })
      } else {
        const fileDetails = await googleApi.createFileInAppDirectory("draft_" + origFileDetails.name, "")
        setFileDetails({ ...fileDetails, isNew: true })
      }
    }
    initialize()
  }, [origFileDetails])

  const loadContent = useCallback(async (): Promise<string> => {
    if (!fileDetails) {
      return ''
    }
    const fileDetailsWithContent = await googleApi.loadFile(fileDetails.id)
    return fileDetailsWithContent.content
  }, [fileDetails]) 

  const updateContent = useCallback(async (content: string) => {
    await googleApi.save(fileDetails.id, content)
  }, [fileDetails])

  const discard = useCallback(async () => {
    await googleApi.deleteFileFromAppDirectory(fileDetails.id)
  }, [fileDetails])

  return {
    fileDetails,
    loadContent,
    updateContent,
    discard,
  }
}
