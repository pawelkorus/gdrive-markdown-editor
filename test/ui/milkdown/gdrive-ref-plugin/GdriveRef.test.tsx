import React from 'react'
import { render, act } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { MilkdownEditor, WrapWithProviders } from '@app/ui/milkdown'
import { useNavigateTo } from '@app/service/navigate'
import { useGdriveFileMetadata } from '@app/service/gdrivefiles'

const defaultFileDetails = {
  id: '1',
  name: 'title',
  mimeType: 'text/markdown',
  url: 'http://example.com',
}

vi.mock('@app/service/gdrivefiles', () => {
  return {
    useGdriveFileMetadata: vi.fn(() => defaultFileDetails),
  }
})

vi.mock('@app/service/navigate', () => {
  const navigateToFileView = vi.fn()

  return {
    useNavigateTo: vi.fn(() => {
      return {
        navigateToFileView: navigateToFileView,
      }
    }),
  }
})

test('should render gdrive ref without alt title', async () => {
  const SAMPLE_CONTENT = `:gdrive-ref{src="${defaultFileDetails.id}"}`
  const container = await act(async () => {
    const { container } = render(<WrapWithProviders><MilkdownEditor content={SAMPLE_CONTENT} /></WrapWithProviders>)

    await new Promise<HTMLElement>(r => setTimeout(r, 100))
    return container
  })

  const linkElement = container.querySelector('a')
  expect(linkElement).toHaveAttribute('data-type', 'gdrive-ref')
  expect(linkElement).toHaveAttribute('data-src', '1')
  expect(linkElement).toHaveTextContent(defaultFileDetails.name)
  expect(document.body).toMatchSnapshot()
})

test('should render gdrive ref with alt title', async () => {
  const SAMPLE_LABEL = 'sample label'
  const SAMPLE_CONTENT = `:gdrive-ref[${SAMPLE_LABEL}]{src="${defaultFileDetails.id}"}`
  const container = await act(async () => {
    const { container } = render(<WrapWithProviders><MilkdownEditor content={SAMPLE_CONTENT} /></WrapWithProviders>)

    await new Promise<HTMLElement>(r => setTimeout(r, 100))
    return container
  })

  const linkElement = container.querySelector('a')
  expect(linkElement).toHaveAttribute('data-type', 'gdrive-ref')
  expect(linkElement).toHaveAttribute('data-src', '1')
  expect(linkElement).toHaveTextContent(SAMPLE_LABEL)
  expect(document.body).toMatchSnapshot()
})

test('should navigate to file view when clicked and mime type is markdown', async () => {
  const { navigateToFileView } = useNavigateTo()
  const SAMPLE_CONTENT = `:gdrive-ref{src="${defaultFileDetails.id}"}`
  const container = await act(async () => {
    const { container } = render(<WrapWithProviders><MilkdownEditor content={SAMPLE_CONTENT} /></WrapWithProviders>)

    await new Promise<HTMLElement>(r => setTimeout(r, 100))
    return container
  })

  const linkElement = container.querySelector('a')
  linkElement.click()

  expect(document.body).toMatchSnapshot()
  expect(navigateToFileView).toHaveBeenCalledWith({ fileId: '1' })
})

test('should navigate to file view when clicked and file name extension is md', async () => {
  const fileDetails = { ...defaultFileDetails, name: 'file.md', mimeType: 'text/plain' }
  const { navigateToFileView } = useNavigateTo()
  vi.mocked(useGdriveFileMetadata).mockImplementationOnce(() => fileDetails)

  const SAMPLE_CONTENT = `:gdrive-ref{src="${defaultFileDetails.id}"}`
  const container = await act(async () => {
    const { container } = render(<WrapWithProviders><MilkdownEditor content={SAMPLE_CONTENT} /></WrapWithProviders>)

    await new Promise<HTMLElement>(r => setTimeout(r, 100))
    return container
  })

  const linkElement = container.querySelector('a')
  linkElement.click()

  expect(document.body).toMatchSnapshot()
  expect(navigateToFileView).toHaveBeenCalledWith({ fileId: '1' })
})

test('should not navigate to file view when clicked and not markdown file', async () => {
  const fileDetails = { ...defaultFileDetails, name: 'file', mimeType: 'text/plain' }
  const { navigateToFileView } = useNavigateTo()
  vi.mocked(useGdriveFileMetadata).mockImplementationOnce(() => fileDetails)

  const SAMPLE_CONTENT = `:gdrive-ref{src="${defaultFileDetails.id}"}`
  const container = await act(async () => {
    const { container } = render(<WrapWithProviders><MilkdownEditor content={SAMPLE_CONTENT} /></WrapWithProviders>)

    await new Promise<HTMLElement>(r => setTimeout(r, 100))
    return container
  })

  const linkElement = container.querySelector('a')
  linkElement.click()

  expect(document.body).toMatchSnapshot()
  expect(navigateToFileView).not.toHaveBeenCalledWith({ fileId: '1' })
})
