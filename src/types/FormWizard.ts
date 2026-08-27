import { CSSProperties, ReactNode, Ref } from "react";

export type WizardData = Record<string, unknown>;

/** Context handed to a step's `condition` and `content` function. */
export interface WizardConditionContext {
  /** Current shared wizard data. */
  data: WizardData;
  currentStep: number;
  /** Index of the step being evaluated. */
  stepIndex: number;
}

/** Context handed to a step's `validate` function. */
export interface WizardValidationContext {
  /** Current shared wizard data. */
  data: WizardData;
  currentStep: number;
  /** Index of the step being validated. */
  stepIndex: number;
}

export type WizardCondition = (context: WizardConditionContext) => boolean;
export type WizardValidationResult = boolean | string;
export type WizardValidation = (
  context: WizardValidationContext
) => WizardValidationResult;

/** Props for `<FormWizard.TabContent>` — one step in the children API. */
export interface TabContentProps {
  /** Stable id. Used by `goToTabById` and reported as `stepId`. */
  id?: string;
  /** Step label shown in the navigation. */
  title?: string;
  /** Icon class name (e.g. `"ti-user"`) or a React node. */
  icon?: string | ReactNode;
  /** Unused; retained for backwards compatibility. */
  route?: string;
  /** Step body. */
  children: ReactNode;
  /** Static validity gate. Prefer `validate` for anything data-dependent. */
  isValid?: boolean;
  /** Mark the step marker when the step is invalid. */
  showErrorOnTab?: boolean;
  /** Colour used to mark an invalid step marker. */
  showErrorOnTabColor?: string;
  /** Called when navigation is blocked; may render a message. */
  validationError?: () => void | ReactNode;
  /** Hide the step entirely when this returns `false`. */
  condition?: WizardCondition;
  /** Return `true` to allow navigation, or a string to block it with a message. */
  validate?: WizardValidation;
}

/** One step in the schema API. */
export interface WizardStepSchema {
  /** Stable id. Used by `goToTabById` and reported as `stepId`. */
  id?: string;
  /** Step label shown in the navigation. */
  title?: string;
  /** Icon class name (e.g. `"ti-user"`) or a React node. */
  icon?: string | ReactNode;
  /** Step body, or a function of the current wizard data. */
  content: ReactNode | ((context: WizardConditionContext) => ReactNode);
  /** Hide the step entirely when this returns `false`. */
  condition?: WizardCondition;
  /**
   * Return `true` to allow navigation, or a string to block it and supply the
   * message. Runs on every render, so keep it pure — never async, never
   * state-setting.
   */
  validate?: WizardValidation;
  /** Mark the step marker when the step is invalid. */
  showErrorOnTab?: boolean;
  /** Colour used to mark an invalid step marker. */
  showErrorOnTabColor?: string;
}

/** Declarative wizard definition, passed to the `schema` prop. */
export interface FormWizardSchema {
  /** Ordered steps. Hidden steps (via `condition`) are skipped. */
  steps: WizardStepSchema[];
  /** Seed for the shared wizard data. */
  initialData?: WizardData;
}

/** Payload passed to `onTabChange` / `onStepChange`. */
export interface WizardStepChangeEvent {
  /** Index the wizard moved away from. */
  prevIndex: number;
  /** Index the wizard moved to. */
  nextIndex: number;
  /** `id` of the step now active, when the step declares one. */
  stepId?: string;
}

/** Persist wizard data across reloads. Best-effort: failures are swallowed. */
export interface WizardPersistOptions {
  /** Storage key. Namespace it per form. */
  key: string;
  /** Defaults to `"session"`, which clears when the tab closes. */
  storage?: "session" | "local";
}

/** Mirror the active step into the URL so a refresh or deep link restores it. */
export interface WizardUrlSyncOptions {
  /** Query parameter name. Defaults to `"step"`. 1-based in the URL. */
  param?: string;
}

/**
 * Theme tokens, applied as CSS custom properties on the wizard root. Anything
 * omitted falls back to the stylesheet default, so you can override one value
 * without restating the palette.
 */
export interface WizardTheme {
  /** Accent for active tabs, progress and buttons. */
  primaryColor?: string;
  /** Wizard surface background. */
  backgroundColor?: string;
  /** Default text colour. */
  textColor?: string;
  /** Title colour. */
  titleColor?: string;
  /** Subtitle / category colour. */
  subtitleColor?: string;
  /** Inactive tab circle colour. */
  tabColor?: string;
  /** Icon colour inside tab circles. */
  tabIconColor?: string;
  /** Border colour for the navigation rail. */
  borderColor?: string;
  /** Next / Back button background. */
  buttonColor?: string;
  /** Next / Back button label colour. */
  buttonTextColor?: string;
  /** Finish button background. */
  finishButtonColor?: string;
  /** Finish button label colour. */
  finishButtonTextColor?: string;
  /** Colour used when a step reports a validation error. */
  errorColor?: string;
  /** Corner radius for buttons and tab squares. */
  borderRadius?: string;
}

/**
 * Per-element class overrides. Combine with `unstyled` to drop the bundled
 * look entirely and style the wizard with Tailwind, CSS modules, or your own
 * design system.
 */
export interface WizardClassNames {
  /** The wizard root element. */
  root?: string;
  header?: string;
  title?: string;
  subtitle?: string;
  navigation?: string;
  stepList?: string;
  step?: string;
  stepActive?: string;
  stepIcon?: string;
  stepTitle?: string;
  content?: string;
  footer?: string;
  backButton?: string;
  nextButton?: string;
  finishButton?: string;
}

