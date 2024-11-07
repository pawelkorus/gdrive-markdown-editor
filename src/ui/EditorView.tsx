import React, { useCallback, useEffect, useState } from 'react'
import { MilkdownEditor, WrapWithProviders } from './milkdown'
import useMilkdownCommands from './milkdown/useMilkdownCommands'
import { useGdriveFile, useGdriveFileCommands } from '../service/gdrivefile'
import { DraftFileDetails, useDraftFile } from '../service/draftfile'
import { useNavigateTo } from '../service/navigate'
import { useFileEditParams } from '../service/navigate'
import DraftSelector from './editor/DraftSelector'
import TextArea from './textarea/TextArea'
import { useFilenamePanel, useMainMenuPanel } from '../service/navbar'
import { Button, Form } from 'react-bootstrap'

export type Props = {
  onCloseClicked?: () => void
}

function EditorView(props: Props): React.ReactElement {
  const paramsFileEdit = useFileEditParams()
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null)
  const [editFileNameEnabled, setEditFileNameEnabled] = useState(false)
  const [fileDetails] = useGdriveFile()
  const [initialContent, setInitialContent] = useState(fileDetails.content)
  const [updatedContent, setUpdatedContent] = useState(fileDetails.content)
  const { updateContent: updateGdriveContent, updateFileName } = useGdriveFileCommands()
  const {
    draftDetails,
    select: selectDraft,
    discard: discardDraft,
    loadContent: loadDraft,
    saveContent: saveDraft,
  } = useDraftFile(paramsFileEdit.draftId)
  const { navigateToFileEdit } = useNavigateTo()
  const { addPanel, removePanel } = useMainMenuPanel()
  const { setFilenamePanel, unsetFileNamePanel } = useFilenamePanel()
  useMilkdownCommands()

  useEffect(() => {
    if (isDirty) {
      const interval = setInterval(() => {
        if (isDirty) autoSaveAction(updatedContent)
      }, 2000)
      return () => {
        clearInterval(interval)
      }
    }
  }, [updatedContent, isDirty])

  useEffect(() => {
    const loadDraftContent = async () => {
      if (draftDetails) {
        const content = await loadDraft()
        setInitialContent(content)
        setUpdatedContent(content)
      }
    }

    loadDraftContent()
  }, [draftDetails?.id])

  useEffect(() => {
    if (paramsFileEdit.draftId) {
      selectDraft(paramsFileEdit.draftId)
    }
  }, [paramsFileEdit.draftId])

  useEffect(() => {
    const buttonsPanel = (
      <>
        <Button className="me-2" variant="primary" onClick={() => commitContentChange(updatedContent)}>Save</Button>
        <Button className="me-2" variant="primary" onClick={onCloseClicked}>Save & Close</Button>
        <Button className="me-2" variant="primary" onClick={onDiscardClicked}>Discard</Button>
      </>
    )

    addPanel(buttonsPanel)
    return () => {
      removePanel(buttonsPanel)
    }
  }, [])

  useEffect(() => {
    const panel = editFileNameEnabled
      ? (
          <Form>
            <input
              type="text"
              defaultValue={fileDetails.name}
              onBlur={e => commitFileNameChange(e.target.value)}
              autoFocus
              className="form-control me-auto"
            />
          </Form>
        )
      : (<h5 className="me-auto mb-0" onClick={() => setEditFileNameEnabled(true)}>{fileDetails.name}</h5>)

    setFilenamePanel(panel)

    return () => {
      unsetFileNamePanel()
    }
  })

  useEffect(() => {
    if (!paramsFileEdit.draftId) {
      const panel = <DraftSelector onDraftSelected={onUseSpecificDraftClicked} />

      addPanel(panel)
      return () => {
        removePanel(panel)
      }
    }
  }, [paramsFileEdit.draftId])

  const handleContentUpdate = useCallback((markdown: string) => {
    setUpdatedContent(markdown)
    setIsDirty(true)
  }, [])

  function autoSaveAction(newContent: string) {
    saveDraft(newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitContentChange(newContent: string) {
    updateGdriveContent(newContent)
    saveDraft(newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitFileNameChange(fileName: string) {
    updateFileName(fileName)
    setEditFileNameEnabled(false)
  }

  async function onCloseClicked() {
    await updateGdriveContent(updatedContent)
    await discardDraft()
    props.onCloseClicked()
  }

  async function onDiscardClicked() {
    await discardDraft()
    props.onCloseClicked()
  }

  async function onUseSpecificDraftClicked(draft: DraftFileDetails) {
    await discardDraft()
    navigateToFileEdit(params => ({ ...params, draftId: draft.id }))
  }

  return (
    <>
      <div className="container-fluid p-2">
        <div className="d-flex flex-row align-items-center justify-content-end">
          {lastSavedTimestamp != null && (
            <span className="ms-1">
              <small className="text-success">
                Last saved at
                {lastSavedTimestamp.toLocaleString()}
              </small>
            </span>
          )}
        </div>
      </div>
      <div className="container-lg mt-4">
        <div className="row">
          {paramsFileEdit.source && (
            <TextArea value={initialContent} onChange={handleContentUpdate} />
          )}
          {!paramsFileEdit.source && <MilkdownEditor content={initialContent} onContentUpdated={handleContentUpdate} />}
        </div>
      </div>
    </>
  )
}

export default function (): React.ReactElement {
  const { navigateToFileView } = useNavigateTo()

  return <WrapWithProviders><EditorView onCloseClicked={() => navigateToFileView()} /></WrapWithProviders>
}
