import React from "react";
interface WizardTabProps {
  title: string;
  icon: string;
  shape?: string;
  color?: string;
  isActive: boolean;
  index?: number;
  onClick?: () => void;
}

const WizardTab: React.FC<WizardTabProps> = ({
  title,
  icon,
  shape,
  color = "#2196f3",
  isActive,
  index,
  onClick,
}: WizardTabProps) => {
  const stepClasses = isActive ? "active" : "";
  const cursorStyle = shape === "square" ? "default" : "";
  const [isChecked, setIsChecked] = React.useState(false);
  React.useEffect(() => {
    if (isActive) {
      setIsChecked(true);
    }
  }, [isActive]);

  const iconStyle = () => {
    if (isActive && isChecked) {
      return { color: "white" };
    }
    if (isChecked) {
      return { color: color };
    }
  };

  return (
    <li key={index} className={stepClasses}>
      <a
        className={isActive ? "active" : ""}
        style={{ cursor: cursorStyle }}
        onClick={onClick}
      >
        <div
          className={`wizard-icon-circle md ${isChecked ? "checked" : ""} ${
            shape === "square" ? "square_shape" : ""
          }`}
          role="tab"
          tabIndex={isActive ? 0 : undefined}
          id={`step-${index}`}
          aria-controls={`step-${index}`}
          aria-disabled={isActive}
          aria-selected={isActive}
          style={{
            borderColor: isChecked ? color : "",
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
              <i className={icon} style={iconStyle()}></i>
            </span>
          </div>
        </div>
        <span
          className={`stepTitle ${isActive ? "active" : ""}`}
          style={{
            color: isChecked ? color : "",
            marginTop: "8px",
          }}
        >
          {title}
        </span>
      </a>
    </li>
  );
};
export default WizardTab;
