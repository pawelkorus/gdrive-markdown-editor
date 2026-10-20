import React from 'react'
import { MilkdownEditor } from '@app/ui/milkdown-editor'
import { useFile } from '@app/service/file'
import { useNavigateTo } from '@app/service/navigate'
import { Panel, PanelButton } from '@app/ui/nav'
import { useMainMenuSlot } from '@app/service/navbar'

export default function ViewerView(): React.ReactElement {
  const [fileDetails] = useFile()
  const { addPanel } = useMainMenuSlot()
  const { navigateToFileEdit, navigateToFileSource } = useNavigateTo()

  return (
    <div className="container-lg mt-4">
      {addPanel(
        <Panel>
          <PanelButton onClick={() => navigateToFileEdit()}>Edit</PanelButton>
          <PanelButton onClick={() => navigateToFileSource()}>Edit source</PanelButton>
        </Panel>,
      )}
      <div className="row">
        <MilkdownEditor content={fileDetails.content} readonly={true} />
      </div>
    </div>
  )
}
