# Plan: unify import style to the `@app/*` alias

**Status: Completed**

**Must be executed before** [file-api-interface-plan.md](./file-api-interface-plan.md). That plan references this one as a prerequisite. This plan can run before or after [source-editor-upload-hook-plan.md](./source-editor-upload-hook-plan.md), because the two touch different lines.

## Problem
Cross-folder imports use two styles: relative paths (`../../google`, `../service/file`) and the alias `@app/*` (`@app/google`, `@app/service/file`). The alias is defined in `tsconfig.json` and `vite.config.ts`. A mix makes the final check of the main plan (no `src/google` imports outside `service/` and the app root) harder to run with a single grep.

## Decision
Use `@app/*` for imports that cross top-level folders, which are `google`, `service`, `ui`, `routes` and the future `storage`. Keep short relative imports within the same folder (`./types`).

## Files to change
Parent-relative imports of `google`, `service` or `ui` code:
- `src/service/`: `draftfile/types.ts`, `draftfile/useDraftFile.ts`, `draftfile/useDraftFiles.ts`, `file/FileContext.tsx`, `user/UserContext.tsx`, `files/hooks.ts` (all `../../google`).
- `src/ui/`: `HomeView.tsx`, `useGlobalCommands.ts`, `EditorView.tsx`, `DraftsView.tsx`, `nav/Nav.tsx`, `googleSSO/index.tsx`.
- `src/ui/milkdown-editor/`: `gdrive-embed-plugin/index.tsx`, `gdrive-embed-plugin/GDriveEmbed.tsx`, `gdrive-ref-plugin/index.tsx`, `useMilkdownCommands.tsx`.
- `src/routes/`: `FileNewRoute.tsx`, `FileRoute.tsx`.

## Steps
1. Re-run grep for parent-relative imports to get the current list: `from '(\.\./)+(google|service|ui)`.
2. Replace each with the `@app/...` equivalent, for example `'../../google'` becomes `'@app/google'`. Change only the import path, not the imported names.
3. Do not touch imports inside `src/google/`, `.scss` imports, or same-folder imports.
4. Optional: add an eslint rule that bans parent-relative imports (`no-restricted-imports` with the `../*` pattern). Add it only if it produces no other violations.
5. Verify with `tsc --noEmit`, eslint, vitest, and a vite build. Run grep again and expect no matches.

## Follow-up
After this plan, the main plan's final check is one grep for `@app/google` outside `service/` and the app root. The accepted exceptions are the picker and auth imports.
