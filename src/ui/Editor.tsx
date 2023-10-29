import React from 'react'
import { useState } from 'react'
import { MarkdownContent } from "../markdown"
import { showPicker } from '../google'

type Props = {
    content: string,
    onSaveClicked?: (event:SaveEvent) => void
    onCloseClicked?: () => void
    onTogglePreviewClicked?: () => void
}

export class SaveEvent {
    constructor(
        public content:string
    ) {}
}

export default function(props:Props):React.ReactElement {
    const [previewEnabled, setPreviewEnabled] = useState(false)
    const [updatedContent, setUpdatedContent] = useState(props.content)

    function togglePreview() {
        setPreviewEnabled(!previewEnabled);
        props.onTogglePreviewClicked && props.onTogglePreviewClicked();
    }

    function browseGdrive() {
        showPicker().then(res => setUpdatedContent(updatedContent + res))
    }

    return (
<div className="container-fluid p-2 d-flex flex-column min-vh-100">
    <div className="flex-row">
        <div className="me-auto me-2"></div>
        <button className="btn btn-primary ms-1" id="btn-save" type="button" onClick={e => props.onSaveClicked(new SaveEvent(updatedContent))}>Save</button>
        <button className="btn btn-primary ms-1" id="btn-browse" type="button" onClick={browseGdrive}>Browse</button>
        <button className="btn btn-primary ms-1" id="btn-preview" type="button" onClick={togglePreview}>Preview</button>
        <button className="btn btn-primary ms-1" id="btn-close" type="button" onClick={props.onCloseClicked}>Close</button>
    </div>
    <div className="d-flex flex-row flex-fill mt-4">
        <div className="position-relative" style={{flex: 1}}>
            <textarea className="form-control position-absolute" style={{minHeight: "100%"}}
                value={updatedContent} 
                onChange={e => { setUpdatedContent(e.target.value) }}></textarea>
        </div>
        {previewEnabled && <div style={{flex: 1}} className="p-2"><MarkdownContent content={updatedContent}/></div>}  
    </div>
</div>
)}
