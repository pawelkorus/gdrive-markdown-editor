import { useState, useEffect } from 'react'
import { findFileInAppDirectory, deleteFileFromAppDirectory, createFileInAppDirectory, loadFile, save } from '../../google'
import { FileDetails, DraftFileDetails } from './types'

interface UseDraftFilesAPI {
  draftFiles: DraftFileDetails[]
  selectedDraft: DraftFileDetails | null
  loading: boolean
  error: string | null
  createDraft: (content:string) => Promise<void>
  discardDraft: (draftId: string) => Promise<void>
  loadDraftContent: (draftId: string) => Promise<string>
  saveDraftContent: (draftId: string, content: string) => Promise<void>
  useDraft: (draftId: string) => Promise<void>
}

export const useDraftFiles = (origFileDetails: FileDetails): UseDraftFilesAPI => {
  const [draftFiles, setDraftFiles] = useState<DraftFileDetails[]>([])
  const [selectedDraft, setSelectedDraft] = useState<DraftFileDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDraftFiles = async () => {
      try {
        setLoading(true)
        const response = await findFileInAppDirectory('draft_' + origFileDetails.id)
        setDraftFiles(response.map(file => ({ ...file, isNew: false })))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDraftFiles()
  }, [])

  const createDraft = async (content:string):Promise<void> => {
    if(selectedDraft) {
      return
    }
    const fileDetails = await createFileInAppDirectory("draft_" + origFileDetails.id, content)
    save(fileDetails.id, content)
    const draftFileDetails = { ...fileDetails, isNew: true }
    setSelectedDraft(draftFileDetails)
  }
  
  const discardDraft = async (draftId: string) => {
    await deleteFileFromAppDirectory(draftId)
    setDraftFiles(prevDraftFiles => prevDraftFiles.filter(draft => draft.id !== draftId))
  }

  const useDraft = async (draftId:string) => {
    if(selectedDraft) {
      if(selectedDraft.isNew) {
        await discardDraft(selectedDraft.id)
      }
    }
    
    const draft = draftFiles.find(draft => draft.id === draftId)
    if(draft) {
      setSelectedDraft(draft)
    } else {
      throw new Error('Draft not found')
    }

    setDraftFiles(prevDraftFiles => prevDraftFiles.filter(draft => draft.id !== draftId))
  }

  const loadDraftContent = async (draftId: string): Promise<string> => {
    const draft = selectedDraft? selectedDraft : draftFiles.find(draft => draft.id === draftId)
    if (!draft) {
      throw new Error('Draft not found')
    }
    const fileDetailsWithContent = await loadFile(draftId)
    return fileDetailsWithContent.content
  }

  const saveDraftContent = async (draftId: string, content: string): Promise<void> => {
    const draft = selectedDraft? selectedDraft : draftFiles.find(draft => draft.id === draftId)
    if (!draft) {
      throw new Error('Draft not found')
    }
    await save(draftId, content)
  }

  return { draftFiles, selectedDraft, loading, error, createDraft, discardDraft, loadDraftContent, saveDraftContent, useDraft }
}
