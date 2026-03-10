import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import WizardTab from "./WizardTab";
import WizardButton from "./WizardButton";
import "../index.css";
import {
  FormWizardMethods,
  FormWizardProps,
  TabContentProps,
  WizardConditionContext,
  WizardData,
  WizardStepSchema,
  WizardTabRef,
} from "../types/FormWizard";

type NormalizedStep = {
  id: string;
  title: string;
  icon?: string | React.ReactNode;
  content: React.ReactNode;
  showErrorOnTab?: boolean;
  showErrorOnTabColor?: string;
  validationError?: () => void | React.ReactNode;
  isValid: boolean;
};

const createFallbackStepId = (index: number) => `step-${index + 1}`;

const normalizeSchemaStep = (
  step: WizardStepSchema,
  index: number,
  context: WizardConditionContext
): NormalizedStep | null => {
  const isVisible = step.condition ? step.condition(context) : true;
  if (!isVisible) return null;

  const validationResult = step.validate ? step.validate(context) : true;
  const isValid = validationResult === true;
  const content =
    typeof step.content === "function" ? step.content(context) : step.content;

  return {
    id: step.id ?? createFallbackStepId(index),
    title: step.title ?? `Step ${index + 1}`,
    icon: step.icon,
    content,
    showErrorOnTab: step.showErrorOnTab ?? !isValid,
    showErrorOnTabColor: step.showErrorOnTabColor ?? "red",
    isValid,
    validationError:
      typeof validationResult === "string"
        ? () => validationResult
        : undefined,
  };
};

const normalizeChildrenStep = (
  child: React.ReactElement<TabContentProps>,
  index: number,
  context: WizardConditionContext
): NormalizedStep | null => {
  const stepCondition = child.props.condition;
  const isVisible = stepCondition ? stepCondition(context) : true;
  if (!isVisible) return null;

  const validateResult = child.props.validate?.(context);
  const fallbackValid = child.props.isValid ?? true;
  const isValid = validateResult === undefined ? fallbackValid : validateResult === true;

  return {
    id: child.props.id ?? createFallbackStepId(index),
    title: child.props.title ?? `Step ${index + 1}`,
    icon: child.props.icon,
    content: child.props.children,
    showErrorOnTab: child.props.showErrorOnTab ?? !isValid,
    showErrorOnTabColor: child.props.showErrorOnTabColor ?? "red",
    validationError: child.props.validationError,
    isValid,
  };
};

