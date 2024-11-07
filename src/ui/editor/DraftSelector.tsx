import React from 'react'
import { FileDetails, useDraftFiles } from '../../service/draftfile'
import { useGdriveFile } from '../../service/gdrivefile'
import { useNavigateTo } from '../../service/navigate'
import { Button } from 'react-bootstrap'
import { Panel } from '../nav'

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
    <Panel>
      { draftFiles && draftFiles.length == 1 && (
        <div>
          <div className="input-group" role="alert">
            <span className="input-group-text">Draft available:</span>
            <Button type="button" variant="outline-primary" onClick={() => props.onDraftSelected(draftFiles[0])}>Use</Button>
            <Button type="button" variant="outline-danger" onClick={() => onDraftDiscarded(draftFiles[0])}>Discard</Button>
          </div>
        </div>
      )}
      { draftFiles && draftFiles.length > 1 && (
        <div>
          <div className="input-group" role="alert">
            <span className="input-group-text">Multiple drafts available:</span>
            <Button type="button" variant="outline-primary" onClick={() => props.onDraftSelected(draftFiles[0])}>Use latest</Button>
            <Button type="button" variant="outline-primary" onClick={() => onShowAllDraftsClicked()}>Show all</Button>
          </div>
        </div>
      )}
    </Panel>
  )
}
