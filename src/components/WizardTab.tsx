import React from "react";
import { WizardTabProps } from "../types/WizardTab";

const WizardTab = React.memo(React.forwardRef<
  { setChecked: (value: boolean) => void },
  WizardTabProps
>(
  (
    {
      id,
      title,
      icon,
      shape,
      color = "#2196f3",
      isActive,
      index,
      currentStep,
      isVisible = true,
      isDisabled = false,
      hasValidationError = false,
      showProgressBar,
      layout,
      inlineStep = false,
      darkColor,
      darkIconColor,
      removeBackgroundTab,
      removeBackgroundTabTransparentColor,
      showErrorOnTab,
      showErrorOnTabColor = "red",
      onClick,
    }: WizardTabProps,
    ref
  ) => {
    const stepClasses = isActive ? "active" : "";
    const cursorStyle = isDisabled
      ? "not-allowed"
      : shape === "square"
      ? "default"
      : "pointer";
    const [isChecked, setIsChecked] = React.useState(false);
    React.useEffect(() => {
      if (isActive) {
        setIsChecked(true);
      }
    }, [isActive]);

    const progressStyle = () => {
      const style = {
        border: "2px solid " + color,
      };
      if (darkColor) {
        style.border = "2px solid " + darkColor;
      }
      if (showErrorOnTab || hasValidationError) {
        style.border = "2px solid " + showErrorOnTabColor;
      }
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
      if ((showErrorOnTab || hasValidationError) && isChecked && index <= currentStep) {
        return showErrorOnTabColor;
      }
      if (isChecked && !removeBackgroundTab) {
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

    if (!isVisible) return null;

    return (
      <li
        key={index}
        className={`${stepClasses}`}
        style={{
          position: "relative",
        }}
      >
        {showProgressBar && isChecked && index <= currentStep && (
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
          onClick={isDisabled ? undefined : onClick}
          role="tab"
          aria-selected={isActive}
          aria-controls={`${id ?? `step-${index}`}-panel`}
          id={id ?? `step-${index}`}
          tabIndex={isActive ? 0 : -1}
          aria-disabled={isDisabled}
        >
          <div
            className={`wizard-icon-circle md ${isChecked ? "checked" : ""} ${
              shape === "square" ? "square_shape" : ""
            }`}
            style={{
              backgroundColor: removeBackgroundTab
                ? "transparent"
                : isChecked
                ? darkColor
                  ? darkColor
                  : color
                : "",
              border: removeBackgroundTab ? "unset" : "",
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
                  removeBackgroundTab
                    ? {
                        backgroundColor:
                          removeBackgroundTabTransparentColor || "white",
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
              color:
                ((showErrorOnTab && isChecked && index <= currentStep) ||
                  (hasValidationError && isChecked && index <= currentStep))
                  ? showErrorOnTabColor
                  : isChecked
                  ? darkColor
                    ? darkColor
                    : color
                  : "",
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
));
export default WizardTab;
