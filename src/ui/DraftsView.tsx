import React, { useEffect } from 'react'
import { useDraftFiles } from '../service/draftfile'
import { useGdriveFile } from '../service/gdrivefile'
import { useNavigateTo } from '../service/navigate'
import { useMainMenuPanel } from '../service/navbar'
import { Button } from 'react-bootstrap'

export default function (): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const {
    draftFiles,
    discardDraft,
  } = useDraftFiles(fileDetails)
  const { navigateToFileEdit, navigateToFileView } = useNavigateTo()
  const { addPanel, removePanel } = useMainMenuPanel()

  useEffect(() => {
    const panel = (
      <>
        <Button className="me-2" variant="primary" onClick={() => navigateToFileView({ fileId: fileDetails.id })}>View</Button>
        <Button className="me-2" variant="primary" onClick={() => navigateToFileEdit({ fileId: fileDetails.id })}>Edit</Button>
      </>
    )
    addPanel(panel)

    return () => {
      removePanel(panel)
    }
  })

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
