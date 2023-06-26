import React from "react";
import FormWizard from "./components/FormWizard";
import "./App.css";
import "./index.css";

const App: React.FC = () => {
  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
  };
  const title = () => {
    return <h1>test2 </h1>;
  };
  const tabChanged = ({
    prevIndex,
    nextIndex,
  }: {
    prevIndex: number;
    nextIndex: number;
  }) => {
    console.log("prevIndex", prevIndex);
    console.log("nextIndex", nextIndex);
  };

  return (
    <div>
      <h1>React Form Wizard Example</h1>
      <FormWizard
        onComplete={handleComplete}
        shape="circle"
        color="#e74c3c"
        onTabChange={tabChanged}
      >
        <FormWizard.TabContent title="Personal details" icon="ti-user">
          <h1>test</h1>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Additional Info" icon="ti-settings">
          {/* Add your form inputs and components for the second step */}
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Last step" icon="ti-check">
          {/* Add your form inputs and components for the last step */}
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Last step" icon="ti-check">
          {/* Add your form inputs and components for the last step */}
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Last step" icon="ti-check">
          {/* Add your form inputs and components for the last step */}
        </FormWizard.TabContent>
      </FormWizard>
    </div>
  );
};

export default App;
