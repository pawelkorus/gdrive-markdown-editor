import React from 'react'
import { useNodeViewContext } from '@prosemirror-adapter/react'
import { useGdriveFileMetadata } from '../../../service/gdrivefiles'

export default function (): React.ReactElement {
  const { contentRef, node } = useNodeViewContext()
  const fileMetadata = useGdriveFileMetadata(node.attrs.src)

  return fileMetadata
    ? (
      <a data-type="gdrive-ref" data-src={node.attrs.src} href={fileMetadata.url} ref={contentRef}>
        {fileMetadata.name}
      </a>
      )
    : null
}
