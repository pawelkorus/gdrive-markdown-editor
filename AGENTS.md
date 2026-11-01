# AGENTS.md

## Overview

Browser-only (SPA) Markdown editor that opens, edits and saves files in Google Drive. Editing is WYSIWYG via Milkdown, with a plain-text source editor alternative. Custom markdown directives (`::gdrive{src}`, `::youtube{src}`, `:gdrive-ref[name]{src}`) are documented in [README.md](README.md).

## Stack

- TypeScript, React 19, React Router 7, React Bootstrap / Bootstrap 5, SCSS
- Milkdown 7 (ProseMirror) + `remark-directive`
- Google Identity Services, Drive API and Picker (via `gapi`), `jose`
- Vite 8, Vitest + Testing Library (jsdom), ESLint 9 (flat config, `eslint.config.ts`)
- Node >= 24

## Commands

- `npm run develop` - dev server (Vite, basic-ssl)
- `npm run build` - production build (output to `target/`)
- `npm run lint` - ESLint
- `npm test` - Vitest single run; `npm run test-watch` for watch mode

## Layout

- `src/google/` - the only place that wraps Google API calls (auth, authorization/scopes, picker, Drive API, script loading). All code that uses Google API should not escape from here.
- `src/service/` - React contexts and custom hooks (command, draftfile, file, files, gdrive, navbar, navigate, notification, storage, user). UI reaches Google functionality only through these.
- `src/storage/` - storage abstraction types.
- `src/routes/` - route components (`FileRoute`, `FileNewRoute`).
- `src/ui/` - views and components:
  - `commandPalette/` - command palette
  - `components/` - shared components
  - `googleSSO/` - sign-in
  - `milkdown-editor/` - editor and plugins (blockquote, extended-input-rules, gdrive-embed, gdrive-ref, inspector, remark, youtube)
  - `source-editor/` - plain-text editor
  - `nav/` - navbar
- `test/` - tests mirroring `src/ui` and `src/service`; helpers in `test/test-utils/` (e.g. `createFakeStorageApi`, `TestMilkdownEditor`).
- `target/` - build output; do not edit.

## Conventions

- UI components must not import from `src/google` directly; use hooks in `src/service`.
- Google scopes are defined in `toScope` in `src/google/authorization.ts`; keep them minimal (e.g. `drive.file`).
- Authorization popups must be triggered by a user gesture, or browsers block them.
- Use the fake storage API from `test/test-utils` rather than real Google calls in tests.
- Run `npm run lint` and `npm test` after changes.
