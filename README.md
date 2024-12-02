# gdrive-markdown-editor

Markdown editor that integrates with your Google Drive.

## Generic directives

Custom tags might be created using [Generic directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444). Generic directives are implemented via `remark-directive` plugin.
In short this specification introduce following syntax to denote different types of nodes:
  * directives with prefix `:` denote inline directives (something like `a`)
  * directives with prefix `::` denote leaf block directives (something like `p`)
  * directives with prefix `:::` denote container block directives (something like `div`)

## Custom tags

### Embed file from google drive 

This tag will load file from your google drive and embed it into document as image.

```
::gdrive{src="googleFileId"}
```


### Embed youtube videos

This tag will create embed with youtube video.

```
::youtube{src="videoId"}
```

### Link referencing Gdrive file

This tag will insert inline link to the file from gdrive. When link is clicked and referenced file is markdown file (mime type is text/markdown or extension is .md) then it will open in markdown editor. Otherwise it will go to gdrive.

```
:gdrive-ref[link name]{src="fileId"}
```

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

### Jest vs Vitest

Jest was replaced with Vitest because of few issues.

It seems that milkdown is distributed as ES module and it was hard to setup jest to support ES modules and not break something else (for example jose library). Jest test were very slow. There was also problem with mocking modules which required using unstable apis.

For Vitest everything just works and is really simple to configure.

### Set content dynamically in milkdown editor

[See this milkdown Q&A](https://github.com/orgs/Milkdown/discussions/131)

### What is the difference between $node and $nodeSchema in Milkdown

It is not very clear what it is the main difference. [See this milkdown Q&A](https://github.com/orgs/Milkdown/discussions/1152) for some additional explanations.

## References

* [Google Authorization library](https://developers.google.com/identity/oauth2/web/guides/overview?hl=en)
* [Google Drive Api scopes](https://developers.google.com/drive/api/guides/api-specific-auth)
* [Google Picker Api Reference](https://developers.google.com/drive/picker/reference#DocsUploadView)
