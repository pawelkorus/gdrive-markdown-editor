import { useContext } from 'react'
import { CreateFileParams, FileContext } from './FileContext'
import { FileDetailsWithContent } from '@app/storage'

export function useFile(): [FileDetailsWithContent, (fileId: string, userId?: string) => Promise<void>] {
  const fileContext = useContext(FileContext)

  return [fileContext.fileDetails, fileContext.loadFile]
}

interface FileCommands {
  createFile: (params: CreateFileParams) => Promise<void>
  updateContent: (newContent: string) => Promise<void>
  updateFileName: (newName: string) => Promise<void>
}

export function useFileCommands(): FileCommands {
  const fileContext = useContext(FileContext)

  return {
    createFile: fileContext.createFile,
    updateContent: fileContext.updateContent,
    updateFileName: fileContext.updateFileName,
  }
}
