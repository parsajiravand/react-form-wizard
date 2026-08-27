<h1 align="center">React Form Wizard</h1>

<p align="center">
  Accessible multi-step form wizard for React — styled or headless, zero dependencies.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-form-wizard-component"><img src="https://img.shields.io/npm/v/react-form-wizard-component.svg?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/react-form-wizard-component"><img src="https://img.shields.io/npm/dm/react-form-wizard-component.svg?style=flat-square" alt="downloads per month"></a>
  <a href="https://bundlephobia.com/package/react-form-wizard-component"><img src="https://img.shields.io/bundlephobia/minzip/react-form-wizard-component?style=flat-square&label=gzipped" alt="bundle size"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square" alt="zero dependencies">
  <img src="https://img.shields.io/badge/react-17%20%7C%2018%20%7C%2019-blue.svg?style=flat-square" alt="React 17, 18, 19">
  <a href="https://github.com/parsajiravand/react-form-wizard/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/react-form-wizard-component.svg?style=flat-square" alt="MIT license"></a>
</p>

<p align="center">
  <a href="https://react-form-wizard-component-document.netlify.app">Documentation</a> ·
  <a href="https://react-form-wizard-component-document.netlify.app/docs/category/demos">Live demos</a> ·
  <a href="https://react-form-wizard-component-document.netlify.app/docs/Playground/">Playground</a>
</p>

<!--
  TODO(maintainer): drop a screen recording of the wizard here — it is the
  single highest-converting element an npm README can have.
  Suggested: docs/wizard.gif, ~800px wide, 6-8 seconds, three steps + validation.
-->

---

## Install

```bash
npm install react-form-wizard-component
```

Works with **React 17, 18 and 19**. No runtime dependencies.

## Quick start

```tsx
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/styles.css";

export default function Signup() {
  return (
    <FormWizard onComplete={() => console.log("done")}>
      <FormWizard.TabContent title="Account">
        <input placeholder="Email" />
      </FormWizard.TabContent>
      <FormWizard.TabContent title="Profile">
        <input placeholder="Full name" />
      </FormWizard.TabContent>
      <FormWizard.TabContent title="Review">
        <p>Looks good?</p>
      </FormWizard.TabContent>
    </FormWizard>
  );
}
```

That's a working three-step wizard with a progress bar, keyboard navigation,
swipe support, and screen-reader announcements.

## Why this one

|  | |
|---|---|
| **Zero dependencies** | Nothing enters your lockfile but this package. |
| **Styled *or* headless** | Ship the bundled look, restyle it with CSS variables, go fully unstyled, or drop the markup entirely and use `useWizard()`. |
| **Real per-step validation** | First-class adapters for Zod and react-hook-form — validate one step's fields without splitting your form. |
| **Accessible by default** | `tablist`/`tab`/`tabpanel` roles, live-region step announcements, focus management, full keyboard operation. |
| **Works everywhere** | ESM + CJS + UMD, correct types in every resolution mode, `"use client"` for the Next.js App Router, SSR-safe. |
| **React 17 → 19** | One package across three majors. |

## Table of contents

