import React from "react";
import { WizardButtonProps } from "../types/WizardButton";

const WizardButton: React.FC<WizardButtonProps> = ({
  darkTextColor,
  onClick,
  children,
}) => {
  return (
    <button
      className="wizard-btn"
      type="button"
      style={{ color: darkTextColor }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default WizardButton;
