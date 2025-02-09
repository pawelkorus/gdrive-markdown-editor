import React, { useCallback } from 'react'
import { useNodeViewContext } from '@prosemirror-adapter/react'
import { useGdriveFileMetadata } from '@app/service/gdrivefiles'
import { useNavigateTo } from '@app/service/navigate'

export default function (): React.ReactElement {
  const { contentRef, node } = useNodeViewContext()
  const fileMetadata = useGdriveFileMetadata(node.attrs.src)
  const { navigateToFileView } = useNavigateTo()

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (fileMetadata && (fileMetadata.mimeType === 'text/markdown' || fileMetadata.name.endsWith('.md'))) {
      navigateToFileView({ fileId: fileMetadata.id })
    }
  }, [fileMetadata, navigateToFileView])

  return fileMetadata
    ? (
        <a data-type="gdrive-ref" data-src={node.attrs.src} href={fileMetadata.url} ref={contentRef} onClick={handleClick}>
          {node.attrs.label || fileMetadata.name}
        </a>
      )
    : <span>Loading...</span>
}
