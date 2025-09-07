import React from 'react'
import { render, fireEvent, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react'
import CommandPalette from '../../../src/ui/commandPalette/CommandPalette'
import { vi, test, expect } from 'vitest'
import { CommandPaletteProvider } from '@app/ui/commandPalette'

function prepareCommands() {
  const commands = [{
    id: 'aa',
    name: 'aa',
    execute: () => {},
  },
  {
    id: 'ab',
    name: 'ab',
    execute: () => {},
  },
  {
    id: 'bb',
    name: 'bb',
    execute: () => {},
  }]

  return commands
}

test('command palette opens after pressing Shift 2 times fast and hides after pressing Escape', async () => {
  render(<CommandPalette commands={prepareCommands()} />, { wrapper: CommandPaletteProvider })

  expect(document.body).toMatchSnapshot()

  fireEvent.keyDown(document, { key: 'Shift' })
  fireEvent.keyDown(document, { key: 'Shift' })

  await waitFor(() => screen.getByRole('dialog'))
  expect(document.body).toMatchSnapshot()

  fireEvent.keyDown(document, { key: 'Escape' })

  await waitForElementToBeRemoved(() => screen.getByRole('dialog'))
  expect(document.body).toMatchSnapshot()
})

test('command palette does not open after pressing Shift only once', () => {
  render(<CommandPalette commands={prepareCommands()} />, { wrapper: CommandPaletteProvider })

  expect(document.body).toMatchSnapshot()

  fireEvent.keyDown(document, { key: 'Shift' })

  expect(document.body).toMatchSnapshot()
})

test('command palette does not open if time between pressing Shift key is too long', () => {
  vi.useFakeTimers()

  render(<CommandPalette commands={prepareCommands()} />, { wrapper: CommandPaletteProvider })

  expect(document.body).toMatchSnapshot()

  fireEvent.keyDown(document, { key: 'Shift' })
  vi.advanceTimersByTime(1000) // Adjust the time as needed
  fireEvent.keyDown(document, { key: 'Shift' })

  expect(screen.queryByRole('dialog')).toBeNull()
  expect(document.body).toMatchSnapshot()
})

test('should execute callback after command is selected by keyboard', () => {
  const mockOnSelectCallback = vi.fn()

  render(<CommandPalette commands={prepareCommands()} onItemSelected={mockOnSelectCallback} />, { wrapper: CommandPaletteProvider })

  fireEvent.keyDown(document, { key: 'Shift' })
  fireEvent.keyDown(document, { key: 'Shift' })
  fireEvent.keyDown(document, { key: 'ArrowDown' })
  fireEvent.keyDown(document, { key: 'Enter' })

  expect(mockOnSelectCallback).toHaveBeenCalledWith({ id: 'ab', name: 'ab', execute: expect.any(Function) })
})

test('should execute callback after command is selected by mouse click', async () => {
  const mockOnSelectCallback = vi.fn()

  render(<CommandPalette commands={prepareCommands()} onItemSelected={mockOnSelectCallback} />, { wrapper: CommandPaletteProvider })

  fireEvent.keyDown(document, { key: 'Shift' })
  fireEvent.keyDown(document, { key: 'Shift' })
  fireEvent.mouseDown(screen.getByText('ab'))

  expect(mockOnSelectCallback).toHaveBeenCalledWith({ id: 'ab', name: 'ab', execute: expect.any(Function) })

  await waitForElementToBeRemoved(() => screen.getByRole('dialog'))
})

test('should filter commands based on input value', () => {
  render(<CommandPalette commands={prepareCommands()} />, { wrapper: CommandPaletteProvider })

  fireEvent.keyDown(document, { key: 'Shift' })
  fireEvent.keyDown(document, { key: 'Shift' })

  const filterInput = screen.getByPlaceholderText('Search...')
  fireEvent.change(filterInput, { target: { value: 'a' } })

  expect(document.body).toMatchSnapshot()

  fireEvent.change(filterInput, { target: { value: 'aa' } })

  expect(document.body).toMatchSnapshot()
})
