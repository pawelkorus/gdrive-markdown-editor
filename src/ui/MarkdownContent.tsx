import React from "react";
import { default as showdown } from 'showdown'

const converter: showdown.Converter = new showdown.Converter();

type Props = {
    content: string
}

export default function(props:Props):React.ReactElement {
    return <div dangerouslySetInnerHTML={{__html: converter.makeHtml(props.content)}}></div>
}
