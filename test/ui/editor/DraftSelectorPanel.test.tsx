import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi, test, expect, beforeEach } from 'vitest'

import { DraftSelectorPanel } from '@app/ui/editor'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useDraftFiles } from '@app/service/draftfile'

function ShowLocation() {
  const { pathname, search } = useLocation()
  return <pre>{JSON.stringify({ pathname, search })}</pre>
}

const fileDetails = {
  id: '1',
  name: 'original',
  mimeType: 'text/plain',
}

vi.mock('@app/service/draftfile', () => {
  const draftFiles = [{ id: '2', name: 'draft', mimeType: 'text/plain' }]
  const createDraft = vi.fn(() => Promise.resolve('1'))
  const discardDraft = vi.fn(() => Promise.resolve())

  return {
    useDraftFiles: vi.fn(() => {
      return {
        draftFiles: draftFiles,
        createDraft: createDraft,
        discardDraft: discardDraft,
      }
    }),
  }
})

beforeEach(() => {
  const mockedUseDraftFiles = useDraftFiles(fileDetails)
  mockedUseDraftFiles.draftFiles.splice(0, mockedUseDraftFiles.draftFiles.length, { id: '2', name: 'draft', mimeType: 'text/plain' })
})

vi.mock('@app/service/gdrivefile', () => {
  const loadGdriveFile = vi.fn(() => Promise.resolve())

  return {
    useGdriveFile: vi.fn(() => {
      return [fileDetails, loadGdriveFile]
    }),
  }
})

test('renders without crashing', () => {
  render(<MemoryRouter><DraftSelectorPanel onDraftSelected={() => {}} /></MemoryRouter>)

  expect(document.body).toMatchSnapshot()
})

test('should allow to choose or discard if only one draft is available', () => {
  render(<MemoryRouter><DraftSelectorPanel onDraftSelected={vi.fn()} /></MemoryRouter>)

  expect(screen.getByText('Draft available:')).toBeInTheDocument()
  expect(screen.getByText('Use')).toBeInTheDocument()
  expect(screen.getByText('Discard')).toBeInTheDocument()
  expect(document.body).toMatchSnapshot()
})

test('should trigger onDraftSelected when draft is selected', () => {
  const onDraftSelected = vi.fn()
  render(<MemoryRouter><DraftSelectorPanel onDraftSelected={onDraftSelected} /></MemoryRouter>)

  fireEvent.click(screen.getByText('Use'))

  expect(onDraftSelected).toHaveBeenCalledWith({ id: '2', name: 'draft', mimeType: 'text/plain' })
})

test('should trigger discardDraft when draft is discarded', () => {
  const mockedUseDraftFiles = useDraftFiles(fileDetails)

  render(<MemoryRouter><DraftSelectorPanel onDraftSelected={vi.fn()} /></MemoryRouter>)

  fireEvent.click(screen.getByText('Discard'))

  expect(mockedUseDraftFiles.discardDraft).toHaveBeenCalledWith('2')
})

test('should allow to choose latest draft or navigate to all drafts if multiple drafts are available', () => {
  const mockedUseDraftFiles = useDraftFiles(fileDetails)
  mockedUseDraftFiles.draftFiles.push({ id: '3', name: 'draft2', mimeType: 'text/plain' })

  render(<MemoryRouter><DraftSelectorPanel onDraftSelected={vi.fn()} /></MemoryRouter>)

  expect(screen.getByText('Multiple drafts available:')).toBeInTheDocument()
  expect(screen.getByText('Use latest')).toBeInTheDocument()
  expect(screen.getByText('Show all')).toBeInTheDocument()
  expect(document.body).toMatchSnapshot()
})

test('should trigger onDraftSelected with latest draft when "Use latest" is clicked', () => {
  const onDraftSelected = vi.fn()
  const mockedUseDraftFiles = useDraftFiles(fileDetails)
  mockedUseDraftFiles.draftFiles.push({ id: '3', name: 'draft2', mimeType: 'text/plain' })

  render(<MemoryRouter><DraftSelectorPanel onDraftSelected={onDraftSelected} /></MemoryRouter>)

  fireEvent.click(screen.getByText('Use latest'))

  expect(onDraftSelected).toHaveBeenCalledWith({ id: '2', name: 'draft', mimeType: 'text/plain' })
})

test('should navigate to all drafts when "Show all" is clicked', () => {
  const mockedUseDraftFiles = useDraftFiles(fileDetails)
  mockedUseDraftFiles.draftFiles.push({ id: '3', name: 'draft2', mimeType: 'text/plain' })

  render(
    <MemoryRouter initialEntries={[`/test?fileId=${fileDetails.id}`]}>
      <Routes>
        <Route path="/test" element={<DraftSelectorPanel onDraftSelected={vi.fn()} />} />
        <Route path="/file/drafts" element={<ShowLocation />} />
      </Routes>
    </MemoryRouter>,
  )

  fireEvent.click(screen.getByText('Show all'))

  expect(document.body).toMatchSnapshot()
})
