import React, { useCallback, useEffect, useState } from 'react'
import { MilkdownEditor, WrapWithProviders } from './milkdown'
import useMilkdownCommands from './milkdown/useMilkdownCommands'
import { useGdriveFile, useGdriveFileCommands } from '../service/gdrivefile'
import { useDraftFiles, DraftFileDetails } from '../service/draftfile'

export type Props = {
  onCloseClicked?: () => void
}

function EditorView(props: Props): React.ReactElement {
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null)
  const [editFileNameEnabled, setEditFileNameEnabled] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [fileDetails] = useGdriveFile()
  const [initialContent, setInitialContent] = useState(fileDetails.content)
  const [updatedContent, setUpdatedContent] = useState(fileDetails.content)
  const { updateContent: updateGdriveContent, updateFileName } = useGdriveFileCommands()
  const {
    draftFiles,
    selectedDraft,
    createDraft,
    discardDraft,
    loadDraftContent,
    saveDraftContent,
    useDraft,
  } = useDraftFiles(fileDetails)
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
    const createInitialDraft = async () => {
      await createDraft(updatedContent)
    }
    createInitialDraft()
  }, [])

  const handleContentUpdate = useCallback((markdown: string) => {
    setUpdatedContent(markdown)
    setIsDirty(true)
  }, [])

  function autoSaveAction(newContent: string) {
    saveDraftContent(selectedDraft.id, newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitContentChange(newContent: string) {
    updateGdriveContent(newContent)
    saveDraftContent(selectedDraft.id, newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitFileNameChange(fileName: string) {
    updateFileName(fileName)
    setEditFileNameEnabled(false)
  }

  function onCloseClicked() {
    updateGdriveContent(updatedContent)
    discardDraft(selectedDraft.id)
    props.onCloseClicked()
  }

  function onDiscardClicked() {
    discardDraft(selectedDraft.id)
    props.onCloseClicked()
  }

  async function onUseSpecificDraftClicked(draftFile: DraftFileDetails) {
    setShowDrafts(false)
    await useDraft(draftFile.id)
    const content = await loadDraftContent(draftFile.id)
    setInitialContent(content)
  }

  async function onDiscardSelectedDraftClicked(draftFile: DraftFileDetails) {
    discardDraft(draftFile.id)
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
                <button className="btn btn-outline-primary" onClick={() => setShowDrafts(true)}>Show all</button>
              </div>
            </div>
          )}
          <button className="btn btn-primary ms-1" id="btn-save" type="button" onClick={() => commitContentChange(updatedContent)}>Save</button>
          <button className="btn btn-primary ms-1" id="btn-close" type="button" onClick={onCloseClicked}>Save & Close</button>
          <button className="btn btn-primary ms-1" id="btn-discard" type="button" onClick={onDiscardClicked}>Discard</button>
        </div>
      </div>
      {showDrafts && (
        <div className="container-lg mt-4">
          <div className="row">
            <div className="list-group">
              {draftFiles.map(draftFile => (
                <div key={draftFile.id} className="list-group-item list-group-item-action">
                  {draftFile.id}
                  <button className="btn btn-outline-primary" onClick={() => onUseSpecificDraftClicked(draftFile)}>Use</button>
                  <button className="btn btn-outline-danger" onClick={() => onDiscardSelectedDraftClicked(draftFile)}>Discard</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!showDrafts && (
        <div className="container-lg mt-4">
          <div className="row">
            <MilkdownEditor content={initialContent} onContentUpdated={handleContentUpdate} />
          </div>
        </div>
      )}
    </>
  )
}

export default function (props: Props): React.ReactElement {
  return <WrapWithProviders><EditorView {...props} /></WrapWithProviders>
}
