# design-sync notes

Persisted so a resumed run does not re-derive any of this.

## Run status

- **Built and verified locally; not yet uploaded.** No `projectId` —
  `DesignSync` still cannot authorize (checked again in a later session,
  same result). Nothing was uploaded and no Claude Design project was
  created, so the next run is still a first-time import (§0 and §1 of the
  skill apply in full).
- The local half is **complete and at the done-bar**: the bundle builds clean,
  the driver's validate stage exits 0 with `10/10 previews render cleanly`,
  and all 32 story cells across 10 components are graded `good` in
  `.design-sync/.cache/review/*.grade.json` — all carried forward unchanged
  across the conventions-header rebuild (see below).
- The README now carries an authored conventions header (see "Conventions
  header" below) — that was the last local task. Nothing is left before
  upload except getting `DesignSync` authorized.
- **Unblock the upload** by running `/design-login` once from an interactive
  `claude` terminal on this machine; headless runs then reuse that auth. After
  that, a re-run picks up from the built `ds-bundle/` — the expensive part is
  already done.

## Shape

- `shape = "package"`. **No Storybook** — confirmed by the user, and there is no
  `.storybook/`, no `*.stories.*`, and no storybook dependency.
- Do not be misled by `figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.…' })`
  in `vite.config.ts`. That is Figma Make's own dev-only preview route
  (`/.figma/make/kit.html`), not Storybook. Writing files matching that glob
  would light up Figma Make's design surface — a possible future nicety, and a
  source of usage examples for preview generation, but it is not a Storybook.

## Repo layout

This repo is a Figma Make **application** that also publishes a design system.
Two separate builds, two separate output dirs — do not confuse them:

| | app | design system |
|---|---|---|
| config | `vite.config.ts` | `vite.lib.config.ts` |
| command | `pnpm build` | `pnpm build:ds` |
| out | `dist/` | `dist-ds/` |

- The library entry is `src/ds/index.ts`; `package.json` `exports` points at
  `dist-ds/oasis-ds.js` with types at `dist-ds/ds/index.d.ts`.
- `pnpm build:ds` runs the Vite lib build **and** `tsc -p tsconfig.lib.json`
  for declarations. Both are needed — run the script, not just Vite.
- `dist-ds/oasis-ds.css` is the whole stylesheet: tokens **and** component
  classes, in one file (`cssCodeSplit: false`). The entry imports
  `../index.css`, so the CSS is a real dependency of the components, not a
  side file. Keep it reachable from `styles.css`'s `@import` closure.
- Components are styled almost entirely by CSS custom properties defined in
  `:root` / `.dark` in `src/index.css`. A component rendered without that
  stylesheet loses every colour, radius, stroke and shadow.

## Toolchain

- `.mise.toml` pins node 22 and pnpm 10.34.3.
- **Both** `package-lock.json` and `pnpm-lock.yaml` are present. `.mise.toml`
  pins pnpm, so `pnpm i --frozen-lockfile` is the faithful install;
  `package-lock.json` is stale and should be ignored (or deleted).

## Scope

Ten primitives are published, all from `src/ds/`:
`ZoneChip`, `Tag`, `Initials`, `OasisBlob`, `CircularGauge`, `Sparkline`,
`SleepBars`, `StatTile`, `LoadBar`, `WeekCalendar`.

Deliberately **not** published — these are app composition, not design system:
`DayDetail`, `CommitmentCheck`, `VoiceAssistantPanel`, `SideRail`, `MobileNav`,
the four page components, and `App`. They live in `src/App.tsx`.

## Design rules

`DESIGN.md` at the repo root is the written design language; `src/index.css` is
the source of truth it describes. Preview cards and `.prompt.md` files should
follow its five rules — every surface takes a 2px ink stroke, primary action is
ink-black, selection is yellow `#f7d046`, and colour is reserved for health
meaning (green/amber/red zones).

## Conventions header

`.design-sync/conventions.md` (~3.8 KB) is a distilled, build-validated
version of `DESIGN.md`'s five rules, wired in via `cfg.readmeHeader` and
stitched onto the generated `ds-bundle/README.md`. It exists because
`DESIGN.md` itself never reaches the design agent — `guidelines/` stays
empty (nothing matches `guidelinesGlob`), so this header is the only carrier
of the design language for the design agent. Every class/token/prop name in
it is grep-confirmed against the compiled `_ds_bundle.css`/`_ds_bundle.js`,
per the skill's "validate before shipping" rule.

If `DESIGN.md` changes, re-derive this file by hand — it is not
auto-generated from it — and re-run the full driver afterward so the receipt
and upload plan describe the header-bearing build (a bare converter run
without the driver wipes `.sync-diff.json` and the receipt artifacts).

## Running the converter scripts (important)

The skill's scripts live in an **ephemeral, content-addressed** bundled-skills
temp dir. Installing deps there appears to succeed and then vanishes:
`npm i --no-save esbuild ts-morph playwright` reported `added 12 packages` and
exit 0, and `node_modules` was gone by the next command. Do not fight it.

Instead follow the skill's own staging procedure — copy the scripts into the
repo and install their deps there, isolated from the repo's pnpm lockfile:

    cp -r <skill-base-dir>/{package-build.mjs,package-validate.mjs,          package-capture.mjs,resync.mjs,lib,storybook} .ds-sync/
    # .ds-sync/package.json = {"name":"ds-sync-deps","private":true}
    cd .ds-sync && npm i esbuild ts-morph @types/react playwright

`.ds-sync/` is gitignored. Re-create it on any machine that runs a sync.

`resync.mjs` resolves `.design-sync/` relative to the process's **current
working directory**, not relative to `--config`'s path. Always invoke it from
the repo root:

    node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle

Running it from inside `.ds-sync/` (even with a `../`-relative `--config`)
fails immediately with `no .design-sync/ under …/.ds-sync`.

`npm i playwright` installs the JS package but not the browser binary — the
validate stage's render check needs an actual Chromium download, a separate
and much larger step that the `.ds-sync/` dep reinstall above does not cover:

    cd .ds-sync && npx playwright install chromium

Do this once per machine/environment (it installs to
`%LOCALAPPDATA%\ms-playwright\`, outside both node_modules trees) whenever
the driver reports `[RENDER_SKIPPED] ... Executable doesn't exist`.

## Previews

`.design-sync/previews/<Name>.tsx` holds **10 authored preview files, 32 story
cells** — one per published component. These are committed and **user-owned**:
the converter reads them and never writes or deletes there. They are the
highest-leverage artifact in the bundle, because the design agent imitates them
through the synthesized `.prompt.md`.

- Every prop value and every string was lifted from real call sites and mock
  data in `src/App.tsx` (`hrValues`, `sleepData`, the five load categories, the
  StatTile trio, `CALENDAR_WEEK`). Nothing invented, no `foo`/`test` content.
- They import from `'figma-make-app'` — the package `name`, which the preview
  compiler shims to `window.OasisDS`. Not a relative path, not `@/ds`.
- `lucide-react` resolves through the build's `nodePaths`, so icon props work.
- Without authored previews the converter falls back to stubs, and the contact
  sheet showed exactly what that costs: empty chart boxes, a blank calendar, and
  the literal string "StatTile" where the tile should be. Always author them.

## Overrides

`cfg.overrides` carries two `cardMode: "column"` entries, both real fixes for a
`[GRID_OVERFLOW]` validate warning (stories rendering wider than their grid
cell, so the product card crops them):

- `WeekCalendar` — a seven-day grid is inherently wide.
- `Tag` — the `AsEyebrow` story carries a `t-hero` headline.

After changing an override a targeted rebuild is enough, no full rebuild:
`node .ds-sync/preview-rebuild.mjs --components <Name>`.
