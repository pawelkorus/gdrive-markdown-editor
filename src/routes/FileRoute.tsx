import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useFile } from '@app/service/file'
import { useCommandManager } from '@app/service/command'
import { useNavigateTo, useFileViewParams } from '@app/service/navigate'
import { Spinner } from 'react-bootstrap'

export default function (): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const fileParams = useFileViewParams()
  const [, loadFile] = useFile()
  const [registerCommand, unregisterCommand] = useCommandManager()
  const { navigateToFileEdit, navigateToFileSource } = useNavigateTo()

  useEffect(() => {
    const commands = [
      {
        id: 'editUsingSourceEditor',
        name: 'Edit using source editor',
        execute: () => {
          navigateToFileSource()
        },
      },
      {
        id: 'editUsingWyswygEditor',
        name: 'Edit using WYSWYG editor',
        execute: () => {
          navigateToFileEdit()
        },
      },
    ]

    registerCommand(commands)
    return () => {
      unregisterCommand(commands)
    }
  }, [])

  useEffect(() => {
    async function initialize() {
      await loadFile(fileParams.fileId, fileParams.userId)
      setLoading(false)
    }

    void initialize()
  }, [fileParams.fileId, fileParams.userId])

  if (loading) return (
    <div className="container-fluid h-100 d-flex">
      <div className="mx-auto my-auto">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    </div>
  )

  return (
    <Outlet></Outlet>
  )
}
