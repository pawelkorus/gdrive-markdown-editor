import { useState, useEffect } from 'react'
import { getFileMetadata, uploadFileToDrive, FileDetails, FileDetailsWithLink } from '@app/google'

export function useFileMetadata(fileId: string): FileDetailsWithLink | null {
  const [fileMetadata, setFileMetadata] = useState<FileDetailsWithLink | null>(null)

  useEffect(() => {
    const fetchFileMetadata = async () => {
      const metadata = await getFileMetadata(fileId)
      setFileMetadata(metadata)
    }

    if (fileId) void fetchFileMetadata()
  }, [fileId])

  return fileMetadata
}

export function useUploadFile(): (file: File, parentId: string) => Promise<FileDetails> {
  return uploadFileToDrive
}
