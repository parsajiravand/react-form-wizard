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
      currentStep,
      showProggressBar,
      layout,
      inlineStep = false,
      darkColor,
      darkIconColor,
      removeTabBackground,
      removeTabBackgroundTransparentColor,
      hasError,
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

    const progressStyle = () => {
      const style = {
        border: "2px solid " + (darkColor ? darkColor : color),
      };
      if (layout === "vertical") {
        return {
          ...style,
          rotate: "90deg",
          animation: "slideInVertical 0.3s forwards",
        };
      }
      return style;
    };
    const iconStyle = () => {
      if (isActive && darkIconColor) {
        return { color: darkIconColor ? darkIconColor : color };
      }
      if (isActive && isChecked) {
        return { color: "white" };
      }

      if (isChecked && darkIconColor) {
        return { color: darkIconColor ? darkIconColor : color };
      }

      if (isChecked) {
        return { color: "white" };
      }
    };
    const checkBackgroundCondition = () => {
      if (hasError) {
        return "red";
      }
      if (isChecked && !removeTabBackground) {
        return darkColor ? darkColor : color;
      }
      return "";
    };

    React.useImperativeHandle(ref, () => ({
      setChecked: (value: boolean) => {
        setIsChecked(value);
      },
    }));
    // check if icon type string other wise render react node
    const handelIcon = () => {
      if (!icon) return <span style={iconStyle()}>{index + 1}</span>;
      if (typeof icon === "string") {
        return <i className={icon} style={iconStyle()}></i>;
      }
      return icon;
    };

    return (
      <li
        key={index}
        className={`${stepClasses}`}
        style={{
          position: "relative",
        }}
      >
        {showProggressBar && isChecked && index <= currentStep && (
          <div
            className="smooth-border-left-to-right"
            style={progressStyle()}
          ></div>
        )}

        <a
          className={`${isActive ? "active" : ""} ${
            inlineStep ? "inline-step" : ""
          }`}
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
              borderColor: isChecked ? (darkColor ? darkColor : color) : "",
              backgroundColor: removeTabBackground
                ? "transparent"
                : isChecked
                ? darkColor
                  ? darkColor
                  : color
                : "",
              border: removeTabBackground ? "unset" : "",
            }}
          >
            <div
              className={`wizard-icon-container ${
                shape === "square" ? "square_shape" : ""
              }`}
              style={{
                backgroundColor: checkBackgroundCondition(),
              }}
            >
              <span
                className="wizard-icon"
                style={
                  removeTabBackground
                    ? {
                        backgroundColor:
                          removeTabBackgroundTransparentColor || "white",
                        padding: "10px",
                      }
                    : {}
                }
              >
                {/* check if icon type string other wise render react node */}
                {handelIcon()}
              </span>
            </div>
          </div>
          <span
            className={`stepTitle ${isActive ? "active" : ""}`}
            style={{
              color: isChecked ? (darkColor ? darkColor : color) : "",
              marginTop: inlineStep ? "" : "8px",
              padding: inlineStep ? "0 10px" : "0",
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
