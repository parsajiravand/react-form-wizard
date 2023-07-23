import React from "react";
import { WizardTabProps } from "../types/WizardTab";

const WizardTab: React.FC<WizardTabProps> = React.forwardRef(
  (
    {
      title,
      icon,
      shape,
      color = "#2196f3",
      isActive,
      index,
      onClick,
    }: WizardTabProps,
    ref
  ) => {
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
    React.useImperativeHandle(ref, () => ({
      setChecked: (value: boolean) => {
        setIsChecked(value);
      },
    }));

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
                {/* check if icon type string other wise render react node */}
                {typeof icon === "string" ? (
                  <i className={icon} style={iconStyle()}></i>
                ) : (
                  icon
                )}
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
  }
);
export default WizardTab;
