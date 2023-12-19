import React, { useState, useEffect } from "react"
import { loadBinaryFile } from "../../../google"
import { useNodeViewContext } from "@prosemirror-adapter/react"


export default function():React.ReactElement {
    const [loading, setLoading] = useState(true)
    const [imageContent, setImageContent] = useState("")
    const { contentRef, node } = useNodeViewContext()

    useEffect(() => {
        loadBinaryFile(node.attrs.src).then(fileBody => {
            setImageContent("data:image/jpg;base64," + fileBody)
        })
    }, [])

    return (
<div data-type="gdrive" className="text-center" data-src={node.attrs.src} ref={contentRef}>
    <p>
        {imageContent? 
        <img className="img-fluid align-center" src={imageContent}/>
        : 
        <span>loading</span>
        }
    </p>
</div>
)}