const BaseFormWizard = React.forwardRef<FormWizardMethods, FormWizardProps>(
  (
    {
      title,
      subtitle = "",
      shape = "",
      color = "#2196f3",
      children,
      schema,
      data,
      onDataChange,
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
      customDarkModeColor = {},
      removeBackgroundTab = false,
      removeBackgroundTabTransparentColor = "",
      onComplete,
      onTabChange,
    },
    ref
  ) => {
    const [prefersDarkMode, setPrefersDarkMode] = useState(darkMode);
    const [wizardData, setWizardData] = useState<WizardData>(
      data ?? schema?.initialData ?? {}
    );

    useEffect(() => {
      setPrefersDarkMode(Boolean(darkMode));
    }, [darkMode]);

    useEffect(() => {
      if (data) setWizardData(data);
    }, [data]);

    const context = useMemo<WizardConditionContext>(
      () => ({
        data: wizardData,
        currentStep: 0,
        stepIndex: 0,
      }),
      [wizardData]
    );

    const schemaSteps = useMemo(() => {
      if (!schema) return [];
      return schema.steps
        .map((step, index) =>
          normalizeSchemaStep(step, index, {
            ...context,
            stepIndex: index,
          })
        )
        .filter((step): step is NormalizedStep => step !== null);
    }, [schema, context]);

    const childrenSteps = useMemo(() => {
      if (!children) return [];
      const childArray = React.Children.toArray(
        children
      ) as React.ReactElement<TabContentProps>[];

      return childArray
        .map((child, index) =>
          normalizeChildrenStep(child, index, {
            ...context,
            stepIndex: index,
          })
        )
        .filter((step): step is NormalizedStep => step !== null);
    }, [children, context]);

    // Compatibility layer: schema API takes precedence if provided.
    const steps = schema ? schemaSteps : childrenSteps;
    const safeStartIndex =
      startIndex >= 0 && startIndex < steps.length ? startIndex : 0;
    const [currentStep, setCurrentStep] = useState(safeStartIndex);
    const [maxVisitedStep, setMaxVisitedStep] = useState(safeStartIndex);

    useEffect(() => {
      if (currentStep > maxVisitedStep) {
        setMaxVisitedStep(currentStep);
      }
    }, [currentStep, maxVisitedStep]);

    useEffect(() => {
      if (currentStep >= steps.length) {
        setCurrentStep(Math.max(0, steps.length - 1));
      }
    }, [currentStep, steps.length]);

    const wizardTabRef = useRef<(React.RefObject<WizardTabRef> | null)[]>([]);
    useEffect(() => {
      wizardTabRef.current = steps.map(
        (_, index) => wizardTabRef.current[index] ?? React.createRef<WizardTabRef>()
      );
    }, [steps]);

    useEffect(() => {
      wizardTabRef.current.forEach((tab, index) => {
        tab?.current?.setChecked(index <= maxVisitedStep);
      });
    }, [maxVisitedStep, steps.length]);

    const canMoveToNext = useMemo(() => {
      const activeStep = steps[currentStep];
      return activeStep ? activeStep.isValid : false;
    }, [steps, currentStep]);

    const triggerValidationError = React.useCallback(() => {
      const activeStep = steps[currentStep];
      if (!activeStep?.validationError) return;
      if (typeof activeStep.validationError === "function") {
        activeStep.validationError();
      }
    }, [steps, currentStep]);

    const navigateTo = React.useCallback((index: number, force = false) => {
      if (index < 0 || index >= steps.length) return;
      if (!force && disableBackOnClickStep && index > currentStep) return;
      if (!force && index > maxVisitedStep) return;
      setCurrentStep(index);
    }, [steps.length, disableBackOnClickStep, currentStep, maxVisitedStep]);

    const handleNext = React.useCallback(() => {
      if (currentStep >= steps.length - 1) return;
      if (!canMoveToNext) {
        triggerValidationError();
        return;
      }
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, [currentStep, steps.length, canMoveToNext, triggerValidationError]);

    const handlePrevious = React.useCallback(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleSubmit = React.useCallback(() => {
      if (!canMoveToNext) {
        triggerValidationError();
        return;
      }
      onComplete?.(wizardData);
    }, [canMoveToNext, triggerValidationError, onComplete, wizardData]);

    useEffect(() => {
      const prevIndex = Math.max(0, currentStep - 1);
      onTabChange?.({
        prevIndex,
        nextIndex: currentStep,
        stepId: steps[currentStep]?.id,
      });
    }, [currentStep, onTabChange, steps]);

    useImperativeHandle(ref, () => ({
      nextTab: handleNext,
      prevTab: handlePrevious,
      reset: () => {
        setCurrentStep(safeStartIndex);
        setMaxVisitedStep(safeStartIndex);
      },
      activeAll: () => {
        setMaxVisitedStep(Math.max(0, steps.length - 1));
      },
      goToTab: (index: number) => navigateTo(index, true),
      goToTabById: (id: string) => {
        const index = steps.findIndex((step) => step.id === id);
        if (index !== -1) navigateTo(index, true);
      },
      setData: (nextData: WizardData) => {
        setWizardData(nextData);
        onDataChange?.(nextData);
      },
      getData: () => wizardData,
    }));

    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (!document.activeElement?.closest(".react-form-wizard")) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          handleNext();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          handlePrevious();
        }
        if (event.key === "Home") {
          event.preventDefault();
          navigateTo(0, true);
        }
        if (event.key === "End") {
          event.preventDefault();
          navigateTo(steps.length - 1, true);
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [steps.length, handleNext, handlePrevious, navigateTo]);

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const handleTouchStart = (event: React.TouchEvent) => {
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
    };
    const handleTouchEnd = (event: React.TouchEvent) => {
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const diffX = touchStartX.current - endX;
      const diffY = touchStartY.current - endY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) handleNext();
        else handlePrevious();
      }
    };

    const fillButtonStyle = {
      backgroundColor:
        prefersDarkMode && customDarkModeColor?.buttons
          ? customDarkModeColor.buttons
          : color,
      borderColor:
        prefersDarkMode && customDarkModeColor?.buttons
          ? customDarkModeColor.buttons
          : color,
      color:
        prefersDarkMode && customDarkModeColor?.buttonsText
          ? customDarkModeColor.buttonsText
          : "unset",
      borderRadius: "4px",
    };

    const isVertical = layout === "vertical" ? "vertical" : "horizontal";
    const isInline = inlineStep ? "inline" : "";
    const shouldShowProgressBar = inlineStep ? false : showProgressBar;
    const activeStep = steps[currentStep];

    return (
      <div
        className={`react-form-wizard ${stepSize} ${isVertical} ${isInline}`}
        role="region"
        aria-label="Form Wizard"
        aria-describedby="wizard-description"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="wizard-header">
          <div id="wizard-description" className="sr-only">
            Form wizard with {steps.length} steps. Currently on step {currentStep + 1}.
          </div>
          {typeof title === "string" ? (
            <>
              <h4
                className="wizard-title"
                style={
                  prefersDarkMode && customDarkModeColor.title
                    ? { color: customDarkModeColor.title }
                    : {}
                }
              >
                {title}
              </h4>
              <p
                className="category"
                style={
                  prefersDarkMode && customDarkModeColor.subtitle
                    ? { color: customDarkModeColor.subtitle }
                    : {}
                }
              >
                {subtitle}
              </p>
            </>
          ) : (
            title
          )}
        </div>

        <div className="wizard-navigation">
          <ul
            className={`form-wizard-steps wizard-nav wizard-nav-pills ${shape} ${stepSize}`}
            style={{ borderColor: color }}
            role="tablist"
            aria-label="Form steps"
          >
            {steps.map((step, index) => (
              <WizardTab
                key={step.id}
                ref={wizardTabRef.current[index]}
                id={step.id}
                title={step.title}
                icon={step.icon}
                shape={shape}
                color={color}
                isActive={index === currentStep}
                index={index}
                currentStep={currentStep}
                isVisible
                isDisabled={
                  disableBackOnClickStep
                    ? index !== currentStep
                    : index > maxVisitedStep
                }
                hasValidationError={Boolean(step.showErrorOnTab && !step.isValid)}
                layout={layout}
                showProgressBar={shouldShowProgressBar}
                inlineStep={inlineStep}
                darkColor={prefersDarkMode ? customDarkModeColor.tab : ""}
                darkIconColor={prefersDarkMode ? customDarkModeColor.tabIconColor : ""}
                removeBackgroundTab={removeBackgroundTab}
                removeBackgroundTabTransparentColor={removeBackgroundTabTransparentColor}
                showErrorOnTab={step.showErrorOnTab}
                showErrorOnTabColor={step.showErrorOnTabColor}
                onClick={() => navigateTo(index)}
              />
            ))}
          </ul>

          <div
            className="wizard-tab-content"
            role="tabpanel"
            aria-labelledby={steps[currentStep]?.id ?? `step-${currentStep}`}
            id={`${steps[currentStep]?.id ?? `step-${currentStep}`}-panel`}
          >
            {activeStep?.content}
          </div>
        </div>

        <div className="wizard-card-footer clearfix">
          {currentStep > 0 &&
            (backButtonTemplate ? (
              backButtonTemplate(handlePrevious)
            ) : (
              <div className="wizard-footer-left" style={fillButtonStyle}>
                <WizardButton
                  darkTextColor={prefersDarkMode ? customDarkModeColor?.buttonsText : ""}
                  darkButtonColor={prefersDarkMode ? customDarkModeColor?.buttons : ""}
                  onClick={handlePrevious}
                >
                  {backButtonText}
                </WizardButton>
              </div>
            ))}

          {currentStep < steps.length - 1 &&
            (nextButtonTemplate ? (
              nextButtonTemplate(handleNext)
            ) : (
              <div className="wizard-footer-right" style={fillButtonStyle}>
                <WizardButton
                  darkTextColor={prefersDarkMode ? customDarkModeColor?.buttonsText : ""}
                  darkButtonColor={prefersDarkMode ? customDarkModeColor?.buttons : ""}
                  onClick={handleNext}
                >
                  {nextButtonText}
                </WizardButton>
              </div>
            ))}

          {currentStep === steps.length - 1 &&
            (finishButtonTemplate ? (
              finishButtonTemplate(handleSubmit)
            ) : (
              <div className="wizard-footer-right" style={fillButtonStyle}>
                <WizardButton
                  darkTextColor={
                    prefersDarkMode ? customDarkModeColor?.finishButtonText : ""
                  }
                  darkButtonColor={prefersDarkMode ? customDarkModeColor?.finishButton : ""}
                  onClick={handleSubmit}
                >
                  {finishButtonText}
                </WizardButton>
              </div>
            ))}
        </div>
      </div>
    );
  }
);

const MemoizedFormWizard = React.memo(BaseFormWizard);

const TabContent: React.FC<TabContentProps> = ({ children, isValid = true }) => (
  <>{isValid && children}</>
);

const FormWizard = Object.assign(MemoizedFormWizard, { TabContent });

export default FormWizard;
export { TabContent };
