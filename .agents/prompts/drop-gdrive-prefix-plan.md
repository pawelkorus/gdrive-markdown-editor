# Plan: drop `gdrive` prefix in src/service hooks

## Scope
Directories in `src/service/` and the hook/context names inside them.

> **NOTE: Do NOT touch `service/gdrive/` (`useGdriveIntegration`, `IntegrationStatus`). It stays as is, including its import in `IntegrationCheck.tsx`.**

## Renames
| Current | New |
|---|---|
| `service/gdrivefile/` | `service/file/` |
| `service/gdrivefiles/` | `service/files/` (stays a separate directory; do not merge into `file`) |
| `useGdriveFile` | `useFile` |
| `useGdriveFileCommands` / `GdriveFileCommands` | `useFileCommands` / `FileCommands` |
| `useGdriveFileMetadata` | `useFileMetadata` |
| `GdriveFileContext(+Provider, State)` | `FileContext(+Provider, State)` (file `FileContext.tsx`) |

Rule: keep the `src/google` boundary (UI never imports it directly).

## Exact symbol list (verified by grep)
Exported symbols:
- `GdriveFileContext` -> `FileContext` (GdriveFileContext.tsx:21; used in hooks.ts, App.tsx import)
- `GdriveFileContextState` -> `FileContextState` (GdriveFileContext.tsx:12)
- `GdriveFileContextProvider` -> `FileContextProvider` (GdriveFileContext.tsx:31; App.tsx:11,67,77)
- `GdriveFileCommands` (non-exported interface, hooks.ts:11) -> `FileCommands`
- `useGdriveFile` -> `useFile` (hooks.ts:5)
- `useGdriveFileCommands` -> `useFileCommands` (hooks.ts:17)
- `useGdriveFileMetadata` -> `useFileMetadata` (gdrivefiles/hooks.ts:4)

Local identifiers (rename for consistency):
- `gdriveFileContext` -> `fileContext` (service/gdrivefile/hooks.ts)
- `gdriveFile`, `gdriveFileId` -> `file`, `fileId` (routes/FileNewRoute.tsx:9,10,24,25,27)
- `updateGdriveContent` -> `updateContent` (ui/EditorView.tsx:20,62,66,69)
- `loadGdriveFile` -> `loadFile` (test/ui/components/DraftSelectorPanel.test.tsx:42,45,46)

Files with usages to update: App.tsx, routes/FileNewRoute.tsx, routes/FileRoute.tsx, service/draftfile/useDraftFile.ts,
ui/DraftsView.tsx, ui/EditorView.tsx, ui/ViewerView.tsx, ui/components/DraftSelectorPanel.tsx,
ui/source-editor/SourceEditor.tsx, ui/milkdown-editor/gdrive-ref-plugin/GDriveRef.tsx,
test/ui/components/DraftSelectorPanel.test.tsx (also `vi.mock` path + `useGdriveFile` mock key),
test/ui/milkdown-editor/gdrive-ref-plugin/GdriveRef.test.tsx (import, mock path, lines 17,86,106).

Explicitly NOT renamed (Drive-specific plugins / branding / kept service):
`useGdriveIntegration`, `IntegrationStatus`, `useGdriveEmbed`, `useGdriveRef`, `useGdriveRefCommands`,
`executeGdriveCommand`, `referenceGdriveFile(Command)`, `executeReferenceGdriveFileCommand`, `GDriveRef`, `GDriveEmbed`,
logo alt text "Gdrive Markdown Editor" in ui/nav/Nav.tsx.

## Steps
1. `git mv` the directories and `GdriveFileContext.tsx` -> `FileContext.tsx`.
2. Rename symbols above (use rename-symbol/usages, not blind sed; avoid touching `gdrive-ref-plugin`, `gdrive-embed-plugin`, which are Drive-specific UI).
3. Update imports (`@app/service/...` and relative `../service/...`) in:
   - src/App.tsx, src/routes/FileRoute.tsx, FileNewRoute.tsx
   - src/service/draftfile/useDraftFile.ts (imports `../gdrivefile`, uses `useGdriveFile`)
   - src/ui/EditorView.tsx, DraftsView.tsx, ViewerView.tsx
   - src/ui/components/DraftSelectorPanel.tsx (NOT IntegrationCheck.tsx)
   - src/ui/source-editor/SourceEditor.tsx
   - src/ui/milkdown-editor/gdrive-ref-plugin/GDriveRef.tsx
4. Update tests and `vi.mock` paths/names: test/ui/components/DraftSelectorPanel.test.tsx, test/ui/milkdown-editor/gdrive-ref-plugin/GdriveRef.test.tsx.
5. Collision check: `draftfile/types.ts` also exports `FileDetails`; `useFile`/`useFileCommands` don't clash with `useDraftFile(s)`, but verify imports in useDraftFile.ts.
6. Verify: `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, then grep for leftover `Gdrive`/`service/gdrivefile(s)` (ignore `service/gdrive` and `useGdriveIntegration`, which stay).

## Decisions
- `files` stays separate from `file`; the `gdrive` prefix is dropped there too.
