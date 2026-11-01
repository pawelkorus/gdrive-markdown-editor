import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDraftFile } from '@app/service/draftfile/useDraftFile'
import { useDraftFiles } from '@app/service/draftfile/useDraftFiles'
import { FileContext } from '@app/service/file/FileContext'
import { StorageApiProvider } from '@app/service/storage'
import { StorageContext, type StorageApi } from '@app/storage'
import { createFakeStorageApi } from '@test/test-utils'

const original = { id: 'original', name: 'notes.md', mimeType: 'text/markdown', content: '# Original' }
const draft = { id: 'draft', name: 'draft_original', mimeType: 'text/markdown', content: '# Draft' }
const createFile = vi.fn()
const loadFile = vi.fn()
const save = vi.fn()
const findFiles = vi.fn()
const deleteFile = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  createFile.mockResolvedValue(draft)
  loadFile.mockResolvedValue(draft)
  save.mockResolvedValue(undefined)
  findFiles.mockResolvedValue([draft])
  deleteFile.mockResolvedValue(undefined)
})

function createApi() {
  return createFakeStorageApi({ createFile, loadFile, save, findFiles, deleteFile })
}

function wrapper(api: StorageApi) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <StorageApiProvider api={api}>
        <FileContext.Provider value={{
          fileDetails: original,
          loadFile: vi.fn(),
          createFile: vi.fn(),
          updateContent: vi.fn(),
          updateFileName: vi.fn(),
        }}>
          {children}
        </FileContext.Provider>
      </StorageApiProvider>
    )
  }
}

describe('draft storage operations', () => {
  it('creates a draft with content in one call, then uses Temp for reads, saves and deletion', async () => {
    const api = createApi()
    const { result } = renderHook(() => useDraftFile(undefined), { wrapper: wrapper(api) })
    await waitFor(() => expect(result.current.draftDetails).toEqual(draft))
    expect(createFile).toHaveBeenCalledExactlyOnceWith({
      filename: 'draft_original', content: '# Original', context: StorageContext.Temp,
    })
    expect(save).not.toHaveBeenCalled()
    await act(async () => {
      expect(await result.current.loadContent()).toBe('# Draft')
      await result.current.saveContent('# Changed')
      await result.current.select('other-draft')
    })
    expect(loadFile).toHaveBeenCalledWith({ fileId: 'draft', context: StorageContext.Temp })
    expect(loadFile).toHaveBeenCalledWith({ fileId: 'other-draft', context: StorageContext.Temp })
    expect(save).toHaveBeenCalledExactlyOnceWith({
      fileId: 'draft', content: '# Changed', context: StorageContext.Temp,
    })
    await act(() => result.current.discard())
    expect(deleteFile).toHaveBeenCalledExactlyOnceWith({ fileId: 'draft', context: StorageContext.Temp })
    expect(result.current.draftDetails).toBeNull()
  })

  it('loads existing drafts with Temp without creating another file', async () => {
    const api = createApi()
    const { result } = renderHook(() => useDraftFile('draft'), { wrapper: wrapper(api) })
    await waitFor(() => expect(result.current.draftDetails).toEqual(draft))
    expect(loadFile).toHaveBeenCalledExactlyOnceWith({ fileId: 'draft', context: StorageContext.Temp })
    expect(createFile).not.toHaveBeenCalled()
  })

  it('finds, creates and discards drafts using the unified methods', async () => {
    createFile.mockResolvedValue({ ...draft, id: 'new-draft' })
    const api = createApi()
    const { result } = renderHook(() => useDraftFiles(original), { wrapper: wrapper(api) })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(findFiles).toHaveBeenCalledExactlyOnceWith({
      filename: 'draft_original', context: StorageContext.Temp,
    })
    await act(async () => { expect(await result.current.createDraft('# New')).toBe('new-draft') })
    expect(createFile).toHaveBeenCalledExactlyOnceWith({
      filename: 'draft_original', content: '# New', context: StorageContext.Temp,
    })
    expect(save).not.toHaveBeenCalled()
    expect(result.current.draftFiles).toHaveLength(2)
    await act(() => result.current.discardDraft('new-draft'))
    expect(deleteFile).toHaveBeenCalledExactlyOnceWith({
      fileId: 'new-draft', context: StorageContext.Temp,
    })
    expect(result.current.draftFiles.map(file => file.id)).toEqual(['draft'])
  })

  it('surfaces failures while finding drafts', async () => {
    findFiles.mockRejectedValue(new Error('Lookup failed'))
    const api = createApi()
    const { result } = renderHook(() => useDraftFiles(original), { wrapper: wrapper(api) })
    await waitFor(() => expect(result.current.error).toBe('Lookup failed'))
    expect(result.current.loading).toBe(false)
  })
})
