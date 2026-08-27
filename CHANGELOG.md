# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-08-28

A visual release. The component API is unchanged — every prop, method, hook and
adapter behaves exactly as it did in 1.2.x — but the default appearance is new
and the old one is opt-in.

### Fixed

- **Steps rendered in the error colour before the user had done anything.**
  `showErrorOnTab` defaulted to `!isValid`, so any step carrying a validator
  painted its marker red on first paint — a wizard whose first question was
  required looked broken on load. The error state now waits until the user has
  actually tried to leave the step. An explicit `showErrorOnTab` still applies
  immediately.
- **Dark mode barely worked.** The stylesheet had no `prefers-color-scheme`
  rules at all; dark mode existed only as inline styles you had to hand-list
  through `customDarkModeColor`. The wizard now ships a real dark palette.

### Added

- **Tailwind integration**, two ways. `react-form-wizard-component/tailwind.css`
  maps the wizard's tokens onto Tailwind v4's theme variables, so the bundled
  skin adopts your palette with one import and no `unstyled`. For full control,
  `tailwindPreset()` returns a ready-made `classNames` map for `unstyled` mode —
  every class a literal string so Tailwind's scanner finds them, with the accent
  read from `--rfw-primary` so it stays themeable.
- **`classNames.stepComplete` and `classNames.stepInvalid`**, so a utility-class
  consumer can style a finished or failed step, not just the active one.
- **`variant`** — `"modern"` (default) or `"legacy"`. See below.
- **`colorScheme`** — `"auto"` (default, follows the page), `"system"`
  (follows the OS), `"light"` or `"dark"`.
- **Dark mode that follows the page.** By default the wizard reacts to an
  ancestor marked `[data-theme="dark"]` or `.dark` — what Tailwind,
  next-themes, Docusaurus and Fumadocs all set — or to the `darkMode` prop.
  It deliberately ignores `prefers-color-scheme`: an embedded component cannot
  assume the OS preference describes the surface behind it, and a light page on
  a dark-mode machine would otherwise render a dark wizard on white. Sites that
  drive their theme purely from the media query can opt in with
  `colorScheme="system"`.
- New tokens: `--rfw-surface`, `--rfw-muted`, `--rfw-border-strong`,
  `--rfw-text`, `--rfw-text-muted`, `--rfw-primary-contrast`, `--rfw-success`,
  `--rfw-step-size`, `--rfw-gap`, `--rfw-font`, `--rfw-transition`.
- State classes on each step: `rfw-done`, `rfw-invalid`, alongside `active`.

### Changed

- **The default look is new**: a compact step rail, hairline connectors, one
  button weight and markers that read state through colour *and* fill rather
  than size. It is deliberately quiet enough to sit inside an existing design.
- **The modern skin paints nothing inline.** v1 set colours as inline styles on
  the markers, rail and footer, which beat any CSS you wrote and made theming
  and dark mode unreliable. Styling now flows from custom properties and state
  classes, so your CSS wins without `!important`.
- **The v1 skin is a separate stylesheet**, so sites on the default no longer
  download it. The bundled stylesheet is *smaller* than 1.2.1 despite the new
  palette — 1.37 kB brotli, down from 1.85 kB.

### Migration

To keep the v1 appearance exactly:

```diff
  import "react-form-wizard-component/styles.css";
+ import "react-form-wizard-component/legacy.css";

- <FormWizard … />
+ <FormWizard variant="legacy" … />
```

Everything else is unchanged. If you never styled the wizard, upgrading needs
no code change — you get the new look and working dark mode.

## [1.2.1] - 2026-08-28

### Fixed

- **`theme.primaryColor` had no effect on tabs or buttons.** The `color` prop
  defaulted to a literal `#2196f3` applied as an inline style, and inline
  styles beat the `--rfw-primary` custom property that `theme` writes — so the
  token only ever reached the progress bar. `color` now falls back to
  `var(--rfw-primary, #2196f3)`, so `theme` recolours the whole wizard while an
  explicit `color` prop still wins. The stylesheet's `--rfw-primary` default was
  also `#337ab7` while the JS default was `#2196f3`; both are now `#2196f3`, so
  nothing shifts for existing users.
- `zodValidator` accepts schemas whose `issues` array is readonly or frozen.

## [1.2.0] - 2026-08-27

The packaging release. Every entry point the package advertised is now
verified against the published tarball on React 17, 18 and 19.

### Added

