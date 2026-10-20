import React, { useCallback, useEffect, useState } from 'react'
import { MilkdownEditor } from './milkdown-editor'
import { useFile, useFileCommands } from '@app/service/file'
import { FileDetails, useDraftFile } from '@app/service/draftfile'
import { useNavigateTo } from '@app/service/navigate'
import { useFileEditParams } from '@app/service/navigate'
import { useFileNameSlot, useMainMenuSlot } from '@app/service/navbar'
import { PanelButton, Panel } from './nav'
import { LastSavedTimestampPanel, DraftSelectorPanel } from './components'
import SourceEditor from './source-editor/SourceEditor'

export default function EditorView(): React.ReactElement {
  const paramsFileEdit = useFileEditParams()
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date>(null)
  const [editFileNameEnabled, setEditFileNameEnabled] = useState(false)
  const [fileDetails] = useFile()
  const [initialContent, setInitialContent] = useState(fileDetails.content)
  const [updatedContent, setUpdatedContent] = useState(fileDetails.content)
  const { updateContent, updateFileName,  } = useFileCommands()
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
        if (isDirty) void autoSaveAction(updatedContent)
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

    void loadDraftContent()
  }, [draftDetails?.id])

  useEffect(() => {
    if (paramsFileEdit.draftId) {
      void selectDraft(paramsFileEdit.draftId)
    }
  }, [paramsFileEdit.draftId])

  const onCommitContentChange = useCallback(function () {
    void updateContent(updatedContent)
    void saveDraft(updatedContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }, [updatedContent, updateContent, saveDraft])

  const onCloseClicked = useCallback(async function onCloseClicked() {
    await updateContent(updatedContent)
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

  async function autoSaveAction(newContent: string) {
    await saveDraft(newContent)
    setLastSavedTimestamp(new Date())
    setIsDirty(false)
  }

  async function commitFileNameChange(fileName: string) {
    await updateFileName(fileName)
    setEditFileNameEnabled(false)
  }

  function exitEditor() {
    navigateToFileView()
  }

  async function onUseSpecificDraftClicked(draft: FileDetails) {
    await discardDraft()
    navigateToFileEdit(params => ({ ...params, draftId: draft.id }))
  }

  return (
    <>
      {setFilenamePanel(
        editFileNameEnabled
          ? (
              <Panel>
                <input
                  type="text"
                  defaultValue={fileDetails.name}
                  onBlur={e => { void commitFileNameChange(e.target.value) }}
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
          <PanelButton variant="primary" onClick={() => { void onCloseClicked() }}>Save & Close</PanelButton>
          <PanelButton variant="primary" onClick={() => { void onDiscardClicked () }}>Discard</PanelButton>
        </Panel>,
      )}
      {lastSavedTimestamp && addMainMenuPanel(<LastSavedTimestampPanel lastSavedTimestamp={lastSavedTimestamp} />) }
      {!paramsFileEdit.draftId && addMainMenuPanel(<DraftSelectorPanel onDraftSelected={(draft) => { void onUseSpecificDraftClicked(draft) }} />)}
      <div className="container-lg mt-4">
        <div className="row">
          {paramsFileEdit.source && (
            <SourceEditor value={initialContent} onChange={handleContentUpdate} />
          )}
          {!paramsFileEdit.source && (
            <MilkdownEditor content={initialContent} onContentUpdated={handleContentUpdate} />
          )}
        </div>
      </div>
    </>
  )
}
