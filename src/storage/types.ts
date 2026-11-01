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

export interface SaveFileParams extends FileParams {
  content: string
}

export interface UpdateFileNameParams extends FileParams {
  filename: string
}

export interface StorageApi {
  loadFile(params: FileParams): Promise<FileDetailsWithContent>
  loadBinaryFile(params: FileParams): Promise<string>
  createFile(params: CreateTextFileParams): Promise<FileDetailsWithContent>
  createFile(params: CreateUploadFileParams): Promise<FileDetails>
  createFile(params: CreateFileParams): Promise<FileDetails | FileDetailsWithContent>
  save(params: SaveFileParams): Promise<void>
  updateFileName(params: UpdateFileNameParams): Promise<void>
  getFileMetadata(params: FileParams): Promise<FileDetailsWithLink>
  getUserRecentlyModifiedFiles(): Promise<RecentFileDetails[]>
  findFiles(params: FindFilesParams): Promise<FileDetails[]>
  deleteFile(params: FileParams): Promise<void>
}
