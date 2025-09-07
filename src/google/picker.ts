import { FolderDetails } from './api'
import { currentToken, ensurePermissionGranted, Permissions } from './authorization'
import { API_KEY, CLIENT_ID } from './const'
import { loadPicker } from './load'
import { Errors } from './types'

export async function showPicker(): Promise<string> {
  await loadPicker
  await ensurePermissionGranted(Permissions.BROWSE_FILES)

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
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED as string) {
          const doc = res[google.picker.Response.DOCUMENTS][0]
          const fileId = doc[google.picker.Document.ID]
          resolve(fileId)
        }
        else if (res[google.picker.Response.ACTION] == google.picker.Action.CANCEL as string) {
          reject(new Error('no pick'))
        }
      })
      .build()
    picker.setVisible(true)
  })
}

export async function showMarkdownPicker(): Promise<string> {
  await loadPicker
  await ensurePermissionGranted(Permissions.BROWSE_FILES)

  return new Promise((resolve, reject) => {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setIncludeFolders(true)

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(currentToken().access_token)
      .setDeveloperKey(API_KEY)
      .setAppId(CLIENT_ID)
      .setCallback((res: google.picker.ResponseObject) => {
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED as string) {
          const doc = res[google.picker.Response.DOCUMENTS][0]
          const fileId = doc[google.picker.Document.ID]
          resolve(fileId)
        }
        else if (res[google.picker.Response.ACTION] == google.picker.Action.CANCEL as string) {
          reject(new Error(Errors.NO_FILE_SELECTED))
        }
      })
      .build()
    picker.setVisible(true)
  })
}

export async function showFolderPicker(): Promise<FolderDetails> {
  await loadPicker
  await ensurePermissionGranted(Permissions.BROWSE_FILES)

  return new Promise<FolderDetails>((resolve, reject) => {
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
        if (res[google.picker.Response.ACTION] == google.picker.Action.PICKED as string) {
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
        else if (res[google.picker.Response.ACTION] == google.picker.Action.CANCEL as string) {
          reject(new Error(Errors.NO_FILE_SELECTED))
        }
      })
      .build()
    picker.setVisible(true)
  })
}
