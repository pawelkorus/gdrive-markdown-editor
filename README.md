# gdrive-markdown-editor

Markdown editor that integrates with your Google Drive.

## Custom tags

### Embed file from google drive 
```
::gdrive{src="googleFileId"}
```
This tag will load file from your google drive and embed it into document as image.

## Development notes

### Google picker api

According to [this SO](https://stackoverflow.com/questions/11680429/using-google-picker-to-upload-files-to-google-drive-and-place-in-specific-folder) in order to enable upload to directory you need to enable `google.picker.Feature.MULTISELECT_ENABLED` feature.

## References

[Google Authorization library](https://developers.google.com/identity/oauth2/web/guides/overview?hl=en)
[Google Picker Api Reference](https://developers.google.com/drive/picker/reference#DocsUploadView)
