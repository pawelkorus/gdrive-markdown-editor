import { test, expect } from 'vitest'
import React from 'react'
import { render, act } from '@testing-library/react'
import MilkdownEditor from '../../../../src/ui/milkdown/MilkdownEditor'
import WrapWithProviders from '../../../../src/ui/milkdown/WrapWithProviders'

const SAMPLE_CONTENT = '::youtube{src="sampleyoutube"}'

test('should render youtube embed iframe', async () => {
  await act(async () => {
    render(<WrapWithProviders><MilkdownEditor content={SAMPLE_CONTENT} /></WrapWithProviders>)

    await new Promise(r => setTimeout(r, 4000))
  })

  expect(document.body).toMatchSnapshot()
})
