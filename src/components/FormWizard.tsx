import React, {
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import WizardTab from "./WizardTab.js";
import WizardButton from "./WizardButton.js";
import { useWizardCursor, useWizardData } from "../hooks/useWizard.js";
import "../index.css";
import {
  FormWizardMethods,
  FormWizardProps,
  TabContentProps,
  WizardClassNames,
  WizardConditionContext,
  WizardData,
  WizardStepSchema,
  WizardTabRef,
  WizardTheme,
} from "../types/FormWizard.js";

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
    showErrorOnTab: step.showErrorOnTab,
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
  const isValid =
    validateResult === undefined ? fallbackValid : validateResult === true;

  return {
    id: child.props.id ?? createFallbackStepId(index),
    title: child.props.title ?? `Step ${index + 1}`,
    icon: child.props.icon,
    content: child.props.children,
    showErrorOnTab: child.props.showErrorOnTab,
    showErrorOnTabColor: child.props.showErrorOnTabColor ?? "red",
    validationError:
      child.props.validationError ??
      (typeof validateResult === "string" ? () => validateResult : undefined),
    isValid,
  };
};

/** Map theme tokens onto the CSS custom properties the stylesheet reads. */
const themeToCssVars = (theme?: WizardTheme): React.CSSProperties => {
  if (!theme) return {};
  const pairs: Array<[keyof WizardTheme, string]> = [
    ["primaryColor", "--rfw-primary"],
    ["backgroundColor", "--rfw-bg"],
    ["textColor", "--rfw-text"],
    ["titleColor", "--rfw-title"],
    ["subtitleColor", "--rfw-subtitle"],
    ["tabColor", "--rfw-tab"],
    ["tabIconColor", "--rfw-tab-icon"],
    ["borderColor", "--rfw-border"],
    ["buttonColor", "--rfw-button"],
    ["buttonTextColor", "--rfw-button-text"],
    ["finishButtonColor", "--rfw-finish-button"],
    ["finishButtonTextColor", "--rfw-finish-button-text"],
    ["errorColor", "--rfw-error"],
    ["borderRadius", "--rfw-radius"],
  ];

  const style: Record<string, string> = {};
  for (const [key, cssVar] of pairs) {
    const value = theme[key];
    if (value) style[cssVar] = value;
  }
  return style as React.CSSProperties;
};

