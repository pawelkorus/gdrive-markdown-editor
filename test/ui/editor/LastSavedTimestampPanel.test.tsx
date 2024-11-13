import React from 'react'
import { render } from '@testing-library/react'
import { test, expect } from 'vitest'
import { LastSavedTimestampPanel } from '@app/ui/editor'

test('renders LastSavedTimestampPanel with timestamp', () => {
  const timestamp = '2023-10-01T12:34:56Z'
  const { asFragment } = render(<LastSavedTimestampPanel lastSavedTimestamp={new Date(timestamp)} />)

  expect(asFragment()).toMatchSnapshot()
})
