# Contributing

Thanks for helping out. This guide is short on purpose.

## Getting started

```bash
git clone https://github.com/parsajiravand/react-form-wizard.git
cd react-form-wizard
npm install
npm run dev      # playground at http://localhost:5173
```

`src/App.tsx` is the local playground. It imports the library from source
(`./main`), so anything you change shows up immediately.

## Before you open a PR

```bash
npm run verify
```

That runs, in order: lint → strict typecheck → tests → build → `publint` →
`attw`. All of it runs in CI too, so it is faster to catch problems locally.

To check the package the way a consumer sees it:

```bash
npm run build
npm pack --pack-destination .
bash scripts/verify-consumer.sh 18 ./react-form-wizard-component-*.tgz
```

That installs the tarball into a throwaway project and typechecks, imports,
requires and server-renders it. Run it for `17`, `18` and `19`.

## Project layout

```
src/
  main.ts               Public barrel — everything importable lives here
  components/
    FormWizard.tsx      The styled component, built on the hooks below
    WizardTab.tsx       One step marker in the tab list
    WizardButton.tsx    Back / Next / Finish button
  hooks/
    useWizard.ts        Headless state: useWizardData + useWizardCursor
  adapters/
    validators.ts       Zod / react-hook-form adapters (structurally typed)
  types/                Public type definitions
  index.css             Stylesheet, themed with --rfw-* custom properties
scripts/
  build-types.mjs       Post-processes declarations, emits the CJS type tree
  verify-consumer.sh    Installs the tarball and exercises it as a consumer
```

## House rules

**Zero runtime dependencies.** This is a headline feature of the package. CI
fails if `dependencies` is non-empty. Integrations with other libraries (Zod,
react-hook-form) are typed *structurally* — see `src/adapters/validators.ts`
for the pattern.

**Every public export goes through `src/main.ts`.** The `types` entry points at
this file. If it is not exported there, it does not exist for consumers — that
is exactly how the 1.1.x releases ended up documenting types they never shipped.

**Keep React entry points external.** `vite.config.ts` lists `react`,
`react-dom`, `react/jsx-runtime` and friends in `rollupOptions.external`.
Dropping any of them inlines React into the bundle and breaks other React
majors. CI greps the built output for React internals.

**Both APIs share one implementation.** `<FormWizard />` is built on
`useWizardData` + `useWizardCursor`. Behaviour changes belong in the hooks so
the styled and headless APIs cannot diverge.

**Relative imports carry `.js` extensions.** This is what makes the emitted
declarations resolve identically under `bundler`, `node16` and `node10`.
`tsc` preserves the specifier as written; Jest strips it via `moduleNameMapper`.

**Accessibility is not optional.** New interactive markup needs the right role,
an accessible name, and keyboard operation. `src/components/__tests__/
FormWizardFeatures.test.tsx` has the existing patterns.

## Tests

```bash
npm test                # once
npm run test:watch      # watch mode
npm run test:coverage   # with thresholds (80% lines, 85% functions)
```

Test behaviour through the public API rather than internals — query by role and
text, the way `@testing-library` intends.

## Commits and releases

Commit messages are free-form; keep the subject under ~72 characters and say
what changed.

Releases are cut by pushing a tag:

```bash
npm version minor      # updates package.json and creates the tag
git push --follow-tags
```

The release workflow re-runs `verify`, packs the tarball, verifies it as a
consumer on React 17, 18 and 19, then publishes with npm provenance.

## Reporting bugs

Use the issue templates. A runnable reproduction (StackBlitz or CodeSandbox)
turns a multi-day guessing game into a same-day fix.
