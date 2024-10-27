import React, { useCallback, useEffect, useState } from 'react'
import { MilkdownEditor, WrapWithProviders } from './milkdown'
import useMilkdownCommands from './milkdown/useMilkdownCommands'
import { useGdriveFile, useGdriveFileCommands } from '../service/gdrivefile'
import { DraftFileDetails, useDraftFiles } from '../service/draftfile'
import { useNavigateTo } from '../service/navigate'
import { useFileEditParams } from '../service/navigate'

export type Props = {
  onCloseClicked?: () => void
}

function EditorView(props: Props): React.ReactElement {
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null)
  const [editFileNameEnabled, setEditFileNameEnabled] = useState(false)
  const [fileDetails] = useGdriveFile()
  const [initialContent, setInitialContent] = useState(fileDetails.content)
  const [updatedContent, setUpdatedContent] = useState(fileDetails.content)
  const { updateContent: updateGdriveContent, updateFileName } = useGdriveFileCommands()
  const {
    draftFiles,
    createDraft,
    discardDraft,
    loadDraftContent,
    saveDraftContent,
  } = useDraftFiles(fileDetails)
  const paramsFileEdit = useFileEditParams()
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(paramsFileEdit.draftId)
  const { navigateToFileDrafts, navigateToFileEdit } = useNavigateTo()
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
    const initializeDraft = async () => {
      if (selectedDraftId) {
        const content = await loadDraftContent(selectedDraftId)
        setInitialContent(content)
      }
      else {
        const draftId = await createDraft(updatedContent)
        setSelectedDraftId(draftId)
      }
    }

    initializeDraft()
  }, [])

  const handleContentUpdate = useCallback((markdown: string) => {
    setUpdatedContent(markdown)
    setIsDirty(true)
  }, [])

  function autoSaveAction(newContent: string) {
    saveDraftContent(selectedDraftId, newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitContentChange(newContent: string) {
    updateGdriveContent(newContent)
    saveDraftContent(selectedDraftId, newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitFileNameChange(fileName: string) {
    updateFileName(fileName)
    setEditFileNameEnabled(false)
  }

  function onCloseClicked() {
    updateGdriveContent(updatedContent)
    discardDraft(selectedDraftId)
    props.onCloseClicked()
  }

  function onDiscardClicked() {
    discardDraft(selectedDraftId)
    props.onCloseClicked()
  }

  async function onUseSpecificDraftClicked(draft: DraftFileDetails) {
    navigateToFileEdit({ fileId: fileDetails.id, draftId: draft.id })
  }

  function onDiscardSelectedDraftClicked(draft: DraftFileDetails) {
    discardDraft(draft.id)
  }

  function onShowAllDraftsClicked() {
    navigateToFileDrafts()
  }

  return (
    <>
      <div className="container-fluid p-2">
        <div className="d-flex flex-row align-items-center justify-content-end">
          {editFileNameEnabled
            ? (
                <input
                  type="text"
                  defaultValue={fileDetails.name}
                  onBlur={e => commitFileNameChange(e.target.value)}
                  autoFocus
                  className="form-control me-auto"
                />
              )
            : (<h5 className="me-auto mb-0" onClick={() => setEditFileNameEnabled(true)}>{fileDetails.name}</h5>)}
          {lastSavedTimestamp != null && (
            <span className="ms-1">
              <small className="text-success">
                Last saved at
                {lastSavedTimestamp.toLocaleString()}
              </small>
            </span>
          )}
          { draftFiles && draftFiles.length == 1 && (
            <div>
              <div className="input-group" role="alert">
                <span className="input-group-text">Draft available:</span>
                <button className="btn btn-outline-primary" onClick={() => onUseSpecificDraftClicked(draftFiles[0])}>Use</button>
                <button className="btn btn-outline-danger" onClick={() => onDiscardSelectedDraftClicked(draftFiles[0])}>Discard</button>
              </div>
            </div>
          )}
          { draftFiles && draftFiles.length > 1 && (
            <div>
              <div className="input-group" role="alert">
                <span className="input-group-text">Multiple drafts available:</span>
                <button className="btn btn-outline-primary" onClick={() => onUseSpecificDraftClicked(draftFiles[0])}>Use latest</button>
                <button className="btn btn-outline-primary" onClick={() => onShowAllDraftsClicked()}>Show all</button>
              </div>
            </div>
          )}
          <button className="btn btn-primary ms-1" id="btn-save" type="button" onClick={() => commitContentChange(updatedContent)}>Save</button>
          <button className="btn btn-primary ms-1" id="btn-close" type="button" onClick={onCloseClicked}>Save & Close</button>
          <button className="btn btn-primary ms-1" id="btn-discard" type="button" onClick={onDiscardClicked}>Discard</button>
        </div>
      </div>
      <div className="container-lg mt-4">
        <div className="row">
          <MilkdownEditor content={initialContent} onContentUpdated={handleContentUpdate} />
        </div>
      </div>
    </>
  )
}

export default function (): React.ReactElement {
  const { navigateToFileView } = useNavigateTo()

  return <WrapWithProviders><EditorView onCloseClicked={() => navigateToFileView()} /></WrapWithProviders>
}
