# React Form Wizard Component

<br>
<p align="center">
  <a href="http://react-form-wizard-component-document.netlify.com"><img src="https://react-form-wizard-component-document.netlify.app/img/react-form-wizard-icon.png" alt="Demo" width="160"></a>
  <p align="center">
A react form wizard component with validation and progress bar with no external dependencies which simplifies tab wizard management.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-form-wizard-component">
    <img src="https://img.shields.io/npm/v/react-form-wizard-component.svg?style=flat-square" alt="version">
  </a>
  <a href="https://github.com/parsajiravand/react-form-wizard-component/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/react-form-wizard-component.svg?style=flat-square" alt="MIT license">
  </a>
  <a href="http://npmcharts.com/compare/react-form-wizard-component">
    <img src="https://img.shields.io/npm/dm/react-form-wizard-component.svg?style=flat-square" alt="downloads">
  </a>
  <a href="https://github.com/parsajiravand/react-form-wizard-component/blob/master/package.json">
    <img src="https://img.shields.io/badge/dependencies-none-lightgrey.svg?style=flat-square" alt="no dependencies">
  </a>

</p>

<p align="center">
  <br>
  <strong>
  <a style="font-size:20px" href="https://react-form-wizard-component-document.netlify.app"> 📚Document</a> ・
  <a style="font-size:20px" href="https://react-form-wizard-component-document.netlify.app/docs/category/demos">🔎 Demos</a> ・
  <a style="font-size:20px" href="https://react-form-wizard-component-document.netlify.app/docs/Playground/"> 🔬 Playground</a> . 
  </strong>
    <a style="font-size:20px" href="https://react-form-wizard-component-document.netlify.app/blog"> 📝 Blog</a>
  </strong>
</p>

## Installation

To install the package, you can use npm or yarn:

```bash
npm install react-form-wizard-component
```

or

```bash
yarn add react-form-wizard-component
```

## Usage

Import the `FormWizard` component and use it in your React application:

```tsx
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";

function App() {
  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
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
    <>
      <FormWizard
        shape="circle"
        color="#e74c3c"
        onComplete={handleComplete}
        onTabChange={tabChanged}
      >
        <FormWizard.TabContent title="Personal details" icon="ti-user">
          {/* Add your form inputs and components for the frst step */}
          <h1>First Tab</h1>
          <p>Some content for the first tab</p>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Additional Info" icon="ti-settings">
          <h1>Second Tab</h1>
          <p>Some content for the second tab</p>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Last step" icon="ti-check">
          <h1>Last Tab</h1>
          <p>Some content for the last tab</p>
        </FormWizard.TabContent>
      </FormWizard>
      {/* add style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
      `}</style>
    </>
  );
}

export default App;
```

## Props

The `FormWizard` component accepts the following props:

- `title` (optional): The title of the form wizard. It can be a string or a ReactNode.
- `subtitle` (optional): The subtitle or description of the form wizard.
- `shape` (optional): The shape of the wizard tabs (e.g., "circle", "square").
- `color` (optional): The color of the wizard tabs and progress bar.
- `children` (required): The content of the form wizard, including the form tabs and their content.
- `nextButtonText` (optional): The text for the "Next" button.
- `backButtonText` (optional): The text for the "Back" button.
- `finishButtonText` (optional): The text for the "Finish" button.
- `stepSize` (optional): The size of the steps (e.g., "xs", "sm", "md", "lg").
- `layout` (optional): The layout of the form wizard (e.g., "horizontal", "vertical").
- `onComplete` (optional): A callback function to be called when the form wizard is completed.
- `onTabChange` (optional): A callback function to be called when the active tab is changed.

The `FormWizard.TabContent` component is used to define each tab's content and accepts the following props:

- `title` (required): The title of the tab.
- `icon` (required): The icon for the tab.
- `children` (required): The content of the tab.
- `isValid` (optional): A boolean value indicating whether the tab is valid or not.
- `validationError` (optional): The validation error message to be displayed when the tab is not valid.

Refer to the component's source code or documentation for additional props and details.

## Examples

You can find examples of using the `react-form-wizard-component` in the [examples](https://react-form-wizard-component-document.netlify.app/docs/category/demos) directory.

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

Please note that this is a basic README.md template, and you may need to modify it further to match your specific package and requirements.
