import React, { useState, useEffect, useImperativeHandle } from "react";
import WizardTab from "./WizardTab";
import WizardButton from "./WizardButton";
import "../index.css";
import {
  FormWizardProps,
  TabContentProps,
  WizardTabRef,
  FormWizardMethods,
} from "../types/FormWizard";

const FormWizard = React.memo(React.forwardRef<FormWizardMethods, FormWizardProps>(
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
      showProgressBar = true,
      inlineStep = false,
      darkMode = false,
      customDarkModeColor = {}, //disable titles and subtitle color , background color and border color,buttons
      removeBackgroundTab = false,
      removeBackgroundTabTransparentColor = "",
      onComplete,
      onTabChange,
    },
    ref
  ) => {
    const steps = React.useMemo(() =>
      React.Children.toArray(
        children
      ) as React.ReactElement<TabContentProps>[],
      [children]
    );

    // Create refs for wizard tabs
    const wizardTabRef = React.useRef<(React.RefObject<WizardTabRef> | null)[]>([]);

    // Initialize refs when steps change
    React.useEffect(() => {
      wizardTabRef.current = steps.map((_, index) =>
        wizardTabRef.current[index] || React.createRef<WizardTabRef>()
      );
    }, [steps]);
    //check browser in dark mode or light mode
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


    // Touch gesture support for mobile
    const touchStartX = React.useRef<number>(0);
    const touchStartY = React.useRef<number>(0);

    const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX.current - touchEndX;
      const diffY = touchStartY.current - touchEndY;

      // Only handle horizontal swipes (ignore vertical scrolls)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left - next step
          // handleNext(); // Will be set after function declarations
        } else {
          // Swipe right - previous step
          // handlePrevious(); // Will be set after function declarations
        }
      }

      touchStartX.current = 0;
      touchStartY.current = 0;
    }, []);

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
        wizardTabRef.current.forEach((tab, index) => {
          if (startIndex >= index) tab?.current?.setChecked(true);
        });
      }
    }, [currentStep, startIndex]);
    // if inline step hide progress bar
    if (inlineStep) showProgressBar = false;

    // emit tab change event prevIndex, nextIndex
    if (typeof onTabChange === "function") {
      onTabChange({
        prevIndex: currentStep as number,
        nextIndex: (currentStep + 1) as number,
      });
    }
    /* END:Starter Component Checks */

    // add checked option if tab active or actived before
    const handelNavigate = React.useCallback((index: number, navigateMode = false) => {
      if (navigateMode) {
        setCurrentStep(index);
        return;
      }
      if (index <= currentStep) {
        setCurrentStep(index);
      }
    }, [currentStep]);
    const handleNext = React.useCallback(() => {
      if (currentStep === steps.length - 1) return;
      setCurrentStep(currentStep + 1);
    }, [currentStep, steps.length]);

    const handlePrevious = React.useCallback(() => {
      if (currentStep === 0) return;
      setCurrentStep(currentStep - 1);
    }, [currentStep]);

    const handleSubmit = React.useCallback(() => {
      if (typeof onComplete === "function") onComplete();
    }, [onComplete]);

    const imperativeMethods = React.useMemo(() => ({
      nextTab: () => {
        handleNext();
      },
      prevTab: () => {
        handlePrevious();
      },
      reset: () => {
        setCurrentStep(startIndex);
        wizardTabRef.current.forEach((tab, index) => {
          if (startIndex >= index) tab?.current?.setChecked(true);
          else tab?.current?.setChecked(false);
        });
      },
      activeAll: () => {
        wizardTabRef.current.forEach((tab) => {
          tab?.current?.setChecked(true);
        });
      },
      goToTab: (index: number) => {
        handelNavigate(index, true);
        // checked tab
        wizardTabRef.current.forEach((tab, i) => {
          if (index >= i) tab?.current?.setChecked(true);
          else tab?.current?.setChecked(false);
        });
      },
    }), [startIndex, handelNavigate, handleNext, handlePrevious]);

    useImperativeHandle(ref, () => imperativeMethods);

    // Keyboard navigation support
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Only handle keyboard navigation when wizard is focused
        if (!document.activeElement?.closest('.react-form-wizard')) return;

        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            handleNext();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            handlePrevious();
            break;
          case 'Home':
            e.preventDefault();
            handelNavigate(0, true);
            break;
          case 'End':
            e.preventDefault();
            handelNavigate(steps.length - 1, true);
            break;
          case 'Enter':
          case ' ':
            if (currentStep === steps.length - 1) {
              e.preventDefault();
              handleSubmit();
            }
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentStep, steps.length, handleNext, handlePrevious, handelNavigate, handleSubmit]);

    // Touch gesture handling
    React.useEffect(() => {
      const handleTouchEndWithFunctions = (e: TouchEvent) => {
        if (!touchStartX.current || !touchStartY.current) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchStartX.current - touchEndX;
        const diffY = touchStartY.current - touchEndY;

        // Only handle horizontal swipes (ignore vertical scrolls)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
            // Swipe left - next step
            handleNext();
          } else {
            // Swipe right - previous step
            handlePrevious();
          }
        }

        touchStartX.current = 0;
        touchStartY.current = 0;
      };

      // Override the touch end handler with actual function calls
      const wizardElement = document.querySelector('.react-form-wizard');
      if (wizardElement) {
        wizardElement.addEventListener('touchend', handleTouchEndWithFunctions);
        return () => {
          wizardElement.removeEventListener('touchend', handleTouchEndWithFunctions);
        };
      }
    }, [handleNext, handlePrevious]);

    const renderTabs = React.useCallback(() => {
      return steps.map((step, index) => {
        const {
          title,
          icon,
          isValid = true,
          validationError,
          showErrorOnTab,
          showErrorOnTabColor = "red",
        } = step.props;
        const isActive = index === currentStep;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (isActive && !isValid) {
            setCurrentStep(index - 1);
            wizardTabRef.current[index]?.current?.setChecked(false);
            if (typeof validationError === "function") validationError();
          }
        }, [isActive, isValid, index, validationError]);

        return (
          <WizardTab
            key={index}
            ref={wizardTabRef.current[index]}
            title={title as string}
            icon={icon as string}
            shape={shape}
            color={color}
            isActive={isActive}
            index={index}
            currentStep={currentStep}
            layout={layout}
            showProgressBar={showProgressBar}
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
            removeBackgroundTab={removeBackgroundTab}
            removeBackgroundTabTransparentColor={
              removeBackgroundTabTransparentColor
            }
            showErrorOnTab={showErrorOnTab}
            showErrorOnTabColor={showErrorOnTabColor}
            onClick={() =>
              !disableBackOnClickStep ? handelNavigate(index) : null
            }
          />
        );
      });
    }, [
      steps,
      currentStep,
      shape,
      color,
      layout,
      showProgressBar,
      inlineStep,
      prefersDarkMode,
      customDarkModeColor,
      removeBackgroundTab,
      removeBackgroundTabTransparentColor,
      disableBackOnClickStep,
      handelNavigate
    ]);

    const renderContent = React.useCallback(() => {
      return steps[currentStep];
    }, [steps, currentStep]);
    // const progressBarStyle = {
    //   backgroundColor:
    //     prefersDarkMode && customDarkModeColor?.border
    //       ? customDarkModeColor?.border
    //       : color,

    //   width: `${((currentStep + 1) / steps.length) * 100}%`,
    //   color:
    //     prefersDarkMode && customDarkModeColor?.border
    //       ? customDarkModeColor?.border
    //       : color,
    // };
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
    const isInline = inlineStep ? "inline" : "";

    return (
      <div
        className={`react-form-wizard ${stepSize} ${isVertical} ${isInline} `}
        role="region"
        aria-label="Form Wizard"
        aria-describedby="wizard-description"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Skip link for keyboard users */}
        <a
          href="#wizard-content"
          className="sr-only"
          style={{
            position: 'absolute',
            top: '-40px',
            left: '6px',
            background: '#000',
            color: '#fff',
            padding: '8px',
            textDecoration: 'none',
            borderRadius: '4px',
            zIndex: 1000
          }}
          onFocus={(e) => { e.target.style.top = '6px'; }}
          onBlur={(e) => { e.target.style.top = '-40px'; }}
        >
          Skip to main content
        </a>

        <div className="wizard-header">
          {/* Hidden description for screen readers */}
          <div id="wizard-description" className="sr-only">
            Form wizard with {steps.length} steps. Currently on step {currentStep + 1}.
            Use arrow keys to navigate between steps.
          </div>
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
          {/* {showProgressBar && (
            <div className="wizard-progress-with-circle">
              <div
                className={`wizard-progress-bar`}
                style={progressBarStyle}
              ></div>
            </div>
          )} */}
          <ul
            className={`form-wizard-steps  wizard-nav wizard-nav-pills ${shape} ${stepSize}`}
            style={{ borderColor: color }}
            role="tablist"
            aria-label="Form steps"
          >
            {renderTabs()}
          </ul>
          <div
            className="wizard-tab-content"
            role="tabpanel"
            aria-labelledby={`step-${currentStep}`}
            id={`wizard-content step-${currentStep}-panel`}
          >
            {renderContent()}
          </div>
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
                    darkButtonColor={
                      prefersDarkMode && customDarkModeColor?.buttons
                        ? customDarkModeColor?.buttons
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
                    darkButtonColor={
                      prefersDarkMode && customDarkModeColor?.buttons
                        ? customDarkModeColor?.buttons
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
                      prefersDarkMode && customDarkModeColor?.finishButtonText
                        ? customDarkModeColor?.finishButtonText
                        : ""
                    }
                    darkButtonColor={
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
));

const TabContent: React.FC<TabContentProps> = ({ children, isValid = true, ...props }) => {
  return <>{isValid && children}</>;
};

// Attach TabContent to the memoized component
const FormWizardWithTabContent = Object.assign(FormWizard, {
  TabContent,
});

export default FormWizardWithTabContent;
export { TabContent };
