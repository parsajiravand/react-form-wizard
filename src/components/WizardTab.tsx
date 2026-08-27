import React from "react";
import { WizardTabProps } from "../types/WizardTab.js";
import type { WizardTabRef } from "../types/FormWizard.js";

const WizardTab = React.memo(
  React.forwardRef<WizardTabRef, WizardTabProps>(
    (
      {
        id,
        title,
        icon,
        shape,
        color = "var(--rfw-primary, #2196f3)",
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
        unstyled = false,
        classNames,
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

      const progressStyle = (): React.CSSProperties => {
        const style: React.CSSProperties = {
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

      const iconStyle = (): React.CSSProperties | undefined => {
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
        return undefined;
      };

      const checkBackgroundCondition = () => {
        if (
          (showErrorOnTab || hasValidationError) &&
          isChecked &&
          index <= currentStep
        ) {
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

      const anchorClass = unstyled
        ? [isActive ? classNames?.stepActive : undefined, classNames?.step]
            .filter(Boolean)
            .join(" ")
        : [
            isActive ? "active" : "",
            inlineStep ? "inline-step" : "",
            classNames?.step,
            isActive ? classNames?.stepActive : undefined,
          ]
            .filter(Boolean)
            .join(" ");

      return (
        <li
          className={stepClasses}
          style={unstyled ? undefined : { position: "relative" }}
        >
          {!unstyled && showProgressBar && isChecked && index <= currentStep && (
            <div
              className="smooth-border-left-to-right"
              style={progressStyle()}
            ></div>
          )}

          <a
            className={anchorClass}
            style={unstyled ? undefined : { cursor: cursorStyle }}
            onClick={isDisabled ? undefined : onClick}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${id ?? `step-${index}`}-panel`}
            id={id ?? `step-${index}`}
            tabIndex={isActive ? 0 : -1}
            aria-disabled={isDisabled}
            onKeyDown={
              isDisabled
                ? undefined
                : (event) => {
                    // A tab in a tablist must be operable from the keyboard,
                    // not just by pointer.
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onClick?.();
                    }
                  }
            }
          >
            <div
              className={
                unstyled
                  ? classNames?.stepIcon ?? ""
                  : [
                      "wizard-icon-circle md",
                      isChecked ? "checked" : "",
                      shape === "square" ? "square_shape" : "",
                      classNames?.stepIcon,
                    ]
                      .filter(Boolean)
                      .join(" ")
              }
              style={
                unstyled
                  ? undefined
                  : {
                      backgroundColor: removeBackgroundTab
                        ? "transparent"
                        : isChecked
                        ? darkColor
                          ? darkColor
                          : color
                        : "",
                      border: removeBackgroundTab ? "unset" : "",
                    }
              }
            >
              <div
                className={
                  unstyled
                    ? ""
                    : `wizard-icon-container ${
                        shape === "square" ? "square_shape" : ""
                      }`
                }
                style={
                  unstyled
                    ? undefined
                    : { backgroundColor: checkBackgroundCondition() }
                }
              >
                <span
                  className={unstyled ? "" : "wizard-icon"}
                  style={
                    !unstyled && removeBackgroundTab
                      ? {
                          backgroundColor:
                            removeBackgroundTabTransparentColor || "white",
                          padding: "10px",
                        }
                      : undefined
                  }
                >
                  {/* check if icon type string other wise render react node */}
                  {handelIcon()}
                </span>
              </div>
            </div>
            <span
              className={
                unstyled
                  ? classNames?.stepTitle ?? ""
                  : [
                      "stepTitle",
                      isActive ? "active" : "",
                      classNames?.stepTitle,
                    ]
                      .filter(Boolean)
                      .join(" ")
              }
              style={
                unstyled
                  ? undefined
                  : {
                      color:
                        (showErrorOnTab && isChecked && index <= currentStep) ||
                        (hasValidationError && isChecked && index <= currentStep)
                          ? showErrorOnTabColor
                          : isChecked
                          ? darkColor
                            ? darkColor
                            : color
                          : "",
                      marginTop: inlineStep ? "" : "8px",
                      padding: inlineStep ? "0 10px" : "0",
                    }
              }
            >
              {title}
            </span>
          </a>
        </li>
      );
    }
  )
);

WizardTab.displayName = "WizardTab";

export default WizardTab;
