import { vi } from 'vitest'
import type { StorageApi } from '@app/storage'

export function createFakeStorageApi(overrides: Partial<StorageApi> = {}): StorageApi {
  return {
    loadFile: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined, content: '' }),
    loadBinaryFile: vi.fn().mockResolvedValue(''),
    createFile: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined, content: '' }),
    saveFile: vi.fn().mockResolvedValue(undefined),
    loadFileMetadata: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined, url: '' }),
    getUserRecentlyModifiedFiles: vi.fn().mockResolvedValue([]),
    findFiles: vi.fn().mockResolvedValue([]),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}
