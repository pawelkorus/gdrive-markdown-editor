import { useState, useEffect, useRef } from 'react'
import {
  findFileInAppDirectory,
  deleteFileFromAppDirectory,
  createFileInAppDirectory,
  save,
} from '../../google'
import { FileDetails } from './types'

export const useDraftFiles = (origFileDetails: FileDetails) => {
  const creatingRef = useRef<Promise<string> | null>(null)
  const [draftFiles, setDraftFiles] = useState<FileDetails[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDraftFiles = async () => {
      try {
        setLoading(true)
        const response = await findFileInAppDirectory('draft_' + origFileDetails.id)
        setDraftFiles(response.map(file => ({ ...file, isNew: false })))
      }
      catch (err) {
        if(err instanceof Error) {
          setError(err.message)
        } else {
          setError(JSON.stringify(err))
        }
      }
      finally {
        setLoading(false)
      }
    }

    void fetchDraftFiles()
  }, [])

  const createDraft = async (content: string): Promise<string> => {
    if (creatingRef.current === null) {
      creatingRef.current = (async () => {
        const fileDetails = await createFileInAppDirectory('draft_' + origFileDetails.id)
        await save(fileDetails.id, content)

        setDraftFiles(prevDraftFiles => [...prevDraftFiles, fileDetails])

        return fileDetails.id
      })()
    }
    return creatingRef.current
  }

  const discardDraft = async (draftId: string) => {
    await deleteFileFromAppDirectory(draftId)
    setDraftFiles(prevDraftFiles => prevDraftFiles.filter(draft => draft.id !== draftId))
  }

  return { draftFiles, loading, error, createDraft, discardDraft }
}
