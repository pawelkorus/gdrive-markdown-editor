import React, { useCallback } from 'react'
import { useNodeViewContext } from '@prosemirror-adapter/react'
import { useGdriveFileMetadata } from '../../../service/gdrivefiles'
import { useGdriveFile } from '../../../service/gdrivefile'

export default function (): React.ReactElement {
  const { contentRef, node } = useNodeViewContext()
  const [, loadFile] = useGdriveFile()
  const fileMetadata = useGdriveFileMetadata(node.attrs.src)

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (fileMetadata && (fileMetadata.mimeType === 'text/markdown' || fileMetadata.name.endsWith('.md'))) {
      e.preventDefault()
      loadFile(node.attrs.src)
    }
  }, [loadFile, fileMetadata, node])

  return fileMetadata
    ? (
      <a data-type="gdrive-ref" data-src={node.attrs.src} href={fileMetadata.url} ref={contentRef} onClick={handleClick}>
        {node.attrs.label || fileMetadata.name}
      </a>
      )
    : <span>Loading...</span>
}
