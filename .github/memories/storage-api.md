# Storage API

File operations in `src/storage` accept a single params object. `createFile`
has one signature accepting `CreateFileParams` (text or browser `File`) and
always returns `FileDetailsWithContent`. `content` contains the original text
for text files and base64-encoded bytes for uploaded files. `context` is
a provider-specific parent folder ID or path, or a `StorageContext` enum
value (`Temp` or `AppConfig`). The Google adapter treats strings as Drive folder
IDs (not filesystem paths), and maps both special values to `appDataFolder`.
These two contexts share the same directory; they are not isolated namespaces.

```ts
await api.createFile({ filename: 'notes.md', content: '# Notes', context: folderId })
await api.createFile({ file: uploadedFile, context: folderId })
await api.createFile({
  filename: 'draft_' + fileId,
  content: '# Draft',
  context: StorageContext.Temp,
})
await api.findFiles({ filename: 'draft_' + fileId, context: StorageContext.Temp })
await api.loadFile({ fileId: draftId, context: StorageContext.Temp })
await api.saveFile({ fileId: draftId, content: '# Updated', context: StorageContext.Temp })
await api.saveFile({ fileId, filename: 'renamed.md' })
await api.deleteFile({ fileId: draftId, context: StorageContext.Temp })
```

Creation preserves the exact filename and uploads content in the same request.
Text creation returns metadata with the original text; browser `File` creation
returns metadata with base64-encoded bytes. `findFiles` matches an exact
filename within the context and returns all matches, newest first.

Creation and lookup require a context. ID-based operations allow it to be omitted
for ordinary Drive files, but app-data files must use `Temp`, `AppConfig`, or
`'appDataFolder'` so the adapter requests the app-data permission instead of
ordinary Drive permissions. Recent files remain a user-level, no-argument query.
`saveFile` accepts content, a filename, or both; filename changes are part of the
same API method, although the Google adapter makes separate Drive requests for
metadata and content when both are supplied.
UI code accesses storage through service hooks, not the Google adapter directly.
