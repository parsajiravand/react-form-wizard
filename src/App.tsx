import React from "react";
import FormWizard from "react-form-wizard-component"
import "react-form-wizard-component/dist/style.css";

import "./App.css";

export default function validateTab() {
  const [firstTabInput, setFirstTabInput] = React.useState("test");
  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
  };
  // check validate tab
  const checkValidateTab = () => {
    console.log(firstTabInput);
    if (firstTabInput === "") {
      return false;
    }
    return true;
  };
  // error messages
  const errorMessages = () => {
    // you can add alert or console.log or any thing you want
    alert("Please fill in the required field");
  };
  // check validate tab
  const checkValidateTab2 = () => {
    console.log(firstTabInput);
    if (firstTabInput === "") {
      return false;
    }
    return true;
  };
  // error messages
  const errorMessages2 = () => {
    // you can add alert or console.log or any thing you want
    console.log("test");
  };

  return (
    <>
      <FormWizard
        inlineStep={false}
        layout="horizontal"
        title="Form Wizard"
        subtitle="Step by step form wizard"
        darkMode={false}
        customDarkModeColor={{
          title: "white",
          subtitle: "white",
          border: "white",
          tab: "white",
          tabIconColor: "blue",
          buttons: "white",
          buttonsText: "blue",
          finishButton: "green",
        }}
        onComplete={handleComplete}
      >
        <FormWizard.TabContent
          title="Personal details"
          showErrorOnTab={!checkValidateTab()}
          showErrorOnTabColor="red"
        >
          <h3>First Tab</h3>
          <p>Some content for the first tab</p>
          <label>
            Required Field
            <span
              style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}
            >
              *
            </span>
          </label>
          <br />
          <input
            className="form-control"
            type="text"
            value={firstTabInput}
            onChange={(e) => setFirstTabInput(e.target.value)}
          />
        </FormWizard.TabContent>
        {/* Tabs should be validated */}
        <FormWizard.TabContent
          title="Additional Info"
          icon="ti-settings"
          isValid={checkValidateTab()}
          validationError={errorMessages}
        >
          <h3>Second Tab</h3>
          <p>Some content for the second tab</p>
        </FormWizard.TabContent>
        <FormWizard.TabContent
          title="Last step"
          icon="ti-check"
          isValid={checkValidateTab2()}
          validationError={errorMessages2}
        >
          <h3>Last Tab</h3>
          <p>Some content for the last tab</p>
        </FormWizard.TabContent>
      </FormWizard>
      {/* add style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
        .form-control {
            height: 36px;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            color: #495057;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
        }

      `}</style>
    </>
  );
}
