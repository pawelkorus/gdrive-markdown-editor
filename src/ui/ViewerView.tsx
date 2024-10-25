import React from 'react'
import { MilkdownEditor, WrapWithProviders } from './milkdown'
import { useGdriveFile } from '../service/gdrivefile'
import { useNavigateTo } from '../service/navigate'

function ViewerView(): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const { navigateToFileEdit } = useNavigateTo()

  return (
    <div>
      <div className="container-fluid p-2">
        <div className="d-flex flex-row">
          <div className="me-auto me-2"></div>
          <button onClick={() => navigateToFileEdit()} className="btn btn-primary ms-1">Edit</button>
        </div>
      </div>

      <div className="container-lg mt-4">
        <div className="row">
          <MilkdownEditor content={fileDetails.content} readonly={true} />
        </div>
      </div>
    </div>
  )
}

export default function (): React.ReactElement {
  return <WrapWithProviders><ViewerView /></WrapWithProviders>
}
