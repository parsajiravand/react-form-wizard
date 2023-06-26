import React from "react";

interface WizardButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const WizardButton: React.FC<WizardButtonProps> = ({ onClick, children }) => {
  return (
    <button className="wizard-btn" type="button" onClick={onClick}>
      {children}
    </button>
  );
};

export default WizardButton;
