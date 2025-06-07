import { act, render } from '@testing-library/react'
import React from 'react'
import { expect, test } from 'vitest'
import { TestMilkdownEditor } from '@test/test-utils'

test('should render blockquote with additional blockquote class for bootstrap', async () => {
  const SAMPLE_CONTENT = `> blockquote`
  const container = await act(async () => {
    const { container } = render(<TestMilkdownEditor content={SAMPLE_CONTENT} />)

    await new Promise<HTMLElement>(r => setTimeout(r, 100))
    return container
  })

  const blockquoteElement = container.querySelector('blockquote')
  expect(blockquoteElement).toHaveClass('blockquote')
  expect(document.body).toMatchSnapshot()
})
