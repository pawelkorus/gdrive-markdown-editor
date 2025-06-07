import { test, expect } from 'vitest'
import React from 'react'
import { render, act } from '@testing-library/react'
import { TestMilkdownEditor } from '@test/test-utils'

const SAMPLE_CONTENT = '::youtube{src="sampleyoutube"}'

test('should render youtube embed iframe', async () => {
  await act(async () => {
    render(<TestMilkdownEditor content={SAMPLE_CONTENT} />)

    await new Promise(r => setTimeout(r, 4000))
  })

  expect(document.body).toMatchSnapshot()
})
