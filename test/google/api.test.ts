import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { googleDriveApi as api } from '@app/google/api'
import { ensurePermissionGranted, Permissions } from '@app/google/authorization'
import { StorageContext } from '@app/storage'

vi.mock('@app/google/authorization', () => ({
  ensurePermissionGranted: vi.fn().mockResolvedValue(undefined),
  Permissions: {
    READ_SELECTED_FILE: 'READ_SELECTED_FILE',
    READ_FILE: 'READ_FILE',
    SAVE_SELECTED_FILE: 'SAVE_SELECTED_FILE',
    MAINTAIN_APP_DATA: 'MAINTAIN_APP_DATA',
  },
}))
vi.mock('@app/google/load', () => ({ loadGapiClient: Promise.resolve() }))

const get = vi.fn()
const list = vi.fn()
const deleteFile = vi.fn()
const request = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(ensurePermissionGranted).mockResolvedValue(undefined)
  get.mockImplementation(({ alt }: { alt?: string }) => Promise.resolve(alt
    ? { body: 'content' }
    : { result: { name: 'notes.md', mimeType: 'text/markdown', parents: ['folder'], webViewLink: 'link' } }))
  list.mockResolvedValue({ result: { files: [] } })
  deleteFile.mockResolvedValue({})
  request.mockResolvedValue({
    result: { id: 'created', name: 'notes.md', mimeType: 'text/markdown', parents: ['folder'] },
  })
  vi.stubGlobal('gapi', { client: { drive: { files: { get, list, delete: deleteFile } }, request } })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Google storage contexts', () => {
  it.each([StorageContext.Temp, StorageContext.AppConfig, 'appDataFolder'])(
    'creates text in app data for context %s using only app-data permission',
    async (context) => {
      const content = '# Draft \u00e9'
      const result = await api.createFile({ filename: 'draft_1', content, context })

      expect(ensurePermissionGranted).toHaveBeenCalledExactlyOnceWith(Permissions.MAINTAIN_APP_DATA)
      expect(request).toHaveBeenCalledOnce()
      const options = request.mock.calls[0][0] as gapi.client.RequestOptions
      expect(options).toMatchObject({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart', fields: 'id,name,mimeType,parents' },
      })
      expect(options.body).toContain(JSON.stringify({
        name: 'draft_1', mimeType: 'text/markdown', parents: ['appDataFolder'],
      }))
      expect(options.body).toContain('IyBEcmFmdCDDqQ==')
      expect(result).toEqual({
        id: 'created', name: 'notes.md', mimeType: 'text/markdown', folderId: 'folder', content,
      })
    },
  )

  it('creates a regular file with its exact filename and parent ID', async () => {
    await api.createFile({ filename: 'notes.md', content: '# Notes', context: 'folder-id' })
    expect(ensurePermissionGranted).toHaveBeenCalledExactlyOnceWith(Permissions.SAVE_SELECTED_FILE)
    expect(request.mock.calls[0][0].body).toContain('"name":"notes.md"')
    expect(request.mock.calls[0][0].body).toContain('"parents":["folder-id"]')
    expect(request.mock.calls[0][0].body).not.toContain('notes.md.md')
  })

  it('creates uploaded binary files through the same method', async () => {
    const file = new File([new Uint8Array([0, 255, 1])], 'image.png', { type: 'image/png' })
    const result = await api.createFile({ file, context: 'folder-id' })
    expect(request.mock.calls[0][0].body).toContain(JSON.stringify({
      name: 'image.png', mimeType: 'image/png', parents: ['folder-id'],
    }))
    expect(request.mock.calls[0][0].body).toContain('AP8B')
    expect(ensurePermissionGranted).toHaveBeenCalledExactlyOnceWith(Permissions.SAVE_SELECTED_FILE)
    expect(result).not.toHaveProperty('content')
  })

  it('uses a binary MIME type when an upload has no type', async () => {
    await api.createFile({ file: new File(['data'], 'file'), context: StorageContext.Temp })
    expect(request.mock.calls[0][0].body).toContain('"mimeType":"application/octet-stream"')
    expect(ensurePermissionGranted).toHaveBeenCalledExactlyOnceWith(Permissions.MAINTAIN_APP_DATA)
  })

  it.each([StorageContext.Temp, StorageContext.AppConfig])(
    'uses app-data permissions for every ID-based operation in context %s',
    async (context) => {
      const params = { fileId: 'draft-id', context }
      await expect(api.loadFile(params)).resolves.toMatchObject({ id: 'draft-id', content: 'content' })
      await expect(api.loadBinaryFile(params)).resolves.toBe(btoa('content'))
      await expect(api.getFileMetadata(params)).resolves.toMatchObject({ id: 'draft-id', url: 'link' })
      await api.save({ ...params, content: '# Changed' })
      await api.updateFileName({ ...params, filename: 'renamed' })
      await api.deleteFile(params)
      expect(vi.mocked(ensurePermissionGranted).mock.calls).toEqual(
        Array.from({ length: 6 }, () => [Permissions.MAINTAIN_APP_DATA]),
      )
      expect(deleteFile).toHaveBeenCalledExactlyOnceWith({ fileId: 'draft-id' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        path: '/upload/drive/v3/files/draft-id', method: 'PATCH', body: '# Changed',
      }))
    },
  )

  it('defaults ID-based operations to ordinary Drive permissions', async () => {
    await api.loadFile({ fileId: 'id' })
    await api.loadBinaryFile({ fileId: 'id' })
    await api.getFileMetadata({ fileId: 'id' })
    await api.save({ fileId: 'id', content: '' })
    await api.updateFileName({ fileId: 'id', filename: 'new.md' })
    await api.deleteFile({ fileId: 'id' })
    expect(vi.mocked(ensurePermissionGranted).mock.calls).toEqual([
      [Permissions.READ_SELECTED_FILE], [Permissions.READ_FILE], [Permissions.READ_SELECTED_FILE],
      [Permissions.SAVE_SELECTED_FILE], [Permissions.SAVE_SELECTED_FILE], [Permissions.SAVE_SELECTED_FILE],
    ])
  })

  it('finds app-data files across all pages, preserving ordering', async () => {
    list.mockResolvedValueOnce({
      result: {
        files: [{ id: 'new', name: 'draft', mimeType: 'text/markdown', parents: ['appDataFolder'] }],
        nextPageToken: 'next',
      },
    }).mockResolvedValueOnce({
      result: { files: [{ id: 'old', name: 'draft', mimeType: 'text/markdown', parents: ['appDataFolder'] }] },
    })
    const result = await api.findFiles({ filename: 'draft', context: StorageContext.Temp })
    expect(result.map(file => file.id)).toEqual(['new', 'old'])
    expect(list).toHaveBeenNthCalledWith(1, expect.objectContaining({
      q: "name='draft' and 'appDataFolder' in parents and trashed=false",
      spaces: 'appDataFolder', orderBy: 'createdTime desc', pageToken: undefined,
    }))
    expect(list).toHaveBeenNthCalledWith(2, expect.objectContaining({ pageToken: 'next' }))
    expect(ensurePermissionGranted).toHaveBeenCalledExactlyOnceWith(Permissions.MAINTAIN_APP_DATA)
  })

  it('escapes filenames and folder IDs in ordinary Drive queries', async () => {
    await expect(api.findFiles({ filename: "a'b\\c", context: "folder'\\id" })).resolves.toEqual([])
    expect(list).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      q: "name='a\\'b\\\\c' and 'folder\\'\\\\id' in parents and trashed=false",
      spaces: 'drive',
    }))
    expect(ensurePermissionGranted).toHaveBeenCalledExactlyOnceWith(Permissions.READ_SELECTED_FILE)
  })

  it('rejects an empty context before requesting permission or making a request', async () => {
    await expect(api.createFile({ filename: 'file', content: '', context: '' })).rejects.toThrow('Invalid')
    await expect(api.findFiles({ filename: 'file', context: ' ' })).rejects.toThrow('Invalid')
    expect(ensurePermissionGranted).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
    expect(list).not.toHaveBeenCalled()
  })

  it('propagates permission and API failures', async () => {
    vi.mocked(ensurePermissionGranted).mockRejectedValueOnce(new Error('Permission denied'))
    await expect(api.createFile({ filename: 'file', content: '', context: 'folder' }))
      .rejects.toThrow('Permission denied')
    expect(request).not.toHaveBeenCalled()
    list.mockRejectedValueOnce(new Error('Drive unavailable'))
    await expect(api.findFiles({ filename: 'file', context: StorageContext.Temp }))
      .rejects.toThrow('Drive unavailable')
  })

  it('propagates file reading failures without uploading', async () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(() => {
      throw new Error('File reading failed')
    })
    await expect(api.createFile({ file: new File(['data'], 'file'), context: 'folder' }))
      .rejects.toThrow('File reading failed')
    expect(request).not.toHaveBeenCalled()
  })
})
