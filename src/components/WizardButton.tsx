import React from "react";
import { WizardButtonProps } from "../types/WizardButton";

const WizardButton = React.memo<WizardButtonProps>(({


  darkTextColor,
  darkButtonColor,
  onClick,
  children,
}) => {
  return (
    <button
      className="wizard-btn"
      type="button"
      style={{
        color: darkTextColor,
        backgroundColor: darkButtonColor,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

export default WizardButton;