const BaseFormWizard = React.forwardRef<FormWizardMethods, FormWizardProps>(
  (
    {
      title,
      subtitle = "",
      shape = "",
      color,
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
      variant = "modern",
      colorScheme = "auto",
      theme,
      unstyled = false,
      classNames,
      persist,
      syncToUrl,
      announceStepChanges = true,
      keyboardNavigation = true,
      swipeNavigation = true,
      style,
      ariaLabel = "Form Wizard",
    },
    ref
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    /* ---------------- data ---------------- */
    const { data: wizardData, setData, updateData, clearPersisted } = useWizardData({
      initialData: schema?.initialData,
      data,
      onDataChange,
      persist,
    });

    /* ---------------- steps ---------------- */
    // Steps are derived from data (conditions and validators read it), which is
    // why data is resolved before the cursor is sized.
    const baseContext = useMemo(
      () => ({ data: wizardData, currentStep: 0, stepIndex: 0 }),
      [wizardData]
    );

    const schemaSteps = useMemo(() => {
      if (!schema) return [];
      return schema.steps
        .map((step, index) =>
          normalizeSchemaStep(step, index, { ...baseContext, stepIndex: index })
        )
        .filter((step): step is NormalizedStep => step !== null);
    }, [schema, baseContext]);

    const childrenSteps = useMemo(() => {
      if (!children) return [];
      const childArray = React.Children.toArray(
        children
      ) as React.ReactElement<TabContentProps>[];

      return childArray
        .map((child, index) =>
          normalizeChildrenStep(child, index, { ...baseContext, stepIndex: index })
        )
        .filter((step): step is NormalizedStep => step !== null);
    }, [children, baseContext]);

    // Compatibility layer: schema API takes precedence if provided.
    const steps = schema ? schemaSteps : childrenSteps;

    const stepIds = useMemo(() => steps.map((step) => step.id), [steps]);

    /* ---------------- cursor ---------------- */
    const cursor = useWizardCursor({
      stepIds,
      startIndex,
      onStepChange: onTabChange,
      syncToUrl,
    });
    const { currentStep, maxVisitedStep } = cursor;

    const activeStep = steps[currentStep];
    const canMoveToNext = activeStep ? activeStep.isValid : false;

    // A step is only marked invalid once the user has actually tried to leave
    // it. Without this a wizard whose first step has a validator renders in
    // the error colour on first paint, accusing the user before they have
    // typed anything.
    const [attemptedSteps, setAttemptedSteps] = useState<ReadonlySet<string>>(
      () => new Set()
    );
    const markAttempted = useCallback((id?: string) => {
      if (!id) return;
      setAttemptedSteps((prev) =>
        prev.has(id) ? prev : new Set(prev).add(id)
      );
    }, []);

    const triggerValidationError = useCallback(() => {
      const step = steps[currentStep];
      if (typeof step?.validationError === "function") {
        step.validationError();
      }
    }, [steps, currentStep]);

    /* ---------------- navigation ---------------- */
    const navigateTo = useCallback(
      (index: number, force = false) => {
        if (index < 0 || index >= steps.length) return;
        if (!force && disableBackOnClickStep && index > currentStep) return;
        if (!force && index > maxVisitedStep) return;
        cursor.goTo(index);
      },
      [steps.length, disableBackOnClickStep, currentStep, maxVisitedStep, cursor]
    );

    const handleNext = useCallback(() => {
      if (currentStep >= steps.length - 1) return;
      if (!canMoveToNext) {
        markAttempted(activeStep?.id);
        triggerValidationError();
        return;
      }
      cursor.next();
    }, [currentStep, steps.length, canMoveToNext, triggerValidationError, cursor, markAttempted, activeStep]);

    const handlePrevious = useCallback(() => {
      cursor.previous();
    }, [cursor]);

    const handleSubmit = useCallback(() => {
      if (!canMoveToNext) {
        markAttempted(activeStep?.id);
        triggerValidationError();
        return;
      }
      onComplete?.(wizardData);
    }, [canMoveToNext, triggerValidationError, onComplete, wizardData, markAttempted, activeStep]);

    /* ---------------- tab checked sync ---------------- */
    const tabRefs = useRef<Array<WizardTabRef | null>>([]);
    const registerTab = useCallback(
      (index: number) => (instance: WizardTabRef | null) => {
        tabRefs.current[index] = instance;
      },
      []
    );

    useEffect(() => {
      tabRefs.current.length = steps.length;
      tabRefs.current.forEach((tab, index) => {
        tab?.setChecked(index <= maxVisitedStep);
      });
    }, [maxVisitedStep, steps.length]);

    /* ---------------- imperative API ---------------- */
    useImperativeHandle(
      ref,
      () => ({
        nextTab: handleNext,
        prevTab: handlePrevious,
        reset: () => {
          cursor.reset();
          clearPersisted();
        },
        activeAll: cursor.activateAll,
        goToTab: (index: number) => navigateTo(index, true),
        goToTabById: (id: string) => cursor.goToId(id),
        setData,
        getData: () => wizardData,
        updateData,
        getCurrentStep: () => currentStep,
      }),
      [
        handleNext,
        handlePrevious,
        cursor,
        clearPersisted,
        navigateTo,
        setData,
        wizardData,
        updateData,
        currentStep,
      ]
    );

    /* ---------------- keyboard navigation ---------------- */
    useEffect(() => {
      if (!keyboardNavigation || typeof document === "undefined") return;

      const onKeyDown = (event: KeyboardEvent) => {
        const root = rootRef.current;
        const active = document.activeElement;
        // Only the wizard actually containing focus reacts, so several
        // wizards on one page never fight over the arrow keys.
        if (!root || !active || !root.contains(active)) return;

        switch (event.key) {
          case "ArrowRight":
            event.preventDefault();
            handleNext();
            break;
          case "ArrowLeft":
            event.preventDefault();
            handlePrevious();
            break;
          case "Home":
            event.preventDefault();
            navigateTo(0, true);
            break;
          case "End":
            event.preventDefault();
            navigateTo(steps.length - 1, true);
            break;
          default:
            break;
        }
      };

      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [keyboardNavigation, steps.length, handleNext, handlePrevious, navigateTo]);

    /* ---------------- focus management ---------------- */
    // Move focus to the freshly revealed panel so keyboard and screen-reader
    // users land on the new content instead of staying on a button that may
    // have just been replaced. Skipped on first paint.
    const hasRendered = useRef(false);
    useEffect(() => {
      if (!announceStepChanges) return;
      if (!hasRendered.current) {
        hasRendered.current = true;
        return;
      }
      panelRef.current?.focus?.();
    }, [currentStep, announceStepChanges]);

    /* ---------------- touch ---------------- */
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const handleTouchStart = (event: React.TouchEvent) => {
      if (!swipeNavigation) return;
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    };

    const handleTouchEnd = (event: React.TouchEvent) => {
      if (!swipeNavigation) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const diffX = touchStartX.current - touch.clientX;
      const diffY = touchStartY.current - touch.clientY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) handleNext();
        else handlePrevious();
      }
    };

    /* ---------------- styling ---------------- */
    const cx = useCallback(
      (base: string, key: keyof WizardClassNames) => {
        const override = classNames?.[key];
        if (unstyled) return override ?? "";
        return [base, override].filter(Boolean).join(" ");
      },
      [classNames, unstyled]
    );

    const rootStyle: React.CSSProperties = {
      ...themeToCssVars(theme),
      ...style,
    };

    // Falls back to the CSS custom property rather than a literal, so the
    // `theme` prop can recolour the wizard. An explicit `color` still wins.
    const accent = color ?? "var(--rfw-primary, #2196f3)";

    const isLegacy = variant === "legacy";

    // Only the legacy skin paints the footer wrappers inline; the modern one
    // lets the button own its colour so hover and focus states work.
    const fillButtonStyle: React.CSSProperties = unstyled || !isLegacy
      ? {}
      : {
          backgroundColor:
            darkMode && customDarkModeColor?.buttons
              ? customDarkModeColor.buttons
              : accent,
          borderColor:
            darkMode && customDarkModeColor?.buttons
              ? customDarkModeColor.buttons
              : accent,
          color:
            darkMode && customDarkModeColor?.buttonsText
              ? customDarkModeColor.buttonsText
              : "unset",
          borderRadius: "4px",
        };

    const isVertical = layout === "vertical" ? "vertical" : "horizontal";
    const isInline = inlineStep ? "inline" : "";
    const shouldShowProgressBar = inlineStep ? false : showProgressBar;
    const panelId = `${activeStep?.id ?? `step-${currentStep}`}-panel`;

    const rootClass = unstyled
      ? classNames?.root ?? ""
      : [
          "react-form-wizard",
          variant === "legacy" ? "rfw-legacy" : null,
          // The stylesheet follows the OS and the host's own dark-mode switch;
          // these only pin it when the caller asks.
          colorScheme === "dark" || darkMode ? "rfw-dark" : null,
          colorScheme === "light" ? "rfw-light" : null,
          stepSize,
          isVertical,
          isInline,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ");

    return (
      <div
        ref={rootRef}
        className={rootClass}
        style={rootStyle}
        role="region"
        aria-label={ariaLabel}
        aria-describedby="wizard-description"
        data-rfw-root=""
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={cx("wizard-header", "header")}>
          <div id="wizard-description" className="sr-only rfw-sr-only">
            Form wizard with {steps.length} steps. Currently on step{" "}
            {currentStep + 1}.
          </div>
          {typeof title === "string" ? (
            <>
              <h4
                className={cx("wizard-title", "title")}
                style={
                  darkMode && customDarkModeColor.title
                    ? { color: customDarkModeColor.title }
                    : {}
                }
              >
                {title}
              </h4>
              <p
                className={cx("category", "subtitle")}
                style={
                  darkMode && customDarkModeColor.subtitle
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

        {/* Announce transitions to assistive tech without moving anything visually. */}
        {announceStepChanges && (
          <div className="sr-only rfw-sr-only" role="status" aria-live="polite">
            {activeStep
              ? `Step ${currentStep + 1} of ${steps.length}: ${activeStep.title}`
              : ""}
          </div>
        )}

        <div className={cx("wizard-navigation", "navigation")}>
          <ul
            className={
              unstyled
                ? classNames?.stepList ?? ""
                : [
                    "form-wizard-steps wizard-nav wizard-nav-pills",
                    shape,
                    stepSize,
                    classNames?.stepList,
                  ]
                    .filter(Boolean)
                    .join(" ")
            }
            style={unstyled || !isLegacy ? undefined : { borderColor: accent }}
            role="tablist"
            aria-label="Form steps"
          >
            {steps.map((step, index) => (
              <WizardTab
                key={step.id}
                ref={registerTab(index)}
                id={step.id}
                title={step.title}
                icon={step.icon}
                shape={shape}
                color={accent}
                isActive={index === currentStep}
                index={index}
                currentStep={currentStep}
                isVisible
                isDisabled={
                  disableBackOnClickStep
                    ? index !== currentStep
                    : index > maxVisitedStep
                }
                hasValidationError={
                  step.showErrorOnTab ??
                  (attemptedSteps.has(step.id) && !step.isValid)
                }
                layout={layout}
                showProgressBar={shouldShowProgressBar}
                inlineStep={inlineStep}
                darkColor={darkMode ? customDarkModeColor.tab : ""}
                darkIconColor={darkMode ? customDarkModeColor.tabIconColor : ""}
                removeBackgroundTab={removeBackgroundTab}
                removeBackgroundTabTransparentColor={
                  removeBackgroundTabTransparentColor
                }
                showErrorOnTab={
                  step.showErrorOnTab ??
                  (attemptedSteps.has(step.id) && !step.isValid)
                }
                showErrorOnTabColor={step.showErrorOnTabColor}
                unstyled={unstyled}
                variant={variant}
                isComplete={index < currentStep && index <= maxVisitedStep}
                classNames={classNames}
                onClick={() => navigateTo(index)}
              />
            ))}
          </ul>

          <div
            ref={panelRef}
            className={cx("wizard-tab-content", "content")}
            role="tabpanel"
            aria-labelledby={activeStep?.id ?? `step-${currentStep}`}
            id={panelId}
            tabIndex={-1}
          >
            {activeStep?.content}
          </div>
        </div>

        <div
          className={
            unstyled
              ? classNames?.footer ?? ""
              : ["wizard-card-footer clearfix", classNames?.footer]
                  .filter(Boolean)
                  .join(" ")
          }
        >
          {currentStep > 0 &&
            (backButtonTemplate ? (
              backButtonTemplate(handlePrevious)
            ) : (
              <div
                className={unstyled ? "" : "wizard-footer-left"}
                style={fillButtonStyle}
              >
                <WizardButton
                  className={classNames?.backButton}
                  unstyled={unstyled}
                  darkTextColor={darkMode ? customDarkModeColor?.buttonsText : ""}
                  darkButtonColor={darkMode ? customDarkModeColor?.buttons : ""}
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
              <div
                className={unstyled ? "" : "wizard-footer-right"}
                style={fillButtonStyle}
              >
                <WizardButton
                  className={classNames?.nextButton}
                  unstyled={unstyled}
                  darkTextColor={darkMode ? customDarkModeColor?.buttonsText : ""}
                  darkButtonColor={darkMode ? customDarkModeColor?.buttons : ""}
                  onClick={handleNext}
                >
                  {nextButtonText}
                </WizardButton>
              </div>
            ))}

          {steps.length > 0 &&
            currentStep === steps.length - 1 &&
            (finishButtonTemplate ? (
              finishButtonTemplate(handleSubmit)
            ) : (
              <div
                className={unstyled ? "" : "wizard-footer-right"}
                style={fillButtonStyle}
              >
                <WizardButton
                  className={classNames?.finishButton}
                  unstyled={unstyled}
                  darkTextColor={
                    darkMode ? customDarkModeColor?.finishButtonText : ""
                  }
                  darkButtonColor={
                    darkMode ? customDarkModeColor?.finishButton : ""
                  }
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

BaseFormWizard.displayName = "FormWizard";

const MemoizedFormWizard = React.memo(BaseFormWizard);

const TabContent: React.FC<TabContentProps> = ({ children, isValid = true }) => (
  <>{isValid && children}</>
);
TabContent.displayName = "FormWizard.TabContent";

const FormWizard = Object.assign(MemoizedFormWizard, { TabContent });

export default FormWizard;
export { TabContent };
export type { WizardData };
