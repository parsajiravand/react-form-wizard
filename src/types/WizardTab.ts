
import React from "react";

export interface WizardTabProps {
  id?: string;
  title: string;
  icon?: string | React.ReactNode;
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
  onClick?: () => void;
}
