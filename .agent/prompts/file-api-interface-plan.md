# Plan: extract a storage interface from `src/google/api.ts`

**Status: completed**

**Goal:** Define a provider-agnostic interface. The Google module implements it. The rest of the app depends only on the interface.

## 1. Define the interface and types
New `src/storage/types.ts` (neutral location, so `google/` and `service/` both depend on it and there is no cycle):
- Move the provider-neutral types here: `FileDetails`, `FolderDetails`, `FileDetailsWithContent`, `FileDetailsWithLink`, plus a named `RecentFileDetails = FileDetails & { viewedByMeTime: string }` for `getUserRecentlyModifiedFiles`.
- Add `src/storage/index.ts` to re-export the public types from `./types` (`StorageApi`, `FileDetails`, `FolderDetails`, `FileDetailsWithContent`, `FileDetailsWithLink`, `RecentFileDetails`, `CreateFileParams`), so imports from `@app/storage` resolve through the directory barrel.
- Declare `interface StorageApi` with these methods:
  - Explicit return types, so Google response shapes don't leak into the interface: `save` and `updateFileName` return `Promise<void>`; `getFileMetadata` returns `Promise<FileDetailsWithLink>`; `loadFile` and `createFile` return `Promise<FileDetailsWithContent>`.
  - `loadFile(id)`
  - `loadBinaryFile(id)`
  - `createFile({filename, content, parent})`
  - `save(id, content)`
  - `updateFileName(id, name)`
  - `getFileMetadata(id)`
  - `getUserRecentlyModifiedFiles()`
  - `createFileInAppDirectory(name)`
  - `findFileInAppDirectory(name)`
  - `deleteFileFromAppDirectory(id)`
  - `uploadFileToDrive(file, parentId)`
- Leave `initializeGapiClient` out. It is a Google-specific lifecycle step.
- Export `CreateFileParams`, which is currently private.
- Keep the current method names, including `uploadFileToDrive` and the `*AppDirectory` methods. Renaming is out of scope.

## 2. Implement it in the Google module
- In `src/google/api.ts`, import the types from the interface and remove the local type declarations.
- Add `export const googleDriveApi: StorageApi = { ... }`, a plain object built from the existing functions.
- Update `src/google/index.ts` to export the instance and `initializeGapiClient`. Remove the individual function exports and the type re-exports (`FileDetails`, etc.) so `src/storage` is the single source of truth for types. Pickers, auth and state exports stay.
- Define `googleDriveApi` at module level (a single stable instance). Existing behaviour is unchanged: `RootView` still runs `initializeGapiClient` before consumers call the API.

## 3. Provide the interface through the service layer
- Add `StorageApiContext` and a `useStorageApi()` hook in `src/service/storage/`. They import `StorageApi` from `src/storage`. `src/service/gdrive/` already exists and holds authorization helpers, so do not put the new code there.
- Create the context with no default value. `useStorageApi()` throws a clear error when no provider is present, so a missing provider fails loudly instead of silently using Google.
- Add a `StorageApiProvider` component in the same folder that takes the `StorageApi` as a prop, and export it from `src/service/storage/index.ts`. The provider must pass the `api` prop straight through as the context value (no spreading, no new object per render), so consumers' hook dependencies stay stable.
- Wire up the provider in `src/App.tsx`, above the other providers (`FileContext` and others need it), with `googleDriveApi`. `src/index.tsx` only renders `<App />`, so leave it unchanged. `RootView` keeps importing `initializeGapiClient` and `parseGoogleState` from `@app/google`. Tests can wrap components in the provider with a mock.
- Only the root and `service/` may import `src/google`. This follows the repo rule that UI components don't touch `src/google`.

