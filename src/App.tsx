import React from "react";

import FormWizard from "./components/FormWizard";
const App: React.FC = () => {
  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
  };

  const backTemplate = (handlePrevious: () => void) => {
    return (
      <button className="base-button" onClick={handlePrevious}>
        back
      </button>
    );
  };

  return (
    <div>
      <h1>React Form Wizard Example Footer Buttons</h1>

      <FormWizard
        shape="circle"
        color="#2196f3"
        onComplete={handleComplete}
        backButtonTemplate={backTemplate}
        nextButtonTemplate={(handleNext) => (
          <button className="base-button" onClick={handleNext}>
            next
          </button>
        )}
        finishButtonTemplate={(handleComplete) => (
          <button className="finish-button" onClick={handleComplete}>
            finish
          </button>
        )}
      >
        <FormWizard.TabContent title="Personal details" icon="ti-user">
          <h3>First Tab</h3>
          <p>Some content for the first tab</p>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Additional Info" icon="ti-settings">
          <h3>Second Tab</h3>
          <p>Some content for the second tab</p>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Last step" icon="ti-check">
          <h3>Third Tab</h3>
          <p>Some content for the third tab</p>
        </FormWizard.TabContent>
      </FormWizard>
      {/* add style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
        .wizard-card-footer{
          display: flex;
          justify-content: center;
          margin-top: 50px;
        }
        .base-button {
          background-color: blue;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
          }
          
          .base-button:hover {
          background-color: navy;
          }
          
          .base-button:focus {
          outline: none;
          }
          
          .base-button:active {
          transform: translateY(2px);
          }

        .finish-button{
          background-color: green;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-left: 10px;
          border-radius: 50px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
        }
        .finish-button:hover {
          background-color: darkgreen;
          }
        
        .finish-button:focus {
          outline: none;
         }
          
        .finish-button:active {
          transform: translateY(2px);
         }

      `}</style>
    </div>
  );
};

export default App;
