import React, { useState, ReactNode } from "react";
import WizardTab from "./WizardTab";
import WizardButton from "./WizardButton";
import "../index.css";

interface TabContentProps {
  title: string;
  icon: string;
  route?: string;
  children: ReactNode;
}

interface FormWizardProps {
  title?: string | ReactNode;
  subtitle?: string;
  shape?: string;
  color?: string;
  children: ReactNode;
  nextButtonText?: string;
  backButtonText?: string;
  finishButtonText?: string;
  stepSize?: "xs" | "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";

  startIndex?: number;
  onComplete?: () => void;
  onTabChange?: (e: { prevIndex: number; nextIndex: number }) => void;
}

const FormWizard: React.FC<FormWizardProps> & {
  TabContent: React.FC<TabContentProps>;
} = ({
  title,
  shape = "",
  color = "#e74c3c",
  children,
  subtitle = "",
  nextButtonText = "Next",
  backButtonText = "Back",
  finishButtonText = "Finish",
  stepSize = "md",
  layout = "horizontal",
  startIndex = 0,
  onComplete,
  onTabChange,
}) => {
  const steps = React.Children.toArray(
    children
  ) as React.ReactElement<TabContentProps>[];
  // startIndex should be greater than or equal to 0 or less than steps.length
  if(startIndex < 0 || startIndex > steps.length) {
    startIndex = 0
    console.error("startIndex should be greater than or equal to 0 or less than steps.length")
  }
  const [currentStep, setCurrentStep] = useState(startIndex);

  // emit tab change event prevIndex, nextIndex
  if (typeof onTabChange === "function") {
    onTabChange({
      prevIndex: currentStep as number,
      nextIndex: (currentStep + 1) as number,
    });
  }
  // add checked option if tab active or actived before
  const handelNavigate = (index: number) => {
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };
  // handeling startIndex prop
  // if (startIndex > 0 && startIndex < steps.length) {
  //   setCurrentStep(startIndex);
  // }

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (typeof onComplete === "function") onComplete();
  };

  const renderTabs = () => {
    return steps.map((step, index) => {
      const { title, icon } = step.props;
      const isActive = index <= currentStep;

      return (
        <WizardTab
          key={index}
          title={title}
          icon={icon}
          shape="circle"
          color="#e74c3c"
          isActive={isActive}
          index={index}
          onClick={() => handelNavigate(index)}
        />
      );
    });
  };

  const renderContent = () => {
    return steps[currentStep];
  };
  const progressBarStyle = {
    backgroundColor: color,
    width: `${((currentStep + 1) / steps.length) * 100}%`,
    color: color,
  };
  const fillButtonStyle = {
    backgroundColor: color,
    borderColor: color,
    borderRadius: "4px",
  };
  const isVertical = layout === "vertical" ? "vertical" : "horizontal";

  return (
    <div className={`vue-form-wizard ${stepSize} ${isVertical}`}>
      <div className="wizard-header">
        {/* if title is element render other wise render string props */}
        {typeof title === "string" ? (
          <>
            <h4 className="wizard-title">{title}</h4>
            <p className="category">{subtitle}</p>
          </>
        ) : (
          title
        )}
      </div>
      <div className="wizard-navigation">
        <div className="wizard-progress-with-circle">
          <div className="wizard-progress-bar" style={progressBarStyle}></div>
        </div>
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
          <div className="wizard-footer-left" style={fillButtonStyle}>
            <WizardButton onClick={handlePrevious}>
              {backButtonText}
            </WizardButton>
          </div>
        )}
        {currentStep < steps.length - 1 && (
          <div className="wizard-footer-right" style={fillButtonStyle}>
            <WizardButton onClick={handleNext}>{nextButtonText}</WizardButton>
          </div>
        )}
        {currentStep === steps.length - 1 && (
          <div className="wizard-footer-right" style={fillButtonStyle}>
            <WizardButton onClick={handleSubmit}>
              {finishButtonText}
            </WizardButton>
          </div>
        )}
      </div>
    </div>
  );
};

FormWizard.TabContent = ({ children }) => {
  return <>{children}</>;
};

export default FormWizard;
