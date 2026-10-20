# Plan: remove the unused `About` type

**Status: COMPLETED**

**Must be executed before** [file-api-interface-plan.md](./file-api-interface-plan.md), so the main plan does not move a dead type to `src/storage`.

## Problem
`About` (`{ appInstalled: boolean }`) is declared in `src/google/api.ts` and re-exported from `src/google/index.ts`. A search of `src/` and `test/` found no other use.

## Steps
1. Re-run a grep for `\bAbout\b` in `src/` and `test/` to confirm there is still no use outside those two places.
2. Delete the `About` interface from `src/google/api.ts`.
3. Delete the `type About` re-export from `src/google/index.ts`.
4. Verify with `tsc --noEmit` and eslint.

## Follow-up
In the main plan, `About` is no longer part of the types moved to `src/storage/types.ts`.
