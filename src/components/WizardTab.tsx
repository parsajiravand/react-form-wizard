import React from "react";
interface WizardTabProps {
  title: string;
  icon: string;
  shape?: string;
  color?: string;
  isActive?: boolean;
  index?: number;
  onClick?: () => void;
}

const WizardTab: React.FC<WizardTabProps> = (props: WizardTabProps) => {
  const { title, icon, shape, color, isActive, index, onClick } = props;
  const stepClasses = isActive ? "active" : "";
  const cursorStyle = shape === "square" ? "default" : "";

  return (
    <li key={index} className={stepClasses}>
      <a
        className={isActive ? "active" : ""}
        style={{ cursor: cursorStyle }}
        onClick={onClick}
      >
        <div
          className={`wizard-icon-circle md ${isActive ? "checked" : ""} ${
            shape === "square" ? "square_shape" : ""
          }`}
          role="tab"
          tabIndex={isActive ? 0 : undefined}
          id={`step-${index}`}
          aria-controls={`step-${index}`}
          aria-disabled={isActive}
          aria-selected={isActive}
          style={{
            borderColor: isActive ? color : "",
          }}
        >
          <div
            className={`wizard-icon-container ${
              shape === "square" ? "square_shape" : ""
            }`}
            style={{
              backgroundColor: isActive ? color : "",
            }}
          >
            <span className="wizard-icon">
              <i className={icon}></i>
            </span>
          </div>
        </div>
        <span
          className={`stepTitle ${isActive ? "active" : ""}`}
          style={{
            color: isActive ? color : "",
          }}
        >
          {title}
        </span>
      </a>
    </li>
  );
};
export default WizardTab;
