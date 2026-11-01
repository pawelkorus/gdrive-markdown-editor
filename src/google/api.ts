import { API_KEY, DISCOVERY_DOC } from './const'
import { ensurePermissionGranted, Permissions } from './authorization'
import { loadGapiClient } from './load'
import type {
  StorageApi,
  FileDetails,
  FileDetailsWithContent,
  FileDetailsWithLink,
  RecentFileDetails,
  CreateFileParams,
  FileParams,
  FindFilesParams,
  SaveFileParams,
} from '@app/storage'
import { StorageContext } from '@app/storage'

function resolveContext(context?: string | StorageContext) {
  switch (context) {
    case StorageContext.Temp:
    case StorageContext.AppConfig:
    case 'appDataFolder':
      return { parent: 'appDataFolder', isAppData: true }
    case undefined:
      return { parent: undefined, isAppData: false }
    default:
      if (typeof context !== 'string' || !context.trim()) {
        throw new Error('Invalid Google Drive storage context')
      }
      return { parent: context, isAppData: false }
  }
}

function ensureContextPermission(context: string | StorageContext | undefined, permission: Permissions) {
  const { isAppData } = resolveContext(context)
  return ensurePermissionGranted(isAppData ? Permissions.MAINTAIN_APP_DATA : permission)
}

function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export async function initializeGapiClient() {
  await loadGapiClient

  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  })
}

export async function loadFile({ fileId, context }: FileParams): Promise<FileDetailsWithContent> {
  await ensureContextPermission(context, Permissions.READ_SELECTED_FILE)

  // https://developers.google.com/drive/api/v3/reference/files
  const results = await Promise.all([
    gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,fileExtension,parents', // Added parents field
    }),
    gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    }),
  ])

  const metadataResponse = results[0]
  const response = results[1]

  return {
    id: fileId,
    name: metadataResponse.result.name,
    mimeType: metadataResponse.result.mimeType,
    content: response.body,
    folderId: metadataResponse.result.parents?.[0], // Retrieve folderId
  }
}

export async function loadBinaryFile({ fileId, context }: FileParams): Promise<string> {
  await ensureContextPermission(context, Permissions.READ_FILE)

  // https://developers.google.com/drive/api/v3/reference/files
  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  })
  return btoa(response.body)
}

export async function createFile(params: CreateFileParams): Promise<FileDetailsWithContent> {
  const { parent } = resolveContext(params.context)
  if (!parent) throw new Error('A storage context is required to create a file')
  await ensureContextPermission(params.context, Permissions.SAVE_SELECTED_FILE)

  const isUpload = 'file' in params
  const filename = isUpload ? params.file.name : params.filename
  const mimeType = isUpload ? params.file.type || 'application/octet-stream' : 'text/markdown'
  const data = isUpload ? params.file : new Blob([params.content], { type: mimeType })
  const body = await readBase64(data)
  const boundary = '-------314159265358979323846'
  const delimiter = '\r\n--' + boundary + '\r\n'
  const response = await gapi.client.request({
    path: '/upload/drive/v3/files',
    method: 'POST',
    params: { uploadType: 'multipart', fields: 'id,name,mimeType,parents' },
    headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
    body: delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify({ name: filename, mimeType, parents: [parent] }) +
      delimiter +
      'Content-Type: ' + mimeType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      body +
      '\r\n--' + boundary + '--',
  })

  const result = response.result as gapi.client.drive.File
  const fileDetails: FileDetails = {
    id: result.id,
    name: result.name,
    mimeType: result.mimeType,
    folderId: result.parents?.[0],
  }
  return {
    ...fileDetails,
    content: isUpload ? body : params.content,
  }
}

function readBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read file content'))
        return
      }
      resolve(reader.result.slice(reader.result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file content'))
    reader.onabort = () => reject(new Error('File reading was aborted'))
    reader.readAsDataURL(file)
  })
}

export async function saveFile({ fileId, content, filename, context }: SaveFileParams): Promise<void> {
  await ensureContextPermission(context, Permissions.SAVE_SELECTED_FILE)

  if (filename !== undefined) {
    await gapi.client.request({
      path: '/drive/v3/files/' + fileId,
      method: 'PATCH',
      body: { name: filename },
    })
  }

  if (content !== undefined) {
    // according to https://stackoverflow.com/questions/40600725/google-drive-api-v3-javascript-update-file-contents
    // google drive javascript library doesn't support body upload
    await gapi.client.request({
      path: '/upload/drive/v3/files/' + fileId,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: content,
    })
  }
}

export async function loadFileMetadata({ fileId, context }: FileParams): Promise<FileDetailsWithLink> {
  await ensureContextPermission(context, Permissions.READ_SELECTED_FILE)
  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    fields: 'name, mimeType,webViewLink,parents', // Added parents field
  })
  return {
    id: fileId,
    name: response.result.name,
    mimeType: response.result.mimeType,
    url: response.result.webViewLink,
    folderId: response.result.parents?.[0], // Retrieve folderId
  }
}

export async function getUserRecentlyModifiedFiles(): Promise<RecentFileDetails[]> {
  await ensurePermissionGranted(Permissions.BROWSE_FILES)

  const response = await gapi.client.drive.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType, viewedByMeTime)',
    orderBy: 'viewedByMeTime desc',
    q: 'fileExtension=\'md\' or mimeType=\'text/markdown\'',
  })

  const files = response.result.files || []

  return files.map(file => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    viewedByMeTime: file.viewedByMeTime,
  }))
}

export async function findFiles({ filename, context }: FindFilesParams): Promise<FileDetails[]> {
  const { parent, isAppData } = resolveContext(context)
  if (!parent) throw new Error('A storage context is required to find files')
  await ensureContextPermission(context, Permissions.READ_SELECTED_FILE)

  const files: FileDetails[] = []
  let pageToken: string | undefined
  do {
    const response = await gapi.client.drive.files.list({
      q: `name='${escapeQueryValue(filename)}' and '${escapeQueryValue(parent)}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,parents,createdTime)',
      spaces: isAppData ? 'appDataFolder' : 'drive',
      orderBy: 'createdTime desc',
      pageToken,
    })
    files.push(...(response.result.files || []).map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      folderId: file.parents?.[0],
    })))
    pageToken = response.result.nextPageToken
  } while (pageToken)
  return files
}

export async function deleteFile({ fileId, context }: FileParams): Promise<void> {
  await ensureContextPermission(context, Permissions.SAVE_SELECTED_FILE)

  await gapi.client.drive.files.delete({
    fileId: fileId,
  })
}

export const googleDriveApi: StorageApi = {
  loadFile,
  loadBinaryFile,
  createFile,
  saveFile,
  loadFileMetadata,
  getUserRecentlyModifiedFiles,
  findFiles,
  deleteFile,
}
