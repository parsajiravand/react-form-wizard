import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// eslint-disable-next-line react-refresh/only-export-components
export { default } from "./components/FormWizard";
export { TabContent } from "./components/FormWizard";
export { default as WizardButton } from "./components/WizardButton";
export type {
  FormWizardProps,
  FormWizardMethods,
  FormWizardSchema,
  WizardStepSchema,
  WizardCondition,
  WizardValidation,
  WizardData,
  TabContentProps,
} from "./types/FormWizard";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  
    <App />

);
