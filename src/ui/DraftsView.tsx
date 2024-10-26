import React from 'react'
import { useDraftFiles } from '../service/draftfile'
import { useGdriveFile } from '../service/gdrivefile'
import { useNavigateTo } from '../service/navigate'

export default function (): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const {
    draftFiles,
    discardDraft,
  } = useDraftFiles(fileDetails)
  const { navigateToFileEdit } = useNavigateTo()

  const onUseDraft = (draftId: string) => {
    navigateToFileEdit({ fileId: fileDetails.id, draftId: draftId })
  }

  const onDiscardDraft = (draftId: string) => {
    discardDraft(draftId)
  }

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
                <button className="btn btn-outline-primary" onClick={() => onUseDraft(draftFile.id)}>Use</button>
                <button className="btn btn-outline-danger" onClick={() => onDiscardDraft(draftFile.id)}>Discard</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
