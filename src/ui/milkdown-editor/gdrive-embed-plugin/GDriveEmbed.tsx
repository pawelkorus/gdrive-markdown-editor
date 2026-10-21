import React, { useState, useEffect } from 'react'
import { useStorageApi } from '@app/service/storage'
import { useNodeViewContext } from '@prosemirror-adapter/react'

export default function (): React.ReactElement {
  const api = useStorageApi()
  const [imageContent, setImageContent] = useState('')
  const { contentRef, node } = useNodeViewContext()

  useEffect(() => {
    api.loadBinaryFile(node.attrs.src as string)
    .then((fileBody) => {
      setImageContent('data:image/jpg;base64,' + fileBody)
    })
    .catch(err => console.error(err))
  }, [api, node.attrs.src])

  return (
    <div data-type="gdrive" className="text-center" data-src={node.attrs.src as string} ref={contentRef}>
      <p>
        {imageContent
          ? <img className="img-fluid align-center" src={imageContent} />
          : <span>loading</span>}
      </p>
    </div>
  )
}
