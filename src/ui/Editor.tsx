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
<div>
    <div className="container-fluid p-2">
        <div className="d-flex flex-row">
            <div className="me-auto me-2"></div>
            <button className="btn btn-primary ms-1" id="btn-save" type="button" onClick={e => props.onSaveClicked(new SaveEvent(updatedContent))}>Save</button>
            <button className="btn btn-primary ms-1" id="btn-browse" type="button" onClick={browseGdrive}>Browse</button>
            <button className="btn btn-primary ms-1" id="btn-preview" type="button" onClick={togglePreview}>Preview</button>
            <button className="btn btn-primary ms-1" id="btn-close" type="button" onClick={props.onCloseClicked}>Close</button>
        </div>
    </div>
    <div className="container-lg mt-4" id="main">
        <div className="row content"> 
            <div className="col">
                    <textarea className="form-control w-100 h-100" 
                        value={updatedContent} 
                        onChange={e => { setUpdatedContent(e.target.value) }}></textarea>
            </div>

            {previewEnabled && <div className="col"><MarkdownContent content={updatedContent}/></div>}    
        </div>
    </div>
</div>
)}