export interface FormWizardProps {
  ref?: Ref<FormWizardMethods>;
  /** Heading. Passing a node replaces the entire header block. */
  title?: string | ReactNode;
  /** Secondary line under the title. */
  subtitle?: string;
  /** Step marker shape: `"circle"`, `"square"` or `"tab"`. */
  shape?: string;
  /** Accent colour for active markers, progress and buttons. */
  color?: string;
  /** `<FormWizard.TabContent>` steps. Ignored when `schema` is supplied. */
  children?: ReactNode;
  /** Declarative step definition. Takes precedence over `children`. */
  schema?: FormWizardSchema;
  /** Controlled wizard data. Omit to let the wizard own it. */
  data?: WizardData;
  /** Called whenever wizard data changes. */
  onDataChange?: (nextData: WizardData) => void;
  /** Label for the next button. */
  nextButtonText?: string;
  /** Replace the next button entirely; receives the advance handler. */
  nextButtonTemplate?: (onClick: () => void) => ReactNode;
  /** Label for the back button. */
  backButtonText?: string;
  /** Replace the back button entirely; receives the go-back handler. */
  backButtonTemplate?: (onClick: () => void) => ReactNode;
  /** Label for the finish button on the last step. */
  finishButtonText?: string;
  /** Replace the finish button entirely; receives the submit handler. */
  finishButtonTemplate?: (onClick: () => void) => ReactNode;
  /** Step marker size. Defaults to `"md"`. */
  stepSize?: "xs" | "sm" | "md" | "lg";
  /** Navigation orientation. Defaults to `"horizontal"`. */
  layout?: "horizontal" | "vertical";
  /** Initial zero-based step. Clamped into range on the first render. */
  startIndex?: number;
  /** Disable navigating by clicking step markers. */
  disableBackOnClickStep?: boolean;
  /** Show the progress indicator. Defaults to `true`. */
  showProgressBar?: boolean;
  /** Render compact inline step markers (hides the progress bar). */
  inlineStep?: boolean;
  /** Apply the dark palette. */
  darkMode?: boolean;
  /**
   * Per-element dark-mode colours. Prefer `theme`, which works in both
   * light and dark and is applied through CSS custom properties.
   */
  customDarkModeColor?: {
    title?: string;
    subtitle?: string;
    border?: string;
    tab?: string;
    tabIconColor?: string;
    buttons?: string;
    buttonsText?: string;
    finishButton?: string;
    finishButtonText?: string;
  };
  /** Render step markers without a filled background. */
  removeBackgroundTab?: boolean;
  /** Backdrop colour behind a transparent step marker. */
  removeBackgroundTabTransparentColor?: string;
  /** Called when the finish button is pressed and the last step is valid. */
  onComplete?: (data?: WizardData) => void;
  /** Called on every step change. Does not fire on mount. */
  onTabChange?: (e: WizardStepChangeEvent) => void;

  /** Theme tokens emitted as CSS custom properties on the root element. */
  theme?: WizardTheme;
  /** Drop the bundled class names so only your own styles apply. */
  unstyled?: boolean;
  /** Per-element class overrides, merged with (or replacing) the defaults. */
  classNames?: WizardClassNames;
  /** Keep wizard data across reloads. */
  persist?: WizardPersistOptions;
  /** Mirror the active step into the URL. `true` uses `?step=`. */
  syncToUrl?: boolean | WizardUrlSyncOptions;
  /**
   * Announce step changes to screen readers and move focus to the panel.
   * Defaults to `true`.
   */
  announceStepChanges?: boolean;
  /** Enable ArrowLeft/ArrowRight/Home/End navigation. Defaults to `true`. */
  keyboardNavigation?: boolean;
  /** Enable horizontal swipe navigation on touch devices. Defaults to `true`. */
  swipeNavigation?: boolean;
  /** Extra inline styles for the root element. */
  style?: CSSProperties;
  /** Accessible name for the wizard region. Defaults to `"Form Wizard"`. */
  ariaLabel?: string;
}

export interface FormWizardMethods {
  nextTab: () => void;
  prevTab: () => void;
  reset: () => void;
  activeAll: () => void;
  goToTab: (index: number) => void;
  goToTabById: (id: string) => void;
  setData: (data: WizardData) => void;
  getData: () => WizardData;
  /** Merge a patch into the wizard data, leaving other keys untouched. */
  updateData: (patch: WizardData) => void;
  /** Current zero-based step index. */
  getCurrentStep: () => number;
}

export interface WizardTabRef {
  setChecked: (value: boolean) => void;
}

/* ------------------------------------------------------------------ *
 * Headless API
 * ------------------------------------------------------------------ */

export interface UseWizardOptions {
  /**
   * Ordered step ids. Length drives `totalSteps`, and `goToId` resolves
   * against it. Pass the ids of the steps currently visible.
   */
  stepIds?: string[];
  /** Zero-based starting step. */
  startIndex?: number;
  /** Seed data for the uncontrolled case. */
  initialData?: WizardData;
  /** Supply to control data from outside; makes the hook a controlled input. */
  data?: WizardData;
  onDataChange?: (nextData: WizardData) => void;
  onStepChange?: (event: WizardStepChangeEvent) => void;
  persist?: WizardPersistOptions;
  syncToUrl?: boolean | WizardUrlSyncOptions;
}

export interface UseWizardReturn {
  currentStep: number;
  /** Furthest step reached — used to gate forward jumps. */
  maxVisitedStep: number;
  totalSteps: number;
  stepId?: string;
  isFirstStep: boolean;
  isLastStep: boolean;
  data: WizardData;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  goToId: (id: string) => void;
  reset: () => void;
  /** Mark every step as visited, unlocking free navigation. */
  activateAll: () => void;
  setData: (data: WizardData) => void;
  updateData: (patch: WizardData) => void;
  /** Remove persisted data for this wizard's `persist.key`. */
  clearPersisted: () => void;
}
