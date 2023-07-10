import { ReactNode, Ref } from "react";

export interface TabContentProps {
  title: string;
  icon: string;
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
  backButtonText?: string;
  finishButtonText?: string;
  stepSize?: "xs" | "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  startIndex?: number;
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
