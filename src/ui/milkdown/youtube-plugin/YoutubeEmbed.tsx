import React from 'react'
import { useNodeViewContext } from '@prosemirror-adapter/react'

export default function (): React.ReactElement {
  const { contentRef, node } = useNodeViewContext()

  return (
    <p data-type="youtube" className="text-center ratio ratio-16x9">
      <iframe
        ref={contentRef}
        src={'https://www.youtube.com/embed/' + node.attrs.src}
        allowFullScreen
      >
      </iframe>
    </p>
  )
}
