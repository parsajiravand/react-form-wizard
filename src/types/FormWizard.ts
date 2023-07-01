import { ReactNode } from "react";

export interface TabContentProps {
  title: string;
  icon: string;
  route?: string;
  children: ReactNode;
}

export interface FormWizardProps {
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
export interface WizardTabRef {
  current?: { setChecked: (value: boolean) => void };
}
