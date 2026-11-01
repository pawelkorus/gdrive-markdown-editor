import { useState, useCallback, useEffect, useRef } from 'react'
import { FileDetails, StorageContext } from '@app/storage'
import { useFile } from '../file'
import { useStorageApi } from '../storage'

export function useDraftFile(draftId: string | undefined) {
  const api = useStorageApi()
  const [origFileDetails] = useFile()
  const creatingRef = useRef<Promise<FileDetails> | null>(null)
  const [draftDetails, setDraftDetails] = useState<FileDetails | null>(null)

  useEffect(() => {
    async function initialize() {
      if (draftId) {
        const draftDetails = await api.loadFile({ fileId: draftId, context: StorageContext.Temp })
        setDraftDetails(draftDetails)
      }
      else {
        const draftDetails = await createNewDraft()
        setDraftDetails(draftDetails)
      }
    }

    void initialize()
  }, [api])

  const select = useCallback(async (newDraftId: string) => {
    const existingDraftDetails = await api.loadFile({ fileId: newDraftId, context: StorageContext.Temp })
    setDraftDetails(existingDraftDetails)
  }, [api])

  const createNewDraft = useCallback(async () => {
    if (creatingRef.current !== null) {
      return creatingRef.current
    }

    creatingRef.current = api.createFile({
      filename: 'draft_' + origFileDetails.id,
      content: origFileDetails.content,
      context: StorageContext.Temp,
    })

    return creatingRef.current
  }, [api, origFileDetails])

  const discard = useCallback(async () => {
    if (draftDetails) {
      await api.deleteFile({ fileId: draftDetails.id, context: StorageContext.Temp })
      setDraftDetails(null)
    }
  }, [api, draftDetails])

  const loadContent = useCallback(async () => {
    if (!draftDetails) throw new Error('Draft not set')

    return (await api.loadFile({ fileId: draftDetails.id, context: StorageContext.Temp })).content
  }, [api, draftDetails])

  const saveContent = useCallback(async (content: string) => {
    if (!draftDetails) throw new Error('Draft not set')

    await api.saveFile({ fileId: draftDetails.id, content, context: StorageContext.Temp })
  }, [api, draftDetails])

  return {
    draftDetails,
    select,
    discard,
    loadContent,
    saveContent,
  }
}
