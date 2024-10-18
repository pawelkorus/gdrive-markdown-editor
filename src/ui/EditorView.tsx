import React, { useCallback, useEffect, useState } from 'react'
import { MilkdownEditor, WrapWithProviders } from './milkdown'
import useMilkdownCommands from './milkdown/useMilkdownCommands'
import { useGdriveFile, useGdriveFileCommands } from '../service/gdrivefile'
import { useDraftFile } from '../service/draftfile'

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
  const {updateContent: updateGdriveContent, updateFileName} = useGdriveFileCommands()
  const { 
    fileDetails: draftFile, 
    loadContent: loadDraftContent, 
    updateContent: updateDraftContent,
    discard: discardDraft 
  } = useDraftFile(fileDetails)
  useMilkdownCommands()
  const [draftAvailable, setDraftAvailable] = useState(false)

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
    if(!draftFile) {
      setDraftAvailable(false)
      return
    }

    if(draftFile.isNew) {
      updateDraftContent(updatedContent)
    } else {
      setDraftAvailable(true)
    }
  }, [draftFile?.id])

  const handleContentUpdate = useCallback((markdown: string) => {
    setUpdatedContent(markdown)
    setIsDirty(true)
  }, [])

  function autoSaveAction(newContent: string) {
    updateDraftContent(newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitContentChange(newContent: string) {
    updateGdriveContent(newContent)
    updateDraftContent(newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitFileNameChange(fileName: string) {
    updateFileName(fileName)
    setEditFileNameEnabled(false)
  }

  function onCloseClicked() {
    updateGdriveContent(updatedContent)
    discardDraft()
    props.onCloseClicked()
  }

  function onDiscardClicked() {
    discardDraft()
    props.onCloseClicked()
  }

  async function onUseDraftClicked() {
    const content = await loadDraftContent()
    setInitialContent(content)
    setUpdatedContent(content)
    setDraftAvailable(false)
  }

  function onDiscardDraftClicked() {
    updateDraftContent(updatedContent)
    setDraftAvailable(false)
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
          { draftAvailable && (
          <div>
            <div className="input-group" role="alert">
              <span className="input-group-text">Draft available:</span>
              <button className="btn btn-outline-primary" onClick={onUseDraftClicked}>Use</button>
              <button className="btn btn-outline-danger" onClick={onDiscardDraftClicked}>Discard</button>
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

export default function (props: Props): React.ReactElement {
  return <WrapWithProviders><EditorView {...props} /></WrapWithProviders>
}
