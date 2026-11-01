# Application configuration

`src/service/appconfig` holds the typed app configuration. `AppConfigProvider`
(in `App.tsx`, inside `UserContextProvider`) loads it once the user is
authenticated, i.e. when storage is usable. Consumers call `useAppConfig()`,
which returns the `AppConfig` object (defaults until loading finishes; the
context also tracks a `loaded` flag).

- Stored as `config.json5` in `StorageContext.AppConfig` (Drive `appDataFolder`),
  parsed with `json5` so comments are allowed.
- If the file is missing, the provider creates it from `defaultAppConfig` with every property commented out.
  Load/parse errors are logged and defaults are used.
- `parseAppConfig` validates each field and falls back to `defaultAppConfig`
  for missing or wrongly-typed values.
- Current properties: `testConfig: string` (default `'default'`). Add new
  properties to `AppConfig`, `defaultAppConfig`, `parseAppConfig` and the
  settings form.

## Settings editor

`SettingsView` (`src/ui/SettingsView.tsx`, route `/settings`, linked from the
navbar in `src/ui/nav/Nav.tsx`) edits the config through
`useUpdateAppConfig()`, which exposes `updateConfig` from the context. It
looks up `config.json5`, overwrites it (or creates it) with
`serializeAppConfig` (plain JSON5, so comments are lost on save), and then
updates the in-memory config.
