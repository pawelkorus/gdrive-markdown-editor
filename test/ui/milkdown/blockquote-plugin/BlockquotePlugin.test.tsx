import { MilkdownEditor } from '@app/ui/milkdown'
import { MilkdownProvider } from '@milkdown/react'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import { act, render } from '@testing-library/react'
import React, { PropsWithChildren } from 'react'
import { expect, test } from 'vitest'

test('should render blockquote with additional blockquote class for bootstrap', async () => {
  const SAMPLE_CONTENT = `> blockquote`
  const container = await act(async () => {
    const { container } = render(<WrapWithProviders><MilkdownEditor content={SAMPLE_CONTENT} /></WrapWithProviders>)

    await new Promise<HTMLElement>(r => setTimeout(r, 100))
    return container
  })

  const blockquoteElement = container.querySelector('blockquote')
  expect(blockquoteElement).toHaveClass('blockquote')
  expect(document.body).toMatchSnapshot()
})

const WrapWithProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
        {children}
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  )
}
