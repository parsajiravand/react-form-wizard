import React from "react";
import { WizardButtonProps } from "../types/WizardButton";


const WizardButton: React.FC<WizardButtonProps> = ({ onClick, children }) => {
  return (
    <button className="wizard-btn" type="button" onClick={onClick}>
      {children}
    </button>
  );
};

export default WizardButton;
