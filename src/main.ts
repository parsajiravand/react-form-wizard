/**
 * Public entry point for react-form-wizard-component.
 *
 * Everything importable from the package is exported here, and this file is
 * what `types` in package.json points at — so the documented API and the
 * shipped declarations can never drift apart again.
 */

import FormWizard, { TabContent } from "./components/FormWizard.js";

/* ---------------- components ---------------- */

export default FormWizard;
export { FormWizard, TabContent };

/* ---------------- headless API ---------------- */

export {
  useWizard,
  useWizardCursor,
  useWizardData,
} from "./hooks/useWizard.js";

export type {
  UseWizardCursorOptions,
  UseWizardCursorReturn,
  UseWizardDataOptions,
  UseWizardDataReturn,
} from "./hooks/useWizard.js";

/* ---------------- validation adapters ---------------- */

export {
  composeValidators,
  hookFormValidator,
  zodValidator,
} from "./adapters/validators.js";

export { tailwindPreset } from "./adapters/tailwind.js";
export type { TailwindPresetOptions } from "./adapters/tailwind.js";

export type {
  HookFormLike,
  HookFormValidatorOptions,
  StandardSchemaLike,
  ZodValidatorOptions,
} from "./adapters/validators.js";

/* ---------------- types ---------------- */

export type {
  FormWizardMethods,
  FormWizardProps,
  FormWizardSchema,
  TabContentProps,
  UseWizardOptions,
  UseWizardReturn,
  WizardClassNames,
  WizardCondition,
  WizardConditionContext,
  WizardData,
  WizardPersistOptions,
  WizardStepChangeEvent,
  WizardStepSchema,
  WizardTabRef,
  WizardTheme,
  WizardUrlSyncOptions,
  WizardValidation,
  WizardValidationContext,
  WizardValidationResult,
} from "./types/FormWizard.js";

export type { WizardTabProps } from "./types/WizardTab.js";
export type { WizardButtonProps } from "./types/WizardButton.js";
