import { useState, useCallback, useEffect, useRef } from 'react'
import { FileDetails } from './types'
import { useGdriveFile } from '../gdrivefile'
import * as googleApi from '../../google'

export function useDraftFile(draftId: string | undefined) {
  const [origFileDetails] = useGdriveFile()
  const creatingRef = useRef<Promise<FileDetails> | null>(null)
  const [draftDetails, setDraftDetails] = useState<FileDetails | null>(null)

  useEffect(() => {
    async function initialize() {
      if (draftId) {
        const draftDetails = await googleApi.loadFile(draftId)
        setDraftDetails(draftDetails)
      }
      else {
        const draftDetails = await createNewDraft()
        setDraftDetails(draftDetails)
      }
    }

    initialize()
  }, [])

  const select = useCallback(async (newDraftId: string) => {
    const existingDraftDetails = await googleApi.loadFile(newDraftId)
    setDraftDetails(existingDraftDetails)
  }, [])

  const createNewDraft = useCallback(async () => {
    if (creatingRef.current) {
      return creatingRef.current
    }

    creatingRef.current = (async () => {
      const draftDetails = await googleApi.createFileInAppDirectory('draft_' + origFileDetails.id)
      await googleApi.save(draftDetails.id, origFileDetails.content)
      return { ...draftDetails, content: origFileDetails.content }
    })()

    return creatingRef.current
  }, [origFileDetails])

  const discard = useCallback(async () => {
    if (draftDetails) {
      await googleApi.deleteFileFromAppDirectory(draftDetails.id)
      setDraftDetails(null)
    }
  }, [draftDetails])

  const loadContent = useCallback(async () => {
    if (!draftDetails) throw new Error('Draft not set')

    return (await googleApi.loadFile(draftDetails.id)).content
  }, [draftDetails])

  const saveContent = useCallback(async (content: string) => {
    if (!draftDetails) throw new Error('Draft not set')

    await googleApi.save(draftDetails.id, content)
  }, [draftDetails])

  return {
    draftDetails,
    select,
    discard,
    loadContent,
    saveContent,
  }
}
