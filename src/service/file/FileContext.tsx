import React, { PropsWithChildren, useCallback, useState } from 'react'
import type { FileDetailsWithContent } from '@app/storage'
import { useStorageApi } from '../storage'

export interface CreateFileParams {
  folderId: string
  userId?: string
  fileName?: string
}

export interface FileContextState {
  fileDetails: FileDetailsWithContent
  loadFile: (fileId: string, userId?: string) => Promise<void>
  createFile: (params: CreateFileParams) => Promise<void>
  updateContent: (content: string) => Promise<void>
  updateFileName: (fileName: string) => Promise<void>
}

// Create the context
export const FileContext = React.createContext<FileContextState>({
  fileDetails: undefined,
  loadFile: () => { throw Error('FileContext not initialized') },
  createFile: () => { throw Error('FileContext not initialized') },
  updateContent: () => { throw Error('FileContext not initialized') },
  updateFileName: () => { throw Error('FileContext not initialized') },
})

type Props = PropsWithChildren<object>

export function FileContextProvider(props: Props): React.ReactElement {
  const api = useStorageApi()
  const [fileDetails, setFileDetails] = useState<FileDetailsWithContent>({
    id: undefined,
    name: '',
    mimeType: '',
    content: '',
  })

  const loadFile = useCallback(async (fileId: string) => {
    const fileDetails = await api.loadFile(fileId)
    setFileDetails(fileDetails)
  }, [api])

  const updateContent = useCallback(async (content: string) => {
    await api.save(fileDetails.id, content)
    setFileDetails({ ...fileDetails, content })
  }, [api, fileDetails])

  const updateFileName = useCallback(async (fileName: string) => {
    await api.updateFileName(fileDetails.id, fileName)
    setFileDetails({ ...fileDetails, name: fileName })
  }, [api, fileDetails])

  const createFile = useCallback(async (params: CreateFileParams) => {
    const fileDetails = await api.createFile({
      filename: params.fileName || 'New file',
      content: '# Hello world',
      parent: params.folderId,
    })
    setFileDetails(fileDetails)
  }, [api])

  const value = {
    fileDetails,
    loadFile,
    createFile,
    updateContent,
    updateFileName,
  }

  return (
    <FileContext.Provider value={value}>
      {props.children}
    </FileContext.Provider>
  )
}
