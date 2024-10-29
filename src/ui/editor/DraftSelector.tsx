import React from 'react'
import { FileDetails, useDraftFiles } from '../../service/draftfile'
import { useGdriveFile } from '../../service/gdrivefile'
import { useNavigateTo } from '../../service/navigate'

export type Props = {
  onDraftSelected: (draft: FileDetails) => void
}

export default function DraftSelector(props: Props): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const { draftFiles, discardDraft } = useDraftFiles(fileDetails)
  const { navigateToFileDrafts } = useNavigateTo()

  function onShowAllDraftsClicked() {
    navigateToFileDrafts()
  }

  function onDraftDiscarded(draft: FileDetails) {
    discardDraft(draft.id)
  }

  return (
    <>
      { draftFiles && draftFiles.length == 1 && (
        <div>
          <div className="input-group" role="alert">
            <span className="input-group-text">Draft available:</span>
            <button className="btn btn-outline-primary" onClick={() => props.onDraftSelected(draftFiles[0])}>Use</button>
            <button className="btn btn-outline-danger" onClick={() => onDraftDiscarded(draftFiles[0])}>Discard</button>
          </div>
        </div>
      )}
      { draftFiles && draftFiles.length > 1 && (
        <div>
          <div className="input-group" role="alert">
            <span className="input-group-text">Multiple drafts available:</span>
            <button className="btn btn-outline-primary" onClick={() => props.onDraftSelected(draftFiles[0])}>Use latest</button>
            <button className="btn btn-outline-primary" onClick={() => onShowAllDraftsClicked()}>Show all</button>
          </div>
        </div>
      )}
    </>
  )
}
