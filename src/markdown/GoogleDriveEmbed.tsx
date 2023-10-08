import React, { useState, useEffect } from "react"
import { loadBinaryFile } from "../google"

type Props = {
    src: string,
    alt?: string
}

export default function(props:Props):React.ReactElement {
    const [loading, setLoading] = useState(true)
    const [imageContent, setImageContent] = useState("")

    useEffect(() => {
        loadBinaryFile(props.src).then(fileBody => {
            setImageContent(fileBody)
        })
    }, [])

    if(imageContent) {
        const imageSrc = "data:image/jpg;base64," + imageContent
        return <img src={imageSrc} alt={props.alt}/>
    } else {
        return <img alt={props.alt}/>
    }
}
