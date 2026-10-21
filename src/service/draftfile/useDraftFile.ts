import { useState, useCallback, useEffect, useRef } from 'react'
import { FileDetails } from '@app/storage'
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
        const draftDetails = await api.loadFile(draftId)
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
    const existingDraftDetails = await api.loadFile(newDraftId)
    setDraftDetails(existingDraftDetails)
  }, [api])

  const createNewDraft = useCallback(async () => {
    if (creatingRef.current !== null) {
      return creatingRef.current
    }

    creatingRef.current = (async () => {
      const draftDetails = await api.createFileInAppDirectory('draft_' + origFileDetails.id)
      await api.save(draftDetails.id, origFileDetails.content)
      return { ...draftDetails, content: origFileDetails.content }
    })()

    return creatingRef.current
  }, [api, origFileDetails])

  const discard = useCallback(async () => {
    if (draftDetails) {
      await api.deleteFileFromAppDirectory(draftDetails.id)
      setDraftDetails(null)
    }
  }, [api, draftDetails])

  const loadContent = useCallback(async () => {
    if (!draftDetails) throw new Error('Draft not set')

    return (await api.loadFile(draftDetails.id)).content
  }, [api, draftDetails])

  const saveContent = useCallback(async (content: string) => {
    if (!draftDetails) throw new Error('Draft not set')

    await api.save(draftDetails.id, content)
  }, [api, draftDetails])

  return {
    draftDetails,
    select,
    discard,
    loadContent,
    saveContent,
  }
}
