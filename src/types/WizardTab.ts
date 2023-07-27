import { Ref } from "react";

export interface WizardTabProps {
  title: string;
  icon: string;
  shape?: string;
  color?: string;
  isActive: boolean;
  index: number;
  ref: Ref<{
    setChecked: (value: boolean) => void;
  }>;
  onClick?: () => void;
}