## 4. Migrate consumers
- `service/files/hooks.ts`, `service/draftfile/useDraftFiles.ts`, `service/draftfile/useDraftFile.ts`, `service/draftfile/types.ts`, `service/file/FileContext.tsx`: replace the `google` imports with `useStorageApi()` and the shared types.
- Hook dependencies: `useDraftFile`, `useDraftFiles`, `FileContext` and `useFileMetadata` call the API inside effects and callbacks. The API now comes from `useStorageApi()`, a context value, so add it to the dependency array of every `useEffect`, `useCallback` and `useMemo` that uses it, so `react-hooks/exhaustive-deps` passes. Make sure the provider receives the stable `googleDriveApi` object, not one created on each render, to avoid extra re-runs.
- Duplicate type aliases: `service/draftfile/types.ts` (`FileDetails = googleApi.FileDetails`) and `service/file/FileContext.tsx` (`FileDetails = googleApi.FileDetailsWithContent`) re-export Google types. Redefine them from the shared types in `src/storage` (`FileDetails`, `FileDetailsWithContent`), keeping the exported names so `EditorView.tsx`, `DraftSelectorPanel.tsx` and `service/file/hooks.ts` need no change.
- `service/files/hooks.ts` `useUploadFile()` (added by the SourceEditor plan): switch it from `uploadFileToDrive` in `@app/google` to `useStorageApi().uploadFileToDrive`.
- `ui/HomeView.tsx`: use `getUserRecentlyModifiedFiles` through a service hook, `useRecentFiles()` in `service/files/hooks.ts`, returning `RecentFileDetails[]` (loaded via `useStorageApi().getUserRecentlyModifiedFiles`).
- `ui/milkdown-editor/gdrive-embed-plugin/GDriveEmbed.tsx`: use `loadBinaryFile` through `useStorageApi()`.
- Pickers (`showPicker`, `showFolderPicker`, `showMarkdownPicker`) are used in `ui/useGlobalCommands.ts` and the `gdrive-embed-plugin` and `gdrive-ref-plugin` index files. They are not part of `api.ts`, so they stay as they are. A `FilePicker` interface is out of scope.
- `service/user/UserContext.tsx` (`authenticateUser`) also stays as it is. An `AuthApi` interface is out of scope.
- `service/gdrive/index.ts` also imports `@app/google/authorization` directly. It is auth, so it stays.
- These direct `google` imports remain after this work. A later follow-up can address them.

## 5. Test adjustments
Existing tests do not mock `@app/google`. They mock service modules (`@app/service/files`, `@app/service/navigate`, `@app/service/draftfile`, `@app/service/file`), so most need no change. `useStorageApi()` throws without a provider, so components that now call it need one in tests.
- Add a test helper in `test/test-utils/`, for example `createFakeStorageApi(overrides?)`. It returns a full `StorageApi` with every method as `vi.fn()`. Export it from `test/test-utils/index.ts`.
- Wrap `StorageApiProvider` (with the fake) inside `TestMilkdownEditor.tsx`, next to `CommandsContextProvider`, so editor plugin tests that render `GDriveEmbed` (which now uses `useStorageApi().loadBinaryFile`) do not throw. The fake's defaults must resolve rather than return `undefined` (for example `loadBinaryFile` resolves `''`, list methods resolve `[]`). Also wrap any test that renders `HomeView` in the provider. Create the fake once per test (not inline in a component body) so effect dependencies stay stable. Type the helper's return as `StorageApi` so TypeScript flags interface changes. Let the helper accept an optional `StorageApi` prop for tests that assert on calls.
- Run the existing suites (`BlockquotePlugin`, `YoutubePlugin`, `GdriveRef`, `DraftSelectorPanel`, `CommandPalette`, `LastSavedTimestampPanel`) and fix any that fail because of a missing provider.
- Do not update snapshots. They contain the Google script tags from `google/load.ts`, which must not change. If a snapshot changes, treat it as a regression.
- Add a small test for `useStorageApi()`: it throws without a provider and returns the injected API inside one.

## 6. Tests and verification
- Run `tsc --noEmit`, eslint and vitest.
- Run `grep` for the `api.ts` function names (`loadFile`, `loadBinaryFile`, `createFile`, `save`, `updateFileName`, `getFileMetadata`, `getUserRecentlyModifiedFiles`, `*AppDirectory`, `uploadFileToDrive`) imported from `@app/google`. None may remain anywhere except the composition root (`App.tsx`, which imports `googleDriveApi`). Also confirm `ui/` imports only pickers from `@app/google`. Picker and auth imports (including `service/user` and `service/gdrive`) are the accepted exceptions.

## Decisions
- Keep the current method names.
- Implement with a plain object.
- Skip the picker and auth interfaces for now.
