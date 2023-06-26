import React, { useState, ReactNode } from "react";
import WizardTab from "./WizardTab";
import WizardButton from "./WizardButton";
interface TabContentProps {
  title: string;
  icon: string;
  route?: string;
  children: ReactNode;
}

interface FormWizardProps {
  title?: string | ReactNode;
  subtitle?: string;
  onComplete: () => void;
  shape?: string;
  color?: string;
  children: ReactNode;
  nextButtonText?: string;
  backButtonText?: string;
  finishButtonText?: string;
  onTabChange?: (e: object) => void;
}

const FormWizard: React.FC<FormWizardProps> & {
  TabContent: React.FC<TabContentProps>;
} = ({
  title,
  onComplete,
  shape = "",
  color = "#e74c3c",
  children,
  subtitle = "",
  nextButtonText = "Next",
  backButtonText = "Back",
  finishButtonText = "Finish",
  onTabChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = React.Children.toArray(
    children
  ) as React.ReactElement<TabContentProps>[];

  // emit tab change event prevIndex, nextIndex
  if (typeof onTabChange === "function") {
    onTabChange({
      prevIndex: currentStep as number,
      nextIndex: (currentStep + 1) as number,
    });
  }

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onComplete();
  };

  const renderTabs = () => {
    return steps.map((step, index) => {
      const { title, icon, route } = step.props;
      const isActive = index <= currentStep;

      return (
        <WizardTab
          key={index}
          title={title}
          icon={icon}
          route={route}
          shape="circle"
          color="#e74c3c"
          isActive={isActive}
          index={index}
          onClick={() => setCurrentStep(index)}
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

  return (
    <div className="vue-form-wizard">
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
          className={`form-wizard-steps  wizard-nav wizard-nav-pills ${shape}`}
          style={{ borderColor: color }}
        >
          {renderTabs()}
        </ul>
      </div>
      <div>
        <div className="wizard-tab-content">{renderContent()}</div>
        <div className="wizard-card-footer clearfix">
          {currentStep > 0 && (
            <WizardButton onClick={handlePrevious}>
              {backButtonText}
            </WizardButton>
          )}
          {currentStep < steps.length - 1 && (
            <WizardButton onClick={handleNext}>{nextButtonText}</WizardButton>
          )}
          {currentStep === steps.length - 1 && (
            <WizardButton onClick={handleSubmit}>
              {finishButtonText}
            </WizardButton>
          )}
        </div>
      </div>
    </div>
  );
};

FormWizard.TabContent = ({ children }) => {
  return <>{children}</>;
};

export default FormWizard;
