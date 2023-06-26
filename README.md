# React Form Wizard Component

A react form wizard component with validation and progress bar with no external dependencies which simplifies tab wizard management.

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
import React from "react";
import FormWizard from "react-form-wizard-component";

// Example usage
const MyForm = () => {
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
  );
};

export default MyForm;
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

Refer to the component's source code or documentation for additional props and details.

## Examples

You can find examples of using the `react-form-wizard-component` in the [examples](./examples) directory.

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

Please note that this is a basic README.md template, and you may need to modify it further to match your specific package and requirements.

Certainly! Here's an updated version of the README.md file with an example usage section:

````markdown
# React Form Wizard Component

A react form wizard component with validation and progress bar with no external dependencies which simplifies tab wizard management.

## Installation

To install the package, you can use npm or yarn:

```bash
npm install react-form-wizard-component
```
````

or

```bash
yarn add react-form-wizard-component
```

## Usage

Import the `FormWizard` component and its child components in your React application:

```jsx
import React from "react";
import FormWizard from "react-form-wizard-component";

// Example usage
const MyForm = () => {
  const handleComplete = () => {
    // Handle form completion
  };

  const tabChanged = (e) => {
    // Handle tab change
  };

  return (
    <FormWizard
      shape="circle"
      color="#e74c3c"
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
    </FormWizard>
  );
};

export default MyForm;
```

## Props

The `FormWizard` component accepts various props for customization:

- `shape` (optional): The shape of the wizard tabs (e.g., "circle", "square").
- `color` (optional): The color of the wizard tabs and progress bar.
- `onComplete` (optional): A callback function to be called when the form wizard is completed.
- `onTabChange` (optional): A callback function to be called when the active tab is changed.

## Examples

You can find examples of using the `react-form-wizard-component` in the [examples](./examples) directory.

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

```

Please note that you may need to adjust the example code and modify the README.md further to suit your specific package and use case.
```
