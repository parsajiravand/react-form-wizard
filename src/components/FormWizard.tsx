import React, { useState, ReactNode } from "react";
import WizardTab from "./WizardTab";
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
      const isActive = index === currentStep;

     return WizardTab({ title, icon, route, shape, color, isActive, index });
    });
  };

  const renderContent = () => {
    return steps[currentStep];
  };

  return (
    <div>
      <ul
        className={`form-wizard-steps ${shape}`}
        style={{ borderColor: color }}
      >
        {renderTabs()}
      </ul>
      <div className="form-wizard-content">
        {renderContent()}
        <div className="form-wizard-buttons">
          {currentStep > 0 && (
            <button onClick={handlePrevious}>Previous</button>
          )}
          {currentStep < steps.length - 1 && (
            <button onClick={handleNext}>Next</button>
          )}
          {currentStep === steps.length - 1 && (
            <button onClick={handleSubmit}>Submit</button>
          )}
        </div>
      </div>

      <style>{`
        /* Custom styles */
        .form-wizard-steps {
          list-style-type: none;
          display: flex;
          justify-content: center;
          padding: 0;
          margin: 0;
        }

        .form-wizard-steps li {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .form-wizard-steps li a {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .wizard-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
        }

        .wizard-icon-circle.square_shape {
          border-radius: 4px;
        }

        .wizard-icon-container {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .wizard-icon {
          color: #fff;
          font-size: 16px;
        }

        .stepTitle {
          font-size: 14px;
        }

        .form-wizard-buttons {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .form-wizard-buttons button {
          margin-left: 10px;
        }

        /* Add more custom styles as needed */
      `}</style>
    </div>
  );
};

FormWizard.TabContent = ({ children }) => {
  return <>{children}</>;
};

export default FormWizard;
