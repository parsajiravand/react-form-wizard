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
  const handelReset = () => {
    console.log("reset");
    formWizardRef.current?.reset();
  };
  const handelActiveAll = () => {
    console.log("activeAll");
    formWizardRef.current?.activeAll();
  };
  const handelChangeTab = () => {
    console.log("changeTab");
    formWizardRef.current?.goToTab(2);
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
      <h1>React Form Wizard Example With Custom Ref</h1>
      <button onClick={handelNext}>nextTab</button>
      <button onClick={handelPrev}>prevTab</button>
      <button onClick={handelReset}>reset</button>
      <button onClick={handelActiveAll}>activeAll</button>
      <button onClick={handelChangeTab}>changeTab</button>

      <FormWizard
        ref={formWizardRef}
        shape="square"
        color="#2196f3"
        onComplete={handleComplete}
        onTabChange={tabChanged}
      >
        <FormWizard.TabContent
          title="Personal details"
          icon="ti-user"
          isValid={true}
        >
          <h1>test</h1>
        </FormWizard.TabContent>
        <FormWizard.TabContent
          title="Additional Info"
          icon="ti-settings"
          isValid={false}
          validationError={() => alert("validationError because isValid false")}
        >
          {/* Add your form inputs and components for the second step */}
          <h1>test 2222</h1>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Last step" icon="ti-check">
          {/* Add your form inputs and components for the last step */}
          <h1>test 3333</h1>

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
