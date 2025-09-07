import React from 'react'
import { FileDetails, useDraftFiles } from '@app/service/draftfile'
import { useGdriveFile } from '@app/service/gdrivefile'
import { useNavigateTo } from '@app/service/navigate'
import { Button } from 'react-bootstrap'
import { Panel } from '@app/ui/nav'

export interface Props {
  onDraftSelected: (draft: FileDetails) => void
}

export default function DraftSelector(props: Props): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const { draftFiles, discardDraft } = useDraftFiles(fileDetails)
  const { navigateToFileDrafts } = useNavigateTo()

  function onShowAllDraftsClicked() {
    navigateToFileDrafts()
  }

  async function onDraftDiscarded(draft: FileDetails) {
    await discardDraft(draft.id)
  }

  return (
    <Panel>
      { draftFiles && draftFiles.length == 1 && (
        <div className="input-group" role="alert">
          <span className="input-group-text">Draft available:</span>
          <Button type="button" variant="outline-primary" onClick={() => props.onDraftSelected(draftFiles[0])}>Use</Button>
          <Button type="button" variant="outline-danger" onClick={() => { void onDraftDiscarded(draftFiles[0]) }}>Discard</Button>
        </div>
      )}
      { draftFiles && draftFiles.length > 1 && (
        <div className="input-group" role="alert">
          <span className="input-group-text">Multiple drafts available:</span>
          <Button type="button" variant="outline-primary" onClick={() => props.onDraftSelected(draftFiles[0])}>Use latest</Button>
          <Button type="button" variant="outline-primary" onClick={() => onShowAllDraftsClicked()}>Show all</Button>
        </div>
      )}
    </Panel>
  )
}