- **React 18 and 17 support.** `peerDependencies` now declares
  `^17.0.0 || ^18.0.0 || ^19.0.0`. Previously no peer range was declared at
  all, and the bundle only worked on React 19.
- **`"use client"` directive** in all three bundles, so the component can be
  imported from a Next.js App Router server component without a wrapper.
- **Headless API.** `useWizard()` exposes the full state machine — cursor,
  visited-step tracking, and shared data — with no markup and no stylesheet.
  `useWizardCursor()` and `useWizardData()` are available separately.
  `<FormWizard />` is built on the same hooks, so both APIs behave identically.
- **Validation adapters.** `zodValidator()` turns any Zod-style schema into a
  per-step validator; `hookFormValidator()` gates a step on a
  react-hook-form field subset; `composeValidators()` chains rules.
  All are structurally typed, so neither library becomes a dependency.
- **Theming via CSS custom properties.** The new `theme` prop writes
  `--rfw-*` custom properties onto the wizard root; the stylesheet reads them
  with fallbacks, so overriding one token no longer means restating a palette.
- **Unstyled mode.** `unstyled` drops the bundled classes and inline colours,
  and `classNames` overrides any element's class — for Tailwind, CSS modules,
  or your own design system.
- **Persistence.** `persist={{ key, storage }}` keeps wizard data across
  reloads in session or local storage, restored on mount.
- **URL sync.** `syncToUrl` mirrors the active step into a query parameter so a
  refresh or a shared link reopens the same step.
- **Accessibility.** An `aria-live="polite"` region announces each step change,
  focus moves to the freshly revealed panel (not on first paint), and tabs are
  operable with Enter and Space.
- **Imperative API additions.** `updateData()` merges a patch into wizard data;
  `getCurrentStep()` reads the cursor.
- New props: `announceStepChanges`, `keyboardNavigation`, `swipeNavigation`,
  `ariaLabel`, `style`.
- The playground (`src/App.tsx`) gained seven samples covering every new
  feature: theming, unstyled mode, the headless hook, validation adapters,
  persistence with URL sync, accessibility with two wizards on one page, and
  branching questions driven by the split hooks.
- CI on GitHub Actions: lint, strict typecheck, tests, build, `publint`,
  `attw`, a size budget, and a real install-the-tarball smoke test across the
  React version matrix.
- Dependabot configuration with grouped weekly updates, and a CI step
  asserting the runtime dependency tree stays free of advisories.

### Fixed

- **TypeScript declarations were missing entirely.** `types` pointed at
  `dist/types/main.d.ts`, which was never generated — every TypeScript
  consumer got `error TS7016: Could not find a declaration file`. The library
  now builds from a real `src/main.ts` barrel, and that file is the declared
  types entry.
- **Documented types were not exported.** `FormWizardSchema`, `WizardData` and
  friends were shown in the README but never re-exported from the entry point.
  All public types are now exported from one barrel.
- **`require()` returned an empty object.** The `require` condition resolved to
  a UMD file that, under `"type": "module"`, exposed nothing. There is now a
  real `.cjs` build with `output.exports: "named"`.
- **The package depended on itself.** `dependencies` listed
  `react-form-wizard-component@^1.0.1`, producing a self-referencing install
  tree. The package now has zero runtime dependencies.
- **React's JSX runtime was compiled into the bundle.** `rollupOptions.external`
  omitted `react/jsx-runtime`, so React 19's *development* JSX runtime was
  inlined — the actual cause of the React 18 incompatibility, and of dev-mode
  React code shipping to production. All React entry points are now external.
- **CJS type resolution.** A separate `dist/types-cjs` tree of `.d.cts` files
  backs the `require` condition, so the package no longer reports as
  "masquerading as ESM". `attw` now passes on node10, node16 (CJS and ESM)
  and bundler.
- Multiple wizards on one page no longer both respond to the same arrow key —
  only the wizard containing focus reacts.
- Screen-reader-only text stays hidden in `unstyled` mode.
- `zodValidator` accepts schemas whose `issues` array is readonly or frozen;
  the adapter type previously demanded a mutable array.
- An out-of-range `startIndex` is clamped on the first render instead of
  briefly rendering an empty panel.
- `onTabChange` no longer fires a spurious transition on mount.
- Dev files (`App.d.ts`, `setupTests.d.ts`) and `vite.svg` are no longer
  published. `files` no longer references a non-existent `CHANGELOG.md`.
- Four README links pointed at a repository that returns 404.

### Changed

