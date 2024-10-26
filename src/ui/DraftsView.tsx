import React from 'react'
import { useDraftFiles } from '../service/draftfile'
import { useGdriveFile } from '../service/gdrivefile'

export default function (): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const {
    draftFiles,
  } = useDraftFiles(fileDetails)

  return (
    <div className="container-lg mt-4">
      <div className="row">
        {draftFiles.length === 0 && (
          <div className="alert alert-info" role="alert">
            No drafts available.
          </div>
        )}
        { draftFiles.length > 0 && (
          <div className="list-group">
            {draftFiles.map(draftFile => (
              <div key={draftFile.id} className="list-group-item list-group-item-action">
                {draftFile.id}
                <button className="btn btn-outline-primary">Use</button>
                <button className="btn btn-outline-danger">Discard</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
