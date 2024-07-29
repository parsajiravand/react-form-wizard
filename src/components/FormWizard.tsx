/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useImperativeHandle } from "react";
import WizardTab from "./WizardTab";
import WizardButton from "./WizardButton";
import "../index.css";
import {
  FormWizardProps,
  TabContentProps,
  WizardTabRef,
} from "../types/FormWizard";
import { WizardTabProps } from "../types/WizardTab";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const FormWizard: React.FC<FormWizardProps> & {
  TabContent: React.FC<TabContentProps>;
} = React.forwardRef(
  (
    {
      title,
      shape = "",
      color = "#2196f3",
      children,
      subtitle = "",
      nextButtonText = "Next",
      nextButtonTemplate,
      backButtonText = "Back",
      backButtonTemplate,
      finishButtonText = "Finish",
      finishButtonTemplate,
      stepSize = "md",
      layout = "horizontal",
      startIndex = 0,
      disableBackOnClickStep = false,
      showProggressBar = true,
      inlineStep = false,
      darkMode = false,
      customDarkModeColor = {}, //disable titles and subtitle color , background color and border color,buttons
      removeTabBackground = false,
      removeTabBackgroundTransparentColor = "darkBlue",
      onComplete,
      onTabChange,
    }: FormWizardProps,
    ref
  ) => {
    const steps = React.Children.toArray(
      children
    ) as React.ReactElement<TabContentProps>[];

    // set type for useRef
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wizardTabRef = steps.map(() => React.useRef<WizardTabRef[]>(null));
    // set type for useRef
    useImperativeHandle(ref, () => ({
      nextTab: () => {
        handleNext();
      },
      prevTab: () => {
        handlePrevious();
      },
      reset: () => {
        setCurrentStep(startIndex);
        wizardTabRef.forEach((tab: any, index) => {
          if (startIndex >= index) tab?.current?.setChecked(true);
          else tab?.current?.setChecked(false);
        });
      },
      activeAll: () => {
        wizardTabRef.forEach((tab: any) => {
          tab?.current?.setChecked(true);
        });
      },
      goToTab: (index: number) => {
        handelNavigate(index, true);
        // checked tab
        wizardTabRef.forEach((tab: any, i) => {
          if (index >= i) tab?.current?.setChecked(true);
          else tab?.current?.setChecked(false);
        });
      },
    }));
    /* START:Starter Component Checks */
    //check browser in dark mode or light mode
    console.log(
      "Browser in dark mode or light mode",
      window.matchMedia("(prefers-color-scheme: dark)")
    );
    const [prefersDarkMode, setPrefersDarkMode] = useState(false);
    // useEffect(() => {
    //   if (
    //     window.matchMedia &&
    //     window.matchMedia("(prefers-color-scheme: dark)").matches
    //   ) {
    //     setPrefersDarkMode(true);
    //   }
    // }, []);
    useEffect(() => {
      if (darkMode) {
        setPrefersDarkMode(true);
      }
    }, [darkMode]);

    // startIndex should be greater than or equal to 0 or less than steps.length
    if (startIndex < 0 || startIndex > steps.length) {
      startIndex = 0;
      console.error(
        "startIndex should be greater than or equal to 0 or less than steps.length"
      );
    }

    const [currentStep, setCurrentStep] = useState(startIndex);

    useEffect(() => {
      // set setChecked before all index to true
      if (currentStep > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wizardTabRef.forEach((tab: any, index) => {
          if (startIndex >= index) tab?.current?.setChecked(true);
        });
      }
    }, [currentStep, startIndex, wizardTabRef]);
    // if inline step hide proggress bar
    if (inlineStep) showProggressBar = false;

    // emit tab change event prevIndex, nextIndex
    if (typeof onTabChange === "function") {
      onTabChange({
        prevIndex: currentStep as number,
        nextIndex: (currentStep + 1) as number,
      });
    }
    /* END:Starter Component Checks */

    // add checked option if tab active or actived before
    const handelNavigate = (index: number, navigateMode = false) => {
      if (navigateMode) {
        setCurrentStep(index);
        return;
      }
      if (index <= currentStep) {
        setCurrentStep(index);
      }
    };
    const handleNext = () => {
      if (currentStep === steps.length - 1) return;
      setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
      if (currentStep === 0) return;
      setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
      if (typeof onComplete === "function") onComplete();
    };

    const renderTabs = () => {
      return steps.map((step, index) => {
        const { title, icon, isValid = true, validationError } = step.props;
        const isActive = index === currentStep;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (isActive && !isValid) {
            setCurrentStep(index - 1);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            wizardTabRef[index]?.current?.setChecked(false) as WizardTabRef;
            if (typeof validationError === "function") validationError();
          }
        }, [isActive, isValid, index, validationError]);

        return (
          <WizardTab
            key={index}
            ref={wizardTabRef[index] as unknown as WizardTabProps["ref"]}
            title={title as string}
            icon={icon as string}
            shape={shape}
            color={color}
            isActive={isActive}
            index={index}
            inlineStep={inlineStep}
            darkColor={
              prefersDarkMode && customDarkModeColor.tab
                ? customDarkModeColor.tab
                : ""
            }
            darkIconColor={
              prefersDarkMode && customDarkModeColor.tabIconColor
                ? customDarkModeColor.tabIconColor
                : ""
            }
            removeTabBackground={removeTabBackground}
            removeTabBackgroundTransparentColor={
              removeTabBackgroundTransparentColor
            }
            onClick={() =>
              !disableBackOnClickStep ? handelNavigate(index) : null
            }
          />
        );
      });
    };

    const renderContent = () => {
      return steps[currentStep];
    };
    const progressBarStyle = {
      backgroundColor:
        prefersDarkMode && customDarkModeColor?.border
          ? customDarkModeColor?.border
          : color,

      width: `${((currentStep + 1) / steps.length) * 100}%`,
      color:
        prefersDarkMode && customDarkModeColor?.border
          ? customDarkModeColor?.border
          : color,
    };
    const fillButtonStyle = {
      backgroundColor:
        prefersDarkMode && customDarkModeColor?.buttons
          ? customDarkModeColor?.buttons
          : color,
      borderColor:
        prefersDarkMode && customDarkModeColor?.buttons
          ? customDarkModeColor?.buttons
          : color,
      color:
        prefersDarkMode && customDarkModeColor?.buttonsText
          ? customDarkModeColor?.buttonsText + " !important"
          : "unset",
      borderRadius: "4px",
    };
    const isVertical = layout === "vertical" ? "vertical" : "horizontal";

    return (
      <div className={`react-form-wizard ${stepSize} ${isVertical} `}>
        <div className="wizard-header">
          {/* if title is element render other wise render string props */}
          {typeof title === "string" ? (
            <>
              <h4
                style={
                  prefersDarkMode && customDarkModeColor.title
                    ? { color: customDarkModeColor.title }
                    : {}
                }
                className={`wizard-title`}
              >
                {customDarkModeColor.title}
                {title}
              </h4>
              <p
                style={
                  prefersDarkMode && customDarkModeColor.subtitle
                    ? { color: customDarkModeColor.subtitle }
                    : {}
                }
                className={`category`}
              >
                {subtitle}
              </p>
            </>
          ) : (
            title
          )}
        </div>
        <div className="wizard-navigation">
          {showProggressBar && (
            <div className="wizard-progress-with-circle">
              <div
                className={`wizard-progress-bar`}
                style={progressBarStyle}
              ></div>
            </div>
          )}
          <ul
            className={`form-wizard-steps  wizard-nav wizard-nav-pills ${shape} ${stepSize}`}
            style={{ borderColor: color }}
          >
            {renderTabs()}
          </ul>
          <div className="wizard-tab-content">{renderContent()}</div>
        </div>

        <div className="wizard-card-footer clearfix">
          {currentStep > 0 && (
            <>
              {backButtonTemplate ? (
                backButtonTemplate(handlePrevious)
              ) : (
                <div className="wizard-footer-left" style={fillButtonStyle}>
                  <WizardButton
                    darkTextColor={
                      prefersDarkMode && customDarkModeColor?.buttonsText
                        ? customDarkModeColor?.buttonsText
                        : ""
                    }
                    onClick={handlePrevious}
                  >
                    {backButtonText}
                  </WizardButton>
                </div>
              )}
            </>
          )}
          {currentStep < steps.length - 1 && (
            <>
              {nextButtonTemplate ? (
                nextButtonTemplate(handleNext)
              ) : (
                <div className="wizard-footer-right" style={fillButtonStyle}>
                  <WizardButton
                    darkTextColor={
                      prefersDarkMode && customDarkModeColor?.buttonsText
                        ? customDarkModeColor?.buttonsText
                        : ""
                    }
                    onClick={handleNext}
                  >
                    {nextButtonText}
                  </WizardButton>
                </div>
              )}
            </>
          )}
          {currentStep === steps.length - 1 && (
            <>
              {finishButtonTemplate ? (
                finishButtonTemplate(handleSubmit)
              ) : (
                <div className="wizard-footer-right" style={fillButtonStyle}>
                  <WizardButton
                    darkTextColor={
                      prefersDarkMode && customDarkModeColor?.finishButton
                        ? customDarkModeColor?.finishButton
                        : ""
                    }
                    onClick={handleSubmit}
                  >
                    {finishButtonText}
                  </WizardButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

FormWizard.TabContent = ({ children, isValid = true }) => {
  return <>{isValid && children}</>;
};

export default FormWizard;
