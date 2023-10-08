import React from "react";
import { default as showdown } from "showdown"
import { default as googleDriveExt } from './googleDriveExt'
import parse, {
    DOMNode,
    Element,
    HTMLReactParserOptions
  } from "html-react-parser";
import GoogleDriveEmbed from "./GoogleDriveEmbed";

showdown.extension("googleDriveExt", googleDriveExt)
const converter: showdown.Converter = new showdown.Converter();
converter.useExtension("googleDriveExt")

const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
        if (
            isElement(domNode) &&
            domNode.tagName === "gdrive"
            // domNode.attribs &&
            // domNode.attribs.class == "replace"
        ) {
            return <GoogleDriveEmbed src={domNode.attribs.src} alt={domNode.attribs.alt}/>;
        }
    }
};


type Props = {
    content: string
}

export default function(props:Props):React.ReactElement {
    // return <div dangerouslySetInnerHTML={{__html: converter.makeHtml(props.content)}}></div>
    return <>{parse(converter.makeHtml(props.content), options)}</>
}

function isElement(domNode: DOMNode): domNode is Element {
    const isTag = domNode.type === "tag";
    const hasAttributes = (domNode as Element).attribs !== undefined;

    return isTag && hasAttributes;
};
