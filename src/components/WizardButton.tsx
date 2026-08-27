import React from "react";
import { WizardButtonProps } from "../types/WizardButton.js";

const WizardButton = React.memo<WizardButtonProps>(
  ({ darkTextColor, darkButtonColor, className, unstyled = false, onClick, children }) => {
    const buttonClass = unstyled
      ? className ?? ""
      : ["wizard-btn", className].filter(Boolean).join(" ");

    return (
      <button
        className={buttonClass}
        type="button"
        style={
          unstyled
            ? undefined
            : {
                color: darkTextColor,
                backgroundColor: darkButtonColor,
              }
        }
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
);

WizardButton.displayName = "WizardButton";

export default WizardButton;
