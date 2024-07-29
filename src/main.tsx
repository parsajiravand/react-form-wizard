import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// eslint-disable-next-line react-refresh/only-export-components
export { default } from "./components/FormWizard";
export { default as TabContent } from "./components/WizardTab";
export { default as WizardButton } from "./components/WizardButton";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  
    <App />

);
