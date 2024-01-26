import { API_KEY, DISCOVERY_DOC, CLIENT_ID } from './const'
import { currentToken } from './auth'

export type FileDetails = {
  id: string
  name: string
  mimeType: string | undefined
}

export type FolderDetails = FileDetails

export type FileDetailsWithContent = FileDetails & {
  content: string
}

export async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  })
}

export function loadGapi() {
  return new Promise((resolve) => {
    const apiEle = document.createElement('script') as HTMLScriptElement
    apiEle.defer = true
    apiEle.src = 'https://apis.google.com/js/api.js'
    apiEle.addEventListener('load', () => {
      Promise.all(
        [loadGapiClient(), loadPicker()]
      )
        .then(() => resolve(true))
    })
    document.body.appendChild(apiEle)
  })
}

function loadGapiClient(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    gapi.load('client', {
      callback: () => resolve(true),
      onerror: (err: unknown) => reject('Failed to load gapi client. ' + err),
      timeout: 15000,
      ontimeout: () => reject('Timeout when loading gapi client'),
    })
  })
}

function loadPicker(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    gapi.load('picker', {
      callback: () => resolve(true),
      onerror: (err: unknown) => reject('Failed to load picker. ' + err),
      timeout: 15000,
      ontimeout: () => reject('Timeout when loading picker'),
    })
  })
}

export function showPicker(): Promise<string> {
  return new Promise((resolve, reject) => {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS).setIncludeFolders(true)
    const uploadView = new google.picker.DocsUploadView().setIncludeFolders(true)

    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.SIMPLE_UPLOAD_ENABLED)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .addView(view)
      .addView(uploadView)
      .setOAuthToken(currentToken().access_token)
      .setAppId(CLIENT_ID)
      .setDeveloperKey(API_KEY)
      .setCallback((res: google.picker.ResponseObject) => {
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          const doc = res[google.picker.Response.DOCUMENTS][0]
          const fileId = doc[google.picker.Document.ID]
          resolve(fileId)
        }
        else if (res[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
          reject('no pick')
        }
      })
      .build()
    picker.setVisible(true)
  })
}

export function showMarkdownPicker(): Promise<string> {
  return new Promise((resolve, reject) => {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setIncludeFolders(true)

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(currentToken().access_token)
      .setDeveloperKey(API_KEY)
      .setAppId(CLIENT_ID)
      .setCallback((res: google.picker.ResponseObject) => {
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          const doc = res[google.picker.Response.DOCUMENTS][0]
          const fileId = doc[google.picker.Document.ID]
          resolve(fileId)
        }
        else if (res[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
          reject('no pick')
        }
      })
      .build()
    picker.setVisible(true)
  })
}

export function showFolderPicker(): Promise<FolderDetails> {
  return new Promise((resolve, reject) => {
    const docsView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
      .setIncludeFolders(true)
      .setMimeTypes('application/vnd.google-apps.folder')
      .setSelectFolderEnabled(true)

    const picker = new google.picker.PickerBuilder()
      .addView(docsView)
      .setSelectableMimeTypes('application/vnd.google-apps.folder')
      .setOAuthToken(currentToken().access_token)
      .setDeveloperKey(API_KEY)
      .setAppId(CLIENT_ID)
      .setCallback((res: google.picker.ResponseObject) => {
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
          const doc = res[google.picker.Response.DOCUMENTS][0]
          const fileId = doc[google.picker.Document.ID]
          const name = doc[google.picker.Document.NAME]
          const mimeType = doc[google.picker.Document.MIME_TYPE]
          resolve({
            id: fileId,
            name: name,
            mimeType: mimeType,
          })
        }
        else if (res[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
          reject('no pick')
        }
      })
      .build()
    picker.setVisible(true)
  })
}

export async function loadFile(fileId: string): Promise<FileDetailsWithContent> {
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
  // https://developers.google.com/drive/api/v3/reference/files
  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  })
  return btoa(response.body)
}

export async function createFile(filename: string, content: string, parent: string): Promise<FileDetailsWithContent> {
  const response = await gapi.client.drive.files.create({
    uploadType: 'media',
  }, {
    name: filename + '.md',
    mimeType: 'text/markdown',
    parents: [
      parent,
    ],
  })

  return {
    id: response.result.id!,
    name: response.result.name!,
    mimeType: response.result.mimeType,
    content: content,
  }
}

export async function save(fileId: string, content: string) {
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
  await gapi.client.request({
    path: '/drive/v3/files/' + fileId,
    method: 'PATCH',
    body: {
      name: filename,
    },
  })
}
