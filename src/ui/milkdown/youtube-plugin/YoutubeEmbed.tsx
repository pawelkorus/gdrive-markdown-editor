import React from 'react'
import { useNodeViewContext } from '@prosemirror-adapter/react'

export default function (): React.ReactElement {
  const { contentRef, node } = useNodeViewContext()

  return (
    <p data-type="youtube" className="text-center">
      <iframe
        ref={contentRef}
        width="560"
        height="315"
        src={'https://www.youtube.com/embed/' + node.attrs.src}
        allowFullScreen
      >
      </iframe>
    </p>
  )
}
