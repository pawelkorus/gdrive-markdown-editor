import React, { useEffect, useState } from 'react';
import { MilkdownEditor } from './milkdown';
import { CommandPalette } from './commandPalette';
import useMilkdownCommands from './milkdown/useMilkdownCommands';
import { useCommands } from '../command';

export type Props = {
    fileName: string,
    content: string,
    onFileNameChanged?: (event:FileNameChangeEvent) => void
    onSaveClicked?: (event:SaveEvent) => void
    onCloseClicked?: () => void
    onTogglePreviewClicked?: () => void
}

export class SaveEvent {
    constructor(
        public content:string
    ) {}
}

export class FileNameChangeEvent {
    constructor(
        public fileName:string
    ) {}
}

export default function(props:Props):React.ReactElement {
    const [ fileName, setFileName ] = useState(props.fileName)
    const [ updatedContent, setUpdatedContent ] = useState(props.content)
    const [ isDirty, setIsDirty ] = useState(false)
    const [ lastSavedTimestamp, setLastSavedTimestamp ] = useState(null)
    const [ editFileNameEnabled, setEditFileNameEnabled ] = useState(false)
    const [ commandPaletteVisible, setCommandPaletteVisible ] = useState(false);
    const [ deregisterCommands ] = useMilkdownCommands();
    const [ commands, executeCommand ] = useCommands();

    useEffect(() => { return () => deregisterCommands() }, []);

    useEffect(() => {
        if(isDirty) {
            const interval = setInterval(() => {
                if(isDirty) save(updatedContent)
            }, 5000);
            return () => {
                clearInterval(interval);
            }
        }
    }, [updatedContent, isDirty]);

    useEffect(() => {
        setIsDirty(true);
    }, [updatedContent]);

    function save(newContent:string) {
        props.onSaveClicked && props.onSaveClicked(new SaveEvent(newContent))
        setLastSavedTimestamp(new Date())
        setIsDirty(false)
    }

    function handleFileNameChange() {
        props.onFileNameChanged && props.onFileNameChanged(new FileNameChangeEvent(fileName))
        setEditFileNameEnabled(false)
    }

    function updateContent(markdown:string) {
        console.log('updateContent')
        setUpdatedContent(markdown)
    }

    function keyDown(event:React.KeyboardEvent) {
        if(event.key === '/' && !commandPaletteVisible) {
            event.preventDefault();
            setCommandPaletteVisible(true);
        }

        if(event.key === 'Escape' && commandPaletteVisible) {
            event.preventDefault();
            setCommandPaletteVisible(false);
        }
    }

    function triggerCommandAndClosePalette(id:string) {
        executeCommand(id);
        setCommandPaletteVisible(false);
    }

    return (
<div className="container-fluid p-2 d-flex flex-column min-vh-100" onKeyDown={keyDown}>
    <div className="d-flex flex-row align-items-center justify-content-end">
        {editFileNameEnabled ? (
            <input
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            onBlur={handleFileNameChange}
            autoFocus
            className='form-control me-auto'
            />
        ) : ( <h5 className='me-auto mb-0' onClick={() => setEditFileNameEnabled(true)}>{fileName}</h5> )}
        {lastSavedTimestamp != null && <span className="ms-1"><small className="text-success">Last saved at {lastSavedTimestamp.toLocaleString()}</small></span>}
        <button className="btn btn-primary ms-1" id="btn-save" type="button" onClick={() => save(updatedContent)}>Save</button>
        <button className="btn btn-primary ms-1" id="btn-close" type="button" onClick={props.onCloseClicked}>Close</button>
    </div>
    <div className="d-flex flex-row flex-fill mt-4">
        <div className="position-relative" style={{flex: 1}}>
            <MilkdownEditor content={updatedContent} onContentUpdated={updateContent}/>
        </div>
    </div>
    <CommandPalette show={commandPaletteVisible} commands={commands} onItemSelected={item => triggerCommandAndClosePalette(item.id)}></CommandPalette>
</div>
)}
