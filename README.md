# gdrive-markdown-editor

Markdown editor that integrates with your Google Drive.

## Custom tags

### Embed file from google drive 
```
::gdrive{src="googleFileId"}
```
This tag will load file from your google drive and embed it into document as image.

## Developer notes

### Google Authentication & Authorization

Google made process of authentication and authorization separate. To authenticate you can use one of the buttons documented here: https://developers.google.com/identity/gsi/web/guides/overview

Google also promotes the granular authorization. So when access to user data is needed application should request only minimal set of required permissions. For authorization library might be used that will display pop up whenever permissions are requested. This library is documented here: https://developers.google.com/identity/oauth2/web/guides/overview

Note, that if authorization is not triggered by user gesture pop up will blocked by browsers usually.

### Google picker api

According to [this SO](https://stackoverflow.com/questions/11680429/using-google-picker-to-upload-files-to-google-drive-and-place-in-specific-folder) in order to enable upload to directory you need to enable `google.picker.Feature.MULTISELECT_ENABLED` feature.

Gdrive expose special scope `https://www.googleapis.com/auth/drive.file` that allows to "Create new Drive files, or modify existing files, that you open with an app or that the user shares with an app while using the Google Picker API or the app's file picker.". In order to use this scope with Google Picker API you need to pass your client id when creation google picker object.

### GDrive UI Integration

When configuring GDrive UI Integration there is an option to automatically show consent screen after user opens applicatin. This will trigger authentication code flow. After user gives consent browser will be redirected to the application with oauth flow parameters included as query parameters (code, scopes)

## References

* [Google Authorization library](https://developers.google.com/identity/oauth2/web/guides/overview?hl=en)
* [Google Drive Api scopes](https://developers.google.com/drive/api/guides/api-specific-auth)
* [Google Picker Api Reference](https://developers.google.com/drive/picker/reference#DocsUploadView)
