import type { ReactNode } from "react";

export interface WizardButtonProps {
  darkTextColor?: string;
  darkButtonColor?: string;
  /** Extra class applied to the button. */
  className?: string;
  /** Drop the bundled `wizard-btn` class so only your own styles apply. */
  unstyled?: boolean;
  onClick: () => void;
  children: ReactNode;
}
