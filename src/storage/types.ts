export interface FileDetails {
  id: string
  name: string
  mimeType: string | undefined
  folderId?: string
}

export type FolderDetails = FileDetails

export type FileDetailsWithContent = FileDetails & {
  content: string
}

export type FileDetailsWithLink = FileDetails & {
  url: string
}

export type RecentFileDetails = FileDetails & { viewedByMeTime: string }

export interface CreateFileParams {
  filename: string
  content: string
  parent: string
}

export interface StorageApi {
  loadFile(fileId: string): Promise<FileDetailsWithContent>
  loadBinaryFile(fileId: string): Promise<string>
  createFile(params: CreateFileParams): Promise<FileDetailsWithContent>
  save(fileId: string, content: string): Promise<void>
  updateFileName(fileId: string, filename: string): Promise<void>
  getFileMetadata(fileId: string): Promise<FileDetailsWithLink>
  getUserRecentlyModifiedFiles(): Promise<RecentFileDetails[]>
  createFileInAppDirectory(filename: string): Promise<FileDetails>
  findFileInAppDirectory(filename: string): Promise<FileDetails[]>
  deleteFileFromAppDirectory(fileId: string): Promise<void>
  uploadFileToDrive(file: File, parentId: string): Promise<FileDetails>
}
