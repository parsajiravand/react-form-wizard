import { Ref } from "react";

export interface WizardTabProps {
  title: string;
  icon: string;
  shape?: string;
  color?: string;
  isActive: boolean;
  index: number;
  currentStep: number;
  showProggressBar?: boolean;
  layout?: string;
  inlineStep?: boolean;
  darkColor?: string;
  darkIconColor?: string;
  removeTabBackground?: boolean;
  removeTabBackgroundTransparentColor?: string;
  showErrorOnTab?: boolean;
  showErrorOnTabColor?: string;
  ref: Ref<{
    setChecked: (value: boolean) => void;
  }>;
  onClick?: () => void;
}
