import { Ref } from "react";

export interface WizardTabProps {
  title: string;
  icon: string;
  shape?: string;
  color?: string;
  isActive: boolean;
  index: number;
  inlineStep?: boolean;
  ref: Ref<{
    setChecked: (value: boolean) => void;
  }>;
  onClick?: () => void;
}