- [Two ways to define steps](#two-ways-to-define-steps)
- [Validation](#validation)
  - [Zod](#zod)
  - [react-hook-form](#react-hook-form)
- [Next.js App Router](#nextjs-app-router)
- [Headless: `useWizard()`](#headless-usewizard)
- [Styling](#styling)
- [Persistence and URL sync](#persistence-and-url-sync)
- [Controlling the wizard from outside](#controlling-the-wizard-from-outside)
- [API reference](#api-reference)
- [Accessibility](#accessibility)
- [Compatibility](#compatibility)
- [Migrating](#migrating)

## Two ways to define steps

**Children** — the simplest thing that works:

```tsx
<FormWizard title="Signup">
  <FormWizard.TabContent title="Account" icon="ti-user">…</FormWizard.TabContent>
  <FormWizard.TabContent title="Review" icon="ti-check">…</FormWizard.TabContent>
</FormWizard>
```

**Schema** — for conditional steps and data-driven flows:

```tsx
import FormWizard, { type FormWizardSchema } from "react-form-wizard-component";

const schema: FormWizardSchema = {
  initialData: { plan: "basic" },
  steps: [
    { id: "plan", title: "Plan", content: <PlanPicker /> },
    {
      id: "billing",
      title: "Billing",
      // Step only appears when the condition holds.
      condition: ({ data }) => data.plan === "premium",
      content: <BillingFields />,
    },
    {
      id: "review",
      title: "Review",
      // Returning a string blocks navigation and supplies the message.
      validate: ({ data }) => (data.accepted ? true : "Please accept the terms"),
      content: ({ data }) => <Review data={data} />,
    },
  ],
};

<FormWizard schema={schema} onComplete={(data) => submit(data)} />;
```

`content` may be a node or a function of the current data. When both `schema`
and children are given, `schema` wins.

## Validation

A step validator returns `true` to allow navigation, or a **string** to block it
and provide the message. That's the whole contract — the adapters below just
produce one for you.

### Zod

```tsx
import { z } from "zod";
import FormWizard, { zodValidator } from "react-form-wizard-component";

const account = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

const schema = {
  steps: [
    {
      id: "account",
      title: "Account",
      content: <AccountFields />,
      // `pick` validates only this step's slice of the wizard data.
      validate: zodValidator(account, { pick: ["email", "password"] }),
    },
  ],
};
```

`zod` never becomes a dependency of this package — the adapter is typed
structurally, so any schema exposing `safeParse` works (Zod, Valibot, ArkType).

### react-hook-form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWizard, { hookFormValidator } from "react-form-wizard-component";

function Checkout() {
  const form = useForm({ resolver: zodResolver(schema), mode: "onChange" });

  return (
    <FormWizard
      schema={{
        steps: [
          {
            id: "contact",
            title: "Contact",
            content: <ContactFields form={form} />,
            // The step blocks only on its own fields.
            validate: hookFormValidator(form, { fields: ["email", "phone"] }),
          },
          {
            id: "address",
            title: "Address",
            content: <AddressFields form={form} />,
            validate: hookFormValidator(form, { fields: ["street", "city"] }),
          },
        ],
      }}
      onComplete={() => void form.handleSubmit(submit)()}
    />
  );
}
```

Combine rules with `composeValidators` — first failure wins:

```tsx
import { composeValidators, zodValidator } from "react-form-wizard-component";

validate: composeValidators(
  zodValidator(account),
  ({ data }) => data.terms === true || "You must accept the terms"
);
```

## Next.js App Router

The bundles ship a `"use client"` directive, so importing the component from a
server component works without a wrapper:

```tsx
// app/signup/page.tsx  — a server component
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/styles.css";

export default function Page() {
  return (
    <FormWizard title="Signup">
      <FormWizard.TabContent title="Account">…</FormWizard.TabContent>
      <FormWizard.TabContent title="Review">…</FormWizard.TabContent>
    </FormWizard>
  );
}
```

Import the stylesheet once, anywhere in the tree (commonly `app/layout.tsx`).

## Headless: `useWizard()`

Same state machine, none of the markup. `<FormWizard />` is built on this hook,
so behaviour is identical.

```tsx
import { useWizard } from "react-form-wizard-component";

const STEPS = ["account", "profile", "review"];

function MyWizard() {
  const wizard = useWizard({ stepIds: STEPS, persist: { key: "signup" } });

  return (
    <div>
      <p>
        Step {wizard.currentStep + 1} of {wizard.totalSteps}
      </p>

      {wizard.stepId === "account" && (
        <input
          value={String(wizard.data.email ?? "")}
          onChange={(e) => wizard.updateData({ email: e.target.value })}
        />
      )}

      <button onClick={wizard.previous} disabled={wizard.isFirstStep}>
        Back
      </button>
      <button onClick={wizard.next} disabled={wizard.isLastStep}>
        Next
      </button>
    </div>
  );
}
```

`useWizardCursor()` and `useWizardData()` are exported separately if you only
need one half.

## Styling

**Theme tokens** — override one value without restating a palette:

```tsx
<FormWizard
  theme={{
    primaryColor: "#0e6f70",
    backgroundColor: "#ffffff",
    errorColor: "#c0392b",
    borderRadius: "8px",
  }}
/>
```

These become `--rfw-*` CSS custom properties on the wizard root. Set them in
your own stylesheet instead if you prefer:

```css
.react-form-wizard {
  --rfw-primary: #0e6f70;
  --rfw-radius: 8px;
}
```

**Unstyled** — drop the bundled look entirely and bring your own classes:

```tsx
<FormWizard
  unstyled
  classNames={{
    root: "flex flex-col gap-6",
    stepList: "flex gap-2",
    step: "px-3 py-1 rounded text-slate-500",
    stepActive: "bg-teal-600 text-white",
    content: "rounded border p-4",
    nextButton: "rounded bg-teal-600 px-4 py-2 text-white",
  }}
/>
```

In `unstyled` mode you can skip the stylesheet import — accessibility helpers
stay hidden without it.

## Tailwind CSS

Two ways in, depending on how much control you want.

### 1. Keep the bundled skin, adopt your theme

One import. The wizard's tokens map onto Tailwind's own theme variables, so it
picks up your palette, radius and font:

```css
@import "tailwindcss";
@import "react-form-wizard-component/styles.css";
@import "react-form-wizard-component/tailwind.css";
```

```tsx
<FormWizard schema={schema} />
```

Dark mode follows whichever strategy you already use — a `.dark` class or
`[data-theme="dark"]`. Nothing else to configure.

> Tailwind **v4** only, since it reads the `--color-*` / `--radius-*` variables
> v4 exposes. On v3, set the `--rfw-*` tokens yourself:
> ```css
> .react-form-wizard { --rfw-primary: theme('colors.blue.600'); }
> ```

### 2. Build it from utility classes

Go `unstyled` and let your classes do everything:

```tsx
import FormWizard, { tailwindPreset } from "react-form-wizard-component";

<FormWizard unstyled classNames={tailwindPreset()} schema={schema} />;
```

Tailwind only generates classes it can see in your source, and these live in
`node_modules` — so point it at the package:

```css
/* v4 */
@source "../node_modules/react-form-wizard-component/dist/**/*.js";
```

```js
// v3 — tailwind.config.js
content: ["./src/**/*.{ts,tsx}", "./node_modules/react-form-wizard-component/dist/**/*.js"]
```

Customise without starting over:

```tsx
tailwindPreset({
  dark: false,                                   // drop dark: variants
  extend: { content: "p-10", nextButton: "rounded-full" },
})
```

The preset takes its accent from `--rfw-primary` via `bg-[var(--rfw-primary)]`,
so recolouring stays a one-line CSS change rather than a rebuild:

```css
.react-form-wizard { --rfw-primary: var(--color-violet-600); }
```

Prefer to own it outright? `tailwindPreset()` returns a plain object — copy it
into your project and skip the `@source` line entirely.

## Persistence and URL sync

```tsx
<FormWizard
  // Survive a reload. "session" (default) clears with the tab; "local" persists.
  persist={{ key: "checkout", storage: "session" }}
  // Mirror the step into ?step=2 so refreshes and shared links land correctly.
  syncToUrl
/>
```

Both are best-effort: private-browsing and quota errors never break the form.
Clear stored data with `ref.current.reset()` or `wizard.clearPersisted()`.

## Controlling the wizard from outside

```tsx
import { useRef } from "react";
import FormWizard, { type FormWizardMethods } from "react-form-wizard-component";

function Controlled() {
  const wizard = useRef<FormWizardMethods>(null);

  return (
    <>
      <button onClick={() => wizard.current?.goToTabById("review")}>
        Skip to review
      </button>
      <FormWizard ref={wizard} schema={schema} />
    </>
  );
}
```

## API reference

### `<FormWizard />` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string \| ReactNode` | — | Heading. A node replaces the whole header. |
| `subtitle` | `string` | `""` | Text under the title. |
| `schema` | `FormWizardSchema` | — | Declarative steps. Takes precedence over children. |
| `children` | `ReactNode` | — | `<FormWizard.TabContent>` steps. |
| `data` | `WizardData` | — | Controlled wizard data. |
| `onDataChange` | `(data) => void` | — | Fires when wizard data changes. |
| `onComplete` | `(data?) => void` | — | Fires when the finish button is pressed and the last step is valid. |
| `onTabChange` | `({ prevIndex, nextIndex, stepId }) => void` | — | Fires on step change (not on mount). |
| `color` | `string` | `#2196f3` | Accent colour. |
| `theme` | `WizardTheme` | — | Theme tokens emitted as CSS custom properties. |
| `unstyled` | `boolean` | `false` | Drop bundled classes and inline colours. |
| `classNames` | `WizardClassNames` | — | Per-element class overrides. |
| `shape` | `"circle" \| "square" \| "tab"` | `""` | Step marker shape. |
| `stepSize` | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Step marker size. |
| `layout` | `"horizontal" \| "vertical"` | `"horizontal"` | Navigation orientation. |
| `startIndex` | `number` | `0` | Initial step (clamped to range). |
| `showProgressBar` | `boolean` | `true` | Show the progress indicator. |
| `inlineStep` | `boolean` | `false` | Compact inline step markers. |
| `disableBackOnClickStep` | `boolean` | `false` | Disable navigating by clicking markers. |
| `persist` | `WizardPersistOptions` | — | Persist data across reloads. |
| `syncToUrl` | `boolean \| { param }` | `false` | Mirror the step into the URL. |
| `announceStepChanges` | `boolean` | `true` | Live-region announcements and focus management. |
| `keyboardNavigation` | `boolean` | `true` | Arrow / Home / End navigation. |
| `swipeNavigation` | `boolean` | `true` | Horizontal swipe on touch devices. |
| `ariaLabel` | `string` | `"Form Wizard"` | Accessible name for the region. |
| `nextButtonText` / `backButtonText` / `finishButtonText` | `string` | `Next` / `Back` / `Finish` | Button labels. |
| `nextButtonTemplate` / `backButtonTemplate` / `finishButtonTemplate` | `(onClick) => ReactNode` | — | Replace a button entirely. |
| `darkMode` | `boolean` | `false` | Enable dark palette. |
| `customDarkModeColor` | `object` | `{}` | Per-element dark colours. Prefer `theme`. |
| `removeBackgroundTab` | `boolean` | `false` | Transparent step markers. |
| `style` | `CSSProperties` | — | Inline styles for the root. |

### Step options (schema)

| Option | Type | Description |
|---|---|---|
| `id` | `string` | Stable id, used by `goToTabById` and `stepId`. |
| `title` | `string` | Step label. |
| `icon` | `string \| ReactNode` | Icon class name or node. |
| `content` | `ReactNode \| (ctx) => ReactNode` | Step body. |
| `condition` | `(ctx) => boolean` | Hide the step when it returns `false`. |
| `validate` | `(ctx) => true \| string \| false` | Block navigation; a string is the message. |
| `showErrorOnTab` | `boolean` | Mark the step marker on failure. |
| `showErrorOnTabColor` | `string` | Error colour for the marker. |

### Ref methods (`FormWizardMethods`)

| Method | Description |
|---|---|
| `nextTab()` / `prevTab()` | Move one step, honouring validation. |
| `goToTab(index)` | Jump to an index, bypassing the visited-step gate. |
| `goToTabById(id)` | Jump to a step by id. |
| `reset()` | Return to `startIndex` and clear persisted data. |
| `activeAll()` | Mark every step visited, unlocking free navigation. |
| `getData()` / `setData(data)` | Read or replace wizard data. |
| `updateData(patch)` | Merge a patch into wizard data. |
| `getCurrentStep()` | Current zero-based index. |

### `useWizard(options)`

**Options:** `stepIds`, `startIndex`, `initialData`, `data`, `onDataChange`,
`onStepChange`, `persist`, `syncToUrl`.

**Returns:** `currentStep`, `maxVisitedStep`, `totalSteps`, `stepId`,
`isFirstStep`, `isLastStep`, `data`, `next()`, `previous()`, `goTo(i)`,
`goToId(id)`, `reset()`, `activateAll()`, `setData()`, `updateData()`,
`clearPersisted()`.

## Accessibility

- `role="region"` with a configurable label; `tablist` / `tab` / `tabpanel`
  with `aria-selected`, `aria-controls` and `aria-disabled`.
- Step changes announced through an `aria-live="polite"` region.
- Focus moves to the revealed panel on step change (never on first paint).
- Tabs activate with Enter and Space; roving `tabIndex` on the tab list.
- Wizard-level keys: `←` / `→` to move, `Home` / `End` to jump. Several wizards
  can coexist — only the one containing focus responds.
- `prefers-reduced-motion` is respected by the stylesheet.

Keyboard navigation, ARIA wiring and focus management are implemented and
tested. A full WCAG 2.1 AA audit has not yet been published.

## Compatibility

| React | Supported | Notes |
|---|---|---|
| 19.x | ✅ | |
| 18.x | ✅ | |
| 17.x | ✅ | Through any bundler (Vite, webpack, Next.js, CRA). Not loadable under **native Node ESM** — React 17 ships no `exports` field, so Node cannot resolve `react/jsx-runtime`. A React 17 limitation, not this package's. |
| 16.x | ⚠️ | Untested. Requires `react/jsx-runtime` (React 16.14+). |

| Environment | Supported |
|---|---|
| ESM `import` | ✅ |
| CJS `require()` | ✅ |
| TypeScript (`bundler`, `node16`, `node10`) | ✅ verified with [`attw`](https://github.com/arethetypeswrong/arethetypeswrong.github.io) |
| Next.js App Router / RSC | ✅ `"use client"` included |
| Server-side rendering | ✅ |
| UMD via CDN | ✅ `unpkg` / `jsdelivr` |

## Migrating

### From 1.1.x → 1.2.0

No breaking changes. Optional cleanups:

```diff
- import "react-form-wizard-component/dist/style.css";
+ import "react-form-wizard-component/styles.css";
```

If you pinned `0.2.7` to stay on React 18, you can now upgrade — React 18 is
supported again, and the schema API, dark mode and accessibility work come
with it.

### From 0.2.x → 1.2.0

- `onComplete` now receives an optional `WizardData` argument.
- `onTabChange` now includes an optional `stepId`, and no longer fires on mount.
- The children API is unchanged.

## Contributing

```bash
npm install
npm run dev       # playground at localhost:5173
npm test
npm run verify    # lint, typecheck, tests, build, publint, attw
```

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and PRs welcome.

## License

[MIT](./LICENSE) © Parsa Jiravand
