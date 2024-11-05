import React, { useEffect } from 'react'
import { MilkdownEditor, WrapWithProviders } from './milkdown'
import { useGdriveFile } from '../service/gdrivefile'
import { useNavigateTo } from '../service/navigate'
import { useMenu } from '../service/menu'

function ViewerView(): React.ReactElement {
  const [fileDetails] = useGdriveFile()
  const [, setMenuItems] = useMenu()
  const { navigateToFileEdit } = useNavigateTo()

  useEffect(() => {
    setMenuItems([{ id: 'edit', label: 'Edit', action: () => navigateToFileEdit() }])

    return () => {
      setMenuItems([])
    }
  }, [])

  return (
    <div className="container-lg mt-4">
      <div className="row">
        <MilkdownEditor content={fileDetails.content} readonly={true} />
      </div>
    </div>
  )
}

export default function (): React.ReactElement {
  return <WrapWithProviders><ViewerView /></WrapWithProviders>
}
