import React, { useEffect, useState } from 'react'
import { getUserRecentlyModifiedFiles } from '../google'
import { useNavigateTo } from '../service/navigate'

const InstalledView = (): React.ReactElement => {
  const [files, setFiles] = useState<{ id: string, name: string, mimeType: string, viewedByMeTime: string }[]>([])
  const { navigateToFileEdit, navigateToFileSource, navigateToFileView } = useNavigateTo()

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await getUserRecentlyModifiedFiles()
      setFiles(files)
    }

    fetchFiles()
  }, [])

  const handleNavigateToFileEdit = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    navigateToFileEdit({ fileId })
  }

  const handleNavigateToFileSource = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    navigateToFileSource({ fileId })
  }

  return (
    <div className="container-lg mt-4">
      <div className="row content">
        <h1>Recently accessed files</h1>
        <div className="list-group">
          {files.map(file => (
            <div key={file.id} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 flex-row">
                <div className="w-100" onClick={() => navigateToFileView({ fileId: file.id })}>
                  <h5 className="mb-1">{file.name}</h5>
                  <small>{file.viewedByMeTime}</small>
                </div>
                <div className="input-group justify-content-end">
                  <button className="btn btn-outline-primary" onClick={e => handleNavigateToFileEdit(e, file.id)}>Edit</button>
                  <button className="btn btn-outline-primary" onClick={e => handleNavigateToFileSource(e, file.id)}>Edit source</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InstalledView
