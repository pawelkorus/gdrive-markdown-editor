import React, { PropsWithChildren, useCallback, useState } from 'react'
import * as googleApi from '../../google'

export type FileDetails = googleApi.FileDetailsWithContent

export interface CreateFileParams {
  folderId: string
  userId?: string
  fileName?: string
}

export interface GdriveFileContextState {
  fileDetails: FileDetails
  loadFile: (fileId: string, userId?: string) => Promise<void>
  createFile: (params: CreateFileParams) => Promise<void>
  updateContent: (content: string) => Promise<void>
  updateFileName: (fileName: string) => Promise<void>
}

// Create the context
export const GdriveFileContext = React.createContext<GdriveFileContextState>({
  fileDetails: undefined,
  loadFile: () => { throw Error('GdriveFileContext not initialized') },
  createFile: () => { throw Error('GdriveFileContext not initialized') },
  updateContent: () => { throw Error('GdriveFileContext not initialized') },
  updateFileName: () => { throw Error('GdriveFileContext not initialized') },
})

type Props = PropsWithChildren<object>

export function GdriveFileContextProvider(props: Props): React.ReactElement {
  const [fileDetails, setFileDetails] = useState<FileDetails>({
    id: undefined,
    name: '',
    mimeType: '',
    content: '',
  })

  const loadFile = useCallback(async (fileId: string) => {
    const fileDetails = await googleApi.loadFile(fileId)
    setFileDetails(fileDetails)
  }, [])

  const updateContent = useCallback(async (content: string) => {
    await googleApi.save(fileDetails.id, content)
    setFileDetails({ ...fileDetails, content })
  }, [fileDetails])

  const updateFileName = useCallback(async (fileName: string) => {
    await googleApi.updateFileName(fileDetails.id, fileName)
    setFileDetails({ ...fileDetails, name: fileName })
  }, [fileDetails])

  const createFile = useCallback(async (params: CreateFileParams) => {
    const fileDetails = await googleApi.createFile({
      filename: params.fileName || 'New file',
      content: '# Hello world',
      parent: params.folderId,
    })
    setFileDetails(fileDetails)
  }, [])

  const value = {
    fileDetails,
    loadFile,
    createFile,
    updateContent,
    updateFileName,
  }

  return (
    <GdriveFileContext.Provider value={value}>
      {props.children}
    </GdriveFileContext.Provider>
  )
}
