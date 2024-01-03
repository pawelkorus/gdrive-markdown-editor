import React from "react"
import { MilkdownEditor, WrapWithProviders } from "./milkdown"

type Props = {
    content: string
    onEditClicked?: () => void
}

function ViewerView(props:Props):React.ReactElement {
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
            <MilkdownEditor content={props.content} readonly={true}/>
        </div>
    </div>
</div>
)}

export default function(props:Props):React.ReactElement {
    return <WrapWithProviders><ViewerView {...props}/></WrapWithProviders>
}
