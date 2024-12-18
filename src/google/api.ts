import { API_KEY, DISCOVERY_DOC } from './const'
import { ensurePermissionGranted, Permissions } from './authorization'
import { loadGapiClient } from './load'

export type FileDetails = {
  id: string
  name: string
  mimeType: string | undefined
}

export type FolderDetails = FileDetails

export type FileDetailsWithContent = FileDetails & {
  content: string
}

export type FileDetailsWithLink = FileDetails & {
  url: string
}

export type About = {
  appInstalled: boolean
}

export async function initializeGapiClient() {
  await loadGapiClient

  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  })
}

export async function loadFile(fileId: string): Promise<FileDetailsWithContent> {
  await ensurePermissionGranted(Permissions.READ_SELECTED_FILE)

  // https://developers.google.com/drive/api/v3/reference/files
  const results = await Promise.all([
    gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,fileExtension',
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
    name: metadataResponse.result.name!,
    mimeType: metadataResponse.result.mimeType,
    content: response.body,
  }
}

export async function loadBinaryFile(fileId: string): Promise<string> {
  await ensurePermissionGranted(Permissions.READ_FILE)

  // https://developers.google.com/drive/api/v3/reference/files
  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  })
  return btoa(response.body)
}

type CreateFileParams = {
  filename: string
  content: string
  parent: string
}

export async function createFile(params: CreateFileParams): Promise<FileDetailsWithContent> {
  await ensurePermissionGranted(Permissions.SAVE_SELECTED_FILE)

  const response = await gapi.client.drive.files.create({
    uploadType: 'media',
  }, {
    name: params.filename + '.md',
    mimeType: 'text/markdown',
    parents: [
      params.parent,
    ],
  })

  return {
    id: response.result.id!,
    name: response.result.name!,
    mimeType: response.result.mimeType,
    content: params.content,
  }
}

export async function save(fileId: string, content: string) {
  await ensurePermissionGranted(Permissions.SAVE_SELECTED_FILE)

  // according to https://stackoverflow.com/questions/40600725/google-drive-api-v3-javascript-update-file-contents
  // google drive javascript library doesn't support body upload
  await gapi.client.request({
    path: '/upload/drive/v3/files/' + fileId,
    method: 'PATCH',
    params: {
      uploadType: 'media',
    },
    body: content,
  })
}

// generate method that will update gdrive file name
export async function updateFileName(fileId: string, filename: string) {
  await ensurePermissionGranted(Permissions.SAVE_SELECTED_FILE)

  await gapi.client.request({
    path: '/drive/v3/files/' + fileId,
    method: 'PATCH',
    body: {
      name: filename,
    },
  })
}

export async function getFileMetadata(fileId: string): Promise<FileDetailsWithLink> {
  await ensurePermissionGranted(Permissions.READ_SELECTED_FILE)
  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    fields: 'name, mimeType,webViewLink',
  })
  return {
    id: fileId,
    name: response.result.name!,
    mimeType: response.result.mimeType,
    url: response.result.webViewLink!,
  }
}

export async function getUserRecentlyModifiedFiles(): Promise<(FileDetails & { viewedByMeTime: string })[]> {
  await ensurePermissionGranted(Permissions.BROWSE_FILES)

  const response = await gapi.client.drive.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType, viewedByMeTime)',
    orderBy: 'viewedByMeTime desc',
    q: 'fileExtension=\'md\' or mimeType=\'text/markdown\'',
  })

  const files = response.result.files || []

  return files.map(file => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    viewedByMeTime: file.viewedByMeTime!,
  }))
}

export async function createFileInAppDirectory(filename: string): Promise<FileDetails> {
  await ensurePermissionGranted(Permissions.MAINTAIN_APP_DATA)

  const appFolderId = 'appDataFolder' // Special alias for the app-specific folder

  const response = await gapi.client.drive.files.create({
    uploadType: 'media',
  }, {
    name: filename,
    mimeType: 'text/markdown',
    parents: [appFolderId],
  })

  return {
    id: response.result.id!,
    name: response.result.name!,
    mimeType: response.result.mimeType,
  }
}

export async function findFileInAppDirectory(filename: string): Promise<FileDetails[]> {
  await ensurePermissionGranted(Permissions.MAINTAIN_APP_DATA)

  const response = await gapi.client.drive.files.list({
    q: `name='${filename}' and 'appDataFolder' in parents`,
    fields: 'files(id, name, mimeType, createdTime)',
    spaces: 'appDataFolder',
    orderBy: 'createdTime desc',
  })

  const files = response.result.files || []
  console.log(files)
  return files.map(file => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType,
  }))
}

export async function deleteFileFromAppDirectory(fileId: string): Promise<void> {
  await ensurePermissionGranted(Permissions.MAINTAIN_APP_DATA)

  await gapi.client.drive.files.delete({
    fileId: fileId,
  })
}
