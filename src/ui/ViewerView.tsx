import React from 'react'
import { MilkdownEditor, WrapWithProviders } from '@app/ui/milkdown'
import { useGdriveFile } from '@app/service/gdrivefile'
import { useNavigateTo } from '@app/service/navigate'
import { Panel, PanelButton } from '@app/ui/nav'
import { useMainMenuSlot } from '@app/service/navbar'

function ViewerView(): React.ReactElement {
  const [fileDetails] = useGdriveFile()
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

export default function (): React.ReactElement {
  return <WrapWithProviders><ViewerView /></WrapWithProviders>
}
