import React from "react"
import { MarkdownContent } from "../markdown"

type Props = {
    content: string
    onEditClicked?: () => void
}

export default function(props:Props):React.ReactElement {
    return (
<div>
    <div className="container-fluid p-2">
        <div className="d-flex flex-row">
            <div className="me-auto me-2"></div>
            <button className="btn btn-primary ms-1" id="btn-edit" type="button" onClick={props.onEditClicked}>Edit</button>
        </div>
    </div>

    <div className="container-lg mt-4">
        <div className="row">
            <MarkdownContent content={props.content}/>
        </div>
    </div>
</div>
)}
