import React from "react";

import FormWizard from "./components/FormWizard";
import { FormWizardMethods, FormWizardProps } from "./types/FormWizard";

const App: React.FC = () => {
  const formWizardRef = React.createRef<FormWizardProps & FormWizardMethods>();
  console.log("formWizardRef", formWizardRef);
  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
  };
  const handelNext = () => {
    console.log("nextTab");
    formWizardRef.current?.nextTab();
  };
  const handelPrev = () => {
    console.log("prevTab");
    formWizardRef.current?.prevTab();
  };

  // const title = () => {
  //   return <h1>test2 </h1>;
  // };
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
      <button onClick={handelNext}>nextTab</button>
      <button onClick={handelPrev}>prevTab</button>
      <FormWizard
        ref={formWizardRef as unknown as FormWizardProps["ref"]}
        shape="square"
        color="#2196f3"
        onComplete={handleComplete}
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
      {/* add style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
      `}</style>
    </div>
  );
};

export default App;
