import React, { useEffect, useRef } from 'react'
import { useFileCommands, useFile } from '../service/file'
import { useSearchParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useNavigateTo } from '../service/navigate'

export default function (): React.ReactElement {
  const { createFile } = useFileCommands()
  const [file] = useFile()
  const fileId = useRef(file?.id)
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
    if (file?.id != fileId.current) {
      navigateToFileEdit({ fileId: file.id })
    }
  }, [file])

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