- `tsconfig` runs with `strict: true` (the README had claimed this while it was
  set to `false`), plus `noUnusedLocals`, `noUnusedParameters` and
  `noImplicitOverride`.
- `main` now points at the CJS build; `unpkg`/`jsdelivr` point at UMD.
- The stylesheet is exported as `react-form-wizard-component/styles.css`.
  The previous `dist/style.css` path still works.
- Relative imports in source carry explicit `.js` extensions so the emitted
  declarations resolve identically under every module resolution mode.
- Test suite grew from 28 to 70 tests; coverage thresholds raised from 50% to
  80% lines / 85% functions.
- Dev-dependency tree refreshed to clear all outstanding npm advisories
  (13 on this branch, 32 on the previous default branch). Every one was
  transitive dev tooling; none could reach consumers, because the package has
  no runtime dependencies.

### Notes

- React 17 works through any bundler (Vite, webpack, Next.js, CRA). It cannot
  be loaded under **native Node ESM**, because React 17 ships no `exports`
  field and Node therefore cannot resolve `react/jsx-runtime` — a React 17
  limitation, reproducible without this package.
- No breaking changes. The children API, the schema API, and every existing
  prop behave as before.

## [1.1.1] - 2026-03-10

### Fixed

- Stylesheet import path for the `dist/style.css` entry.

## [1.1.0] - 2026-03-10

### Changed

- Documentation and sample updates for the schema-first API.

## [1.0.1] - 2026-03-10

### Fixed

- CSS import resolution.

## [1.0.0] - 2026-03-10

### Added

- Schema-first API: declarative `steps` with `condition` and `validate`.
- Imperative API via refs, including `goToTabById` and `setData`/`getData`.
- Initial ARIA roles, keyboard navigation, and touch/swipe support.
- `React.memo` optimisations across components.
- Jest test suite (28 tests).

### Changed

- `onComplete` now receives an optional `WizardData` payload.
- `onTabChange` now includes an optional `stepId`.
- Targeted React 19.

## [0.2.8] - 2025-03-06

### Added

- React 19 compatibility.

## [0.2.7] - 2024-07-30

### Added

- `darkButtonColor` option.
- Error tab colour option (`showErrorOnTab`, `showErrorOnTabColor`).
- Custom progress bar.
- `removeBackgroundTab` option.
- Dark mode with `customDarkModeColor`.
- `showProgressBar` and `inlineStep` options.
- `disableBackOnClickStep` option.

### Fixed

- `removeBackgroundTab` naming and grammar.
- Spelling corrections.

## [0.2.0] - 2024-06-10

### Fixed

- TypeScript error on import.

## [0.1.7] - 2023-07-27

### Added

- Custom icon option.
- Step index shown when no icon is set.

### Changed

- `title` and `icon` are now optional.

### Fixed

- Custom-icon and missing-icon error.

## [0.1.6] - 2023-07-18

### Added

- `nextButtonTemplate` option.
- `backButtonTemplate` option.
- `finishButtonTemplate` option.

## [0.1.4] - 2023-07-11

### Added

- Tab validation (`isValid`, `validationError`).

## [0.1.0] - 2023-06-30

### Added

- Imperative methods: `nextTab`, `prevTab`, `reset`, `activeAll`, `goToTab`.
- Types folder and published type reference.

## [0.0.1] - 2023-06-26

### Added

- Initial release.

[unreleased]: https://github.com/parsajiravand/react-form-wizard/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/parsajiravand/react-form-wizard/compare/v1.2.1...v2.0.0
[1.2.1]: https://github.com/parsajiravand/react-form-wizard/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/parsajiravand/react-form-wizard/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/parsajiravand/react-form-wizard/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/parsajiravand/react-form-wizard/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/parsajiravand/react-form-wizard/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/parsajiravand/react-form-wizard/compare/v0.2.8...v1.0.0
[0.2.8]: https://github.com/parsajiravand/react-form-wizard/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/parsajiravand/react-form-wizard/compare/v0.2.0...v0.2.7
[0.2.0]: https://github.com/parsajiravand/react-form-wizard/compare/v0.1.7...v0.2.0
[0.1.7]: https://github.com/parsajiravand/react-form-wizard/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/parsajiravand/react-form-wizard/compare/v0.1.4...v0.1.6
[0.1.4]: https://github.com/parsajiravand/react-form-wizard/compare/v0.1.0...v0.1.4
[0.1.0]: https://github.com/parsajiravand/react-form-wizard/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/parsajiravand/react-form-wizard/releases/tag/v0.0.1
