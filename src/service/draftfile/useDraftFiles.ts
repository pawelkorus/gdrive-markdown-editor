import { useState, useEffect, useRef } from 'react'
import { useStorageApi } from '../storage'
import { FileDetails, StorageContext } from '@app/storage'


export const useDraftFiles = (origFileDetails: FileDetails) => {
  const api = useStorageApi()
  const creatingRef = useRef<Promise<string> | null>(null)
  const [draftFiles, setDraftFiles] = useState<FileDetails[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDraftFiles = async () => {
      try {
        setLoading(true)
        const response = await api.findFiles({
          filename: 'draft_' + origFileDetails.id,
          context: StorageContext.Temp,
        })
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
  }, [api, origFileDetails.id])

  const createDraft = async (content: string): Promise<string> => {
    if (creatingRef.current === null) {
      creatingRef.current = (async () => {
        const fileDetails = await api.createFile({
          filename: 'draft_' + origFileDetails.id,
          content,
          context: StorageContext.Temp,
        })

        setDraftFiles(prevDraftFiles => [...prevDraftFiles, fileDetails])

        return fileDetails.id
      })()
    }
    return creatingRef.current
  }

  const discardDraft = async (draftId: string) => {
    await api.deleteFile({ fileId: draftId, context: StorageContext.Temp })
    setDraftFiles(prevDraftFiles => prevDraftFiles.filter(draft => draft.id !== draftId))
  }

  return { draftFiles, loading, error, createDraft, discardDraft }
}
