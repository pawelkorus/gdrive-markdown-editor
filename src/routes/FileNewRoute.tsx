import React, { useEffect } from 'react'
import EditorView from '../ui/EditorView'
import { useGdriveFileCommands } from '../service/gdrivefile'
import { useSearchParams } from 'react-router-dom'

export default function (): React.ReactElement {
  const { createFile } = useGdriveFileCommands()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const createNewFile = async () => {
      const folderId = searchParams.get('folderId')
      await createFile({ folderId })
    }

    createNewFile()
  }, [])

  return (
    <EditorView></EditorView>
  )
}
