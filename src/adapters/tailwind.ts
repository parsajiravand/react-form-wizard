import type { WizardClassNames } from "../types/FormWizard.js";

/**
 * Ready-made Tailwind classes for `unstyled` mode.
 *
 * Use this when you want the wizard to be built entirely from your utility
 * classes rather than the bundled stylesheet:
 *
 * ```tsx
 * import FormWizard, { tailwindPreset } from "react-form-wizard-component";
 *
 * <FormWizard unstyled classNames={tailwindPreset()} schema={schema} />
 * ```
 *
 * Two deliberate constraints shape what follows.
 *
 * **Every class is a literal string.** Tailwind finds classes by scanning
 * source text, so a generated name like `` `bg-${colour}-600` `` would never be
 * emitted. Nothing here is concatenated.
 *
 * **The accent comes from a CSS variable**, `--rfw-primary`, through arbitrary
 * values such as `bg-[var(--rfw-primary)]`. That syntax works on Tailwind v3
 * and v4 alike, keeps the accent themeable at runtime, and avoids baking a
 * palette choice into the preset.
 *
 * Because these classes live in `node_modules`, Tailwind will not see them
 * unless you point it at the package:
 *
 * - v4: `@source ".../react-form-wizard-component/dist/**\/*.js";`
 * - v3: add `"./node_modules/react-form-wizard-component/dist/**\/*.js"` to
 *   `content`.
 *
 * Prefer not to configure that? Copy the object from
 * {@link tailwindPreset} into your own file — it is plain data.
 */
export interface TailwindPresetOptions {
  /**
   * Include `dark:` variants. Leave on unless your app has no dark mode; the
   * variants cost nothing when unused. Defaults to `true`.
   */
  dark?: boolean;
  /**
   * Merge extra classes onto any slot. Values are appended, so a preset class
   * and yours can coexist — Tailwind's later-wins ordering applies.
   */
  extend?: WizardClassNames;
}

const join = (...parts: Array<string | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Slots that gain `dark:` variants when `dark` is enabled. */
const DARK: WizardClassNames = {
  title: "dark:text-slate-100",
  subtitle: "dark:text-slate-400",
  step: "dark:text-slate-400",
  stepIcon: "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
  stepActive: "dark:text-slate-100",
  stepTitle: "dark:text-inherit",
  content: "dark:border-slate-800 dark:bg-slate-900",
  backButton: "dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
};

const BASE: WizardClassNames = {
  root: "flex flex-col gap-6 text-slate-900",
  header: "text-center",
  title: "text-lg font-semibold tracking-tight text-slate-900",
  subtitle: "mt-1 text-sm text-slate-500",
  navigation: "flex flex-col gap-6",
  stepList: "flex list-none items-start gap-2 p-0",
  step: "flex flex-1 min-w-0 cursor-pointer flex-col items-center gap-2 text-slate-500 no-underline aria-disabled:cursor-not-allowed",
  stepIcon:
    "grid size-9 place-items-center rounded-full border-2 border-slate-300 bg-white text-[0.8125rem] font-semibold transition-colors",
  stepActive: "text-slate-900 [&_>div]:border-[var(--rfw-primary)] [&_>div]:text-[var(--rfw-primary)]",
  stepComplete:
    "[&_>div]:border-[var(--rfw-primary)] [&_>div]:bg-[var(--rfw-primary)] [&_>div]:text-white",
  stepInvalid: "text-red-600 [&_>div]:border-red-600 [&_>div]:text-red-600",
  stepTitle: "text-center text-[0.8125rem] font-medium leading-tight",
  content: "rounded-xl border border-slate-200 bg-white p-6",
  footer: "flex items-center gap-3",
  backButton:
    "mr-auto rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100",
  nextButton:
    "ml-auto rounded-lg bg-[var(--rfw-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90",
  finishButton:
    "ml-auto rounded-lg bg-[var(--rfw-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90",
};

const KEYS = Object.keys(BASE) as Array<keyof WizardClassNames>;

/**
 * Build the class map. Call it once outside render, or memoise it — it returns
 * a new object each time.
 *
 * @example
 * // default
 * <FormWizard unstyled classNames={tailwindPreset()} />
 *
 * @example
 * // wider panel, no dark variants
 * <FormWizard
 *   unstyled
 *   classNames={tailwindPreset({
 *     dark: false,
 *     extend: { content: "p-10", nextButton: "rounded-full" },
 *   })}
 * />
 */
export function tailwindPreset(
  options: TailwindPresetOptions = {}
): WizardClassNames {
  const { dark = true, extend } = options;

  const out: WizardClassNames = {};
  for (const key of KEYS) {
    out[key] = join(BASE[key], dark ? DARK[key] : undefined, extend?.[key]);
  }

  // Slots the preset does not style, but the caller might.
  if (extend) {
    for (const key of Object.keys(extend) as Array<keyof WizardClassNames>) {
      if (!out[key]) out[key] = extend[key];
    }
  }

  return out;
}

export default tailwindPreset;
