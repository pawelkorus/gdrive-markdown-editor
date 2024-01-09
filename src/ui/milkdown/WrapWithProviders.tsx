import { MilkdownProvider } from '@milkdown/react'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<object>

const WrapWithProviders: React.FC<Props> = ({ children }) => {
  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
        {children}
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  )
}

export default WrapWithProviders
