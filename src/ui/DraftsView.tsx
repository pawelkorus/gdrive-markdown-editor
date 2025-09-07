import React from 'react'
import { useDraftFiles } from '../service/draftfile'
import { useGdriveFile } from '../service/gdrivefile'
import { useNavigateTo } from '../service/navigate'
import { useMainMenuSlot } from '../service/navbar'
import { Panel, PanelButton } from './nav'

export default function (): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const {
    draftFiles,
    discardDraft,
  } = useDraftFiles(fileDetails)
  const { navigateToFileEdit, navigateToFileView } = useNavigateTo()
  const { addPanel } = useMainMenuSlot()

  const onUseDraft = (draftId: string) => {
    navigateToFileEdit({ fileId: fileDetails.id, draftId: draftId })
  }

  const onDiscardDraft = async (draftId: string) => {
    await discardDraft(draftId)
  }

  return (
    <div className="container-lg mt-4">
      { addPanel(
        <Panel>
          <PanelButton variant="primary" onClick={() => navigateToFileView({ fileId: fileDetails.id })}>View</PanelButton>
          <PanelButton variant="primary" onClick={() => navigateToFileEdit({ fileId: fileDetails.id })}>Edit</PanelButton>
        </Panel>,
      ) }
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
                <button className="btn btn-outline-danger" onClick={ () => { void onDiscardDraft(draftFile.id) }}>Discard</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
