import { useState, useEffect, useCallback } from 'react'
import type { FileDetails, FileDetailsWithLink, RecentFileDetails } from '@app/storage'
import { useStorageApi } from '../storage'

export function useFileMetadata(fileId: string): FileDetailsWithLink | null {
  const api = useStorageApi()
  const [fileMetadata, setFileMetadata] = useState<FileDetailsWithLink | null>(null)

  useEffect(() => {
    const fetchFileMetadata = async () => {
      const metadata = await api.getFileMetadata(fileId)
      setFileMetadata(metadata)
    }

    if (fileId) void fetchFileMetadata()
  }, [api, fileId])

  return fileMetadata
}

export function useUploadFile(): (file: File, parentId: string) => Promise<FileDetails> {
  const api = useStorageApi()
  return useCallback((file: File, parentId: string) => api.uploadFileToDrive(file, parentId), [api])
}

export function useRecentFiles(): RecentFileDetails[] {
  const api = useStorageApi()
  const [files, setFiles] = useState<RecentFileDetails[]>([])

  useEffect(() => {
    void api.getUserRecentlyModifiedFiles().then(setFiles)
  }, [api])

  return files
}
