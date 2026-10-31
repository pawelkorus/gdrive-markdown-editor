# Plan: remove the direct `src/google` import from `SourceEditor`

**Status: COMPLETED** (all steps done; step 4 test added in `test/ui/source-editor/SourceEditor.test.tsx`).

**Must be executed before** [file-api-interface-plan.md](./file-api-interface-plan.md). That plan references this one as a prerequisite.

## Problem
`src/ui/source-editor/SourceEditor.tsx` imports `uploadFileToDrive` from `@app/google`. This breaks the repo rule that UI components use `src/google` only through hooks in `src/service/`. It is the one consumer of `uploadFileToDrive`. `uploadFileToDrive` is also listed in the `StorageApi` interface of the other plan.

## Steps
1. Add a hook in `src/service/files/hooks.ts`, for example `useUploadFile()`, that returns `(file: File, parentId: string) => Promise<FileDetails>`. For now it wraps `uploadFileToDrive` from `../../google`.
2. Export it from `src/service/files/index.ts`.
3. In `SourceEditor.tsx`:
   - Remove the `@app/google` import.
   - Call `useUploadFile()` and use the returned function in `handleFileDrop`.
   - Replace `uploadFileToDrive` in the `useCallback` dependency array with the hook's function. Today the array lists the imported module function, which is wrong.
4. Check for a `SourceEditor` test. If there is none, optionally add a small test with the hook mocked, in the style of `GdriveRef.test.tsx`, which mocks service hooks.
5. Verify with `tsc --noEmit`, eslint and vitest. Run grep to confirm that `ui/source-editor` has no `google` import.

## Follow-up
When the main plan runs, `useUploadFile()` switches to `useStorageApi().uploadFileToDrive`. `SourceEditor.tsx` needs no further change.
