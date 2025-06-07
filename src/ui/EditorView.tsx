import React, { useCallback, useEffect, useState } from 'react'
import { MilkdownEditor } from './milkdown'
import { useGdriveFile, useGdriveFileCommands } from '../service/gdrivefile'
import { DraftFileDetails, useDraftFile } from '../service/draftfile'
import { useNavigateTo } from '../service/navigate'
import { useFileEditParams } from '../service/navigate'
import { TextArea } from '@app/ui/textarea'
import { useFileNameSlot, useMainMenuSlot } from '../service/navbar'
import { PanelButton, Panel } from './nav'
import { LastSavedTimestampPanel, DraftSelectorPanel } from './editor'
import EditorCommands from './editor/EditorCommands'
import { uploadFileToDrive } from '../google'

export default function EditorView(): React.ReactElement {
  const paramsFileEdit = useFileEditParams()
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null)
  const [editFileNameEnabled, setEditFileNameEnabled] = useState(false)
  const [fileDetails] = useGdriveFile()
  const [initialContent, setInitialContent] = useState(fileDetails.content)
  const [updatedContent, setUpdatedContent] = useState(fileDetails.content)
  const { updateContent: updateGdriveContent, updateFileName,  } = useGdriveFileCommands()
  const {
    draftDetails,
    select: selectDraft,
    discard: discardDraft,
    loadContent: loadDraft,
    saveContent: saveDraft,
  } = useDraftFile(paramsFileEdit.draftId)
  const { navigateToFileEdit, navigateToFileView } = useNavigateTo()
  const { addPanel: addMainMenuPanel } = useMainMenuSlot()
  const { setFilenamePanel } = useFileNameSlot()

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

  const onCommitContentChange = useCallback(function () {
    updateGdriveContent(updatedContent)
    saveDraft(updatedContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }, [updatedContent, updateGdriveContent, saveDraft])

  const onCloseClicked = useCallback(async function onCloseClicked() {
    await updateGdriveContent(updatedContent)
    await discardDraft()
    exitEditor()
  }, [updatedContent, discardDraft])

  const onDiscardClicked = useCallback(async function onDiscardClicked() {
    await discardDraft()
    exitEditor()
  }, [discardDraft])

  const handleContentUpdate = useCallback((markdown: string) => {
    setUpdatedContent(markdown)
    setIsDirty(true)
  }, [])

  const onEditSourceClicked = useCallback(() => {
    navigateToFileEdit(p => ({ ...p, source: true }))
  }, [])

  const onEditClicked = useCallback(() => {
    navigateToFileEdit(p => ({ ...p, source: false }))
  }, [])

  function autoSaveAction(newContent: string) {
    saveDraft(newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  function commitFileNameChange(fileName: string) {
    updateFileName(fileName)
    setEditFileNameEnabled(false)
  }

  function exitEditor() {
    navigateToFileView()
  }

  async function onUseSpecificDraftClicked(draft: DraftFileDetails) {
    await discardDraft()
    navigateToFileEdit(params => ({ ...params, draftId: draft.id }))
  }

  const handleFileDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        const parentId = fileDetails.folderId // Assuming fileDetails contains the parent directory ID

        try {
          const uploadedFile = await uploadFileToDrive(file, parentId)
          console.log('File uploaded successfully:', uploadedFile)
        } catch (error) {
          console.error('Error uploading file:', error)
        }
      }
    },
    [uploadFileToDrive, fileDetails],
  )

  return (
    <>
      {setFilenamePanel(
        editFileNameEnabled
          ? (
              <Panel>
                <input
                  type="text"
                  defaultValue={fileDetails.name}
                  onBlur={e => commitFileNameChange(e.target.value)}
                  autoFocus
                  className="form-control me-auto"
                />
              </Panel>
            )
          : (<h5 className="me-auto mb-0" onClick={() => setEditFileNameEnabled(true)}>{fileDetails.name}</h5>),
      )}
      {addMainMenuPanel(
        <Panel>
          { paramsFileEdit.source && <PanelButton variant="primary" onClick={onEditClicked}>Edit</PanelButton> }
          { !paramsFileEdit.source && <PanelButton variant="primary" onClick={onEditSourceClicked}>Edit Source</PanelButton> }
          <PanelButton variant="primary" onClick={onCommitContentChange}>Save</PanelButton>
          <PanelButton variant="primary" onClick={onCloseClicked}>Save & Close</PanelButton>
          <PanelButton variant="primary" onClick={onDiscardClicked}>Discard</PanelButton>
        </Panel>,
      )}
      {lastSavedTimestamp && addMainMenuPanel(<LastSavedTimestampPanel lastSavedTimestamp={lastSavedTimestamp} />) }
      {!paramsFileEdit.draftId && addMainMenuPanel(<DraftSelectorPanel onDraftSelected={onUseSpecificDraftClicked} />)}
      <div className="container-lg mt-4">
        <div className="row">
          {paramsFileEdit.source && (
            <TextArea value={initialContent} onChange={handleContentUpdate} />
          )}
          {!paramsFileEdit.source && (
            <MilkdownEditor content={initialContent} onContentUpdated={handleContentUpdate} />
          )}
        </div>
      </div>
      <div
        className="editor-view"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleFileDrop}
      >
        {/* Existing EditorView content */}
      </div>
    </>
  )
}
