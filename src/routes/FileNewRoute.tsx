import React, { useEffect, useRef } from 'react'
import { useGdriveFileCommands, useGdriveFile } from '../service/gdrivefile'
import { useSearchParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useNavigateTo } from '../service/navigate'

export default function (): React.ReactElement {
  const { createFile } = useGdriveFileCommands()
  const [gdriveFile] = useGdriveFile()
  const gdriveFileId = useRef(gdriveFile?.id)
  const [searchParams] = useSearchParams()
  const { navigateToFileEdit } = useNavigateTo()

  useEffect(() => {
    const createNewFile = async () => {
      const folderId = searchParams.get('folderId')
      await createFile({ folderId })
    }

    void createNewFile()
  }, [])

  useEffect(() => {
    if (gdriveFile?.id != gdriveFileId.current) {
      navigateToFileEdit({ fileId: gdriveFile.id })
    }
  }, [gdriveFile])

  return (
    <div className="container-fluid h-100 d-flex">
      <div className="mx-auto my-auto">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    </div>
  )
}
