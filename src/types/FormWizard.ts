import { ReactNode, Ref } from "react";

export type WizardData = Record<string, unknown>;

export interface WizardConditionContext {
  data: WizardData;
  currentStep: number;
  stepIndex: number;
}

export interface WizardValidationContext {
  data: WizardData;
  currentStep: number;
  stepIndex: number;
}

export type WizardCondition = (context: WizardConditionContext) => boolean;
export type WizardValidationResult = boolean | string;
export type WizardValidation = (
  context: WizardValidationContext
) => WizardValidationResult;

export interface TabContentProps {
  id?: string;
  title?: string;
  icon?: string | ReactNode;
  route?: string;
  children: ReactNode;
  isValid?: boolean;
  showErrorOnTab?: boolean;
  showErrorOnTabColor?: string;
  validationError?: () => void | ReactNode;
  condition?: WizardCondition;
  validate?: WizardValidation;
}

export interface WizardStepSchema {
  id?: string;
  title?: string;
  icon?: string | ReactNode;
  content: ReactNode | ((context: WizardConditionContext) => ReactNode);
  condition?: WizardCondition;
  validate?: WizardValidation;
  showErrorOnTab?: boolean;
  showErrorOnTabColor?: string;
}

export interface FormWizardSchema {
  steps: WizardStepSchema[];
  initialData?: WizardData;
}

export interface FormWizardProps {
  ref?: Ref<FormWizardMethods>;
  title?: string | ReactNode;
  subtitle?: string;
  shape?: string;
  color?: string;
  children?: ReactNode;
  schema?: FormWizardSchema;
  data?: WizardData;
  onDataChange?: (nextData: WizardData) => void;
  nextButtonText?: string;
  nextButtonTemplate?: (arg0: () => void) => ReactNode;
  backButtonText?: string;
  backButtonTemplate?: (arg0: () => void) => ReactNode;
  finishButtonText?: string;
  finishButtonTemplate?: (arg0: () => void) => ReactNode;
  stepSize?: "xs" | "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  startIndex?: number;
  disableBackOnClickStep?: boolean;
  showProgressBar?: boolean;
  inlineStep?: boolean;
  darkMode?: boolean;
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
  removeBackgroundTab?: boolean;
  removeBackgroundTabTransparentColor?: string;
  onComplete?: (data?: WizardData) => void;
  onTabChange?: (e: { prevIndex: number; nextIndex: number; stepId?: string }) => void;
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
}

export interface WizardTabRef {
  setChecked: (value: boolean) => void;
}
