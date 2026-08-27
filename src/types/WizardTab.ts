import type { ReactNode } from "react";
import type { WizardClassNames } from "./FormWizard.js";

export interface WizardTabProps {
  id?: string;
  title: string;
  icon?: string | ReactNode;
  shape?: string;
  color?: string;
  isActive: boolean;
  index: number;
  currentStep: number;
  isVisible?: boolean;
  isDisabled?: boolean;
  hasValidationError?: boolean;
  showProgressBar?: boolean;
  layout?: "horizontal" | "vertical";
  inlineStep?: boolean;
  darkColor?: string;
  darkIconColor?: string;
  removeBackgroundTab?: boolean;
  removeBackgroundTabTransparentColor?: string;
  showErrorOnTab?: boolean;
  showErrorOnTabColor?: string;
  /** Drop the bundled classes and inline colours. */
  unstyled?: boolean;
  /** Visual skin; the modern skin paints from CSS rather than inline styles. */
  variant?: "modern" | "legacy";
  /** True once the step has been visited and is no longer the active one. */
  isComplete?: boolean;
  /** Per-element class overrides forwarded from `<FormWizard classNames>`. */
  classNames?: WizardClassNames;
  onClick?: () => void;
}
