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
  onComplete: () => void;
  shape?: string;
  color?: string;
  children: ReactNode;
}

const FormWizard: React.FC<FormWizardProps> & {
  TabContent: React.FC<TabContentProps>;
} = ({ onComplete, shape = "", color = "#e74c3c", children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = React.Children.toArray(
    children
  ) as React.ReactElement<TabContentProps>[];

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
            <WizardButton onClick={handlePrevious}>Previous</WizardButton>
          )}
          {currentStep < steps.length - 1 && (
            <WizardButton onClick={handleNext}>Next</WizardButton>
          )}
          {currentStep === steps.length - 1 && (
            <WizardButton onClick={handleSubmit}>Submit</WizardButton>
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
