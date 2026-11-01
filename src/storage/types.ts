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

export enum StorageContext {
  Temp,
  AppConfig,
}

export interface FileParams {
  fileId: string
  context?: string | StorageContext
}

export interface CreateTextFileParams {
  filename: string
  content: string
  context: string | StorageContext
}

export interface CreateUploadFileParams {
  file: File
  context: string | StorageContext
}

export type CreateFileParams = CreateTextFileParams | CreateUploadFileParams

export interface FindFilesParams {
  filename: string
  context: string | StorageContext
}

export type SaveFileParams = FileParams & {
  content?: string
  filename?: string
} & ({ content: string } | { filename: string })

export interface StorageApi {
  findFiles(params: FindFilesParams): Promise<FileDetails[]>

  loadFile(params: FileParams): Promise<FileDetailsWithContent>
  loadFileMetadata(params: FileParams): Promise<FileDetailsWithLink>
  loadBinaryFile(params: FileParams): Promise<string>

  createFile(params: CreateFileParams): Promise<FileDetailsWithContent>

  saveFile(params: SaveFileParams): Promise<void>

  deleteFile(params: FileParams): Promise<void>

  getUserRecentlyModifiedFiles(): Promise<RecentFileDetails[]>
}
