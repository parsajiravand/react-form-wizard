import { ReactNode, Ref } from "react";

export interface TabContentProps {
  title?: string;
  icon?: string | ReactNode;
  route?: string;
  children: ReactNode;
  isValid?: boolean;
  validationError?: () => void | ReactNode;
}

export interface FormWizardProps {
  ref?: Ref<FormWizardMethods>;
  title?: string | ReactNode;
  subtitle?: string;
  shape?: string;
  color?: string;
  children: ReactNode;
  nextButtonText?: string;
  nextButtonTemplate?: (arg0: () => void) => void;
  backButtonText?: string;
  backButtonTemplate?: (arg0: () => void) => void;
  finishButtonText?: string;
  finishButtonTemplate?: (arg0: () => void) => void;
  stepSize?: "xs" | "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  startIndex?: number;
  disableBackOnClickStep?: boolean;
  showProggressBar?: boolean;
  inlineStep?: boolean;
  onComplete?: () => void;
  onTabChange?: (e: { prevIndex: number; nextIndex: number }) => void;
}
export interface FormWizardMethods {
  nextTab: () => void;
  prevTab: () => void;
  reset: () => void;
  activeAll: () => void;
  goToTab: (index: number) => void;
}
export interface WizardTabRef {
  current?: { setChecked: (value: boolean) => void };
}
