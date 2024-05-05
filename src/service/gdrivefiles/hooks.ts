import { useState, useEffect } from 'react'
import { getFileMetadata, FileDetailsWithLink } from '../../google'

export function useGdriveFileMetadata(fileId: string): FileDetailsWithLink | null {
  const [fileMetadata, setFileMetadata] = useState<FileDetailsWithLink | null>(null)

  useEffect(() => {
    const fetchFileMetadata = async () => {
      const metadata = await getFileMetadata(fileId)
      setFileMetadata(metadata)
    }

    fetchFileMetadata()
  }, [fileId])

  return fileMetadata
}
