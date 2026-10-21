import { vi } from 'vitest'
import type { StorageApi } from '@app/storage'

export function createFakeStorageApi(overrides: Partial<StorageApi> = {}): StorageApi {
  return {
    loadFile: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined, content: '' }),
    loadBinaryFile: vi.fn().mockResolvedValue(''),
    createFile: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined, content: '' }),
    save: vi.fn().mockResolvedValue(undefined),
    updateFileName: vi.fn().mockResolvedValue(undefined),
    getFileMetadata: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined, url: '' }),
    getUserRecentlyModifiedFiles: vi.fn().mockResolvedValue([]),
    createFileInAppDirectory: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined }),
    findFileInAppDirectory: vi.fn().mockResolvedValue([]),
    deleteFileFromAppDirectory: vi.fn().mockResolvedValue(undefined),
    uploadFileToDrive: vi.fn().mockResolvedValue({ id: '', name: '', mimeType: undefined }),
    ...overrides,
  }
}
