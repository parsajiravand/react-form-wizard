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

## ⚠️ Migration Guide: v1.0.0

**This is a major version update** with breaking changes. Please read the migration notes below.

### What's New in v1.0.0
- ✅ **Schema-first API** - New declarative wizard configuration
- ✅ **Enhanced TypeScript** - Strict typing and better DX
- ✅ **Accessibility** - Full WCAG 2.1 AA compliance
- ✅ **Performance** - React.memo optimizations and reduced re-renders
- ✅ **Mobile Support** - Touch gestures and responsive design

### Breaking Changes
- **API Changes**: Some prop names adjusted for clarity
- **Type Changes**: Stricter TypeScript contracts
- **Callback Changes**: `onComplete` now receives optional data payload
- **Export Changes**: New types and helpers exported from main entry

### Quick Migration
```bash
# Update to v1.0.0
npm install react-form-wizard-component@latest

# Check migration notes below for API changes
# Most existing code will work with minor adjustments
```

---



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

<!-- React 19 is fully supported -->



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

## Schema API (new)

Use the new schema-first mode when you want conditional visibility, step-level validation, and data-driven flows.

```tsx
import FormWizard, {
  FormWizardSchema,
  WizardData,
} from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";

const schema: FormWizardSchema = {
  initialData: { plan: "basic" },
  steps: [
    {
      id: "intro",
      title: "Intro",
      content: <div>Welcome to onboarding</div>,
    },
    {
      id: "premium",
      title: "Premium features",
      condition: ({ data }) => data.plan === "premium",
      content: <div>Premium content</div>,
    },
    {
      id: "review",
      title: "Review",
      validate: ({ data }) =>
        data.plan ? true : "Plan is required before submit",
      content: <div>Review your setup</div>,
    },
  ],
};

function SchemaWizard() {
  const handleComplete = (data?: WizardData) => {
    console.log("completed with data", data);
  };

  return <FormWizard title="Schema Wizard" schema={schema} onComplete={handleComplete} />;
}
```

## Children API (existing)

The existing children-based API remains supported for backward compatibility.

```tsx
import FormWizard, { TabContent } from "react-form-wizard-component";

function LegacyWizard() {
  return (
    <FormWizard title="Legacy Wizard">
      <TabContent title="First">First content</TabContent>
      <TabContent title="Second" isValid={true}>
        Second content
      </TabContent>
    </FormWizard>
  );
}
```

## Migration Notes (v1.0.0 Breaking Changes)

### 🔄 API Changes
- **`onComplete` callback signature**: Now receives optional `WizardData`
  ```tsx
  // Before (v0.x)
  const handleComplete = () => { /* no data */ };

  // After (v1.0.0)
  const handleComplete = (data?: WizardData) => { /* wizard data available */ };
  ```

- **`onTabChange` callback signature**: Now includes optional `stepId`
  ```tsx
  // Before (v0.x)
  const handleTabChange = ({ prevIndex, nextIndex }) => {};

  // After (v1.0.0)
  const handleTabChange = ({ prevIndex, nextIndex, stepId }) => {};
  ```

### 📦 Export Changes
- **New exports available** from main package entry:
  - `FormWizardSchema` - Type for schema configuration
  - `WizardStepSchema` - Type for individual step schema
  - `WizardCondition` - Type for conditional step functions
  - `WizardValidation` - Type for validation functions
  - `FormWizardMethods` - Type for imperative API methods
  - `WizardData` - Type for wizard state data
  - `TabContent` - Component export (also available as `FormWizard.TabContent`)

### ⚙️ Behavior Changes
- **Schema precedence**: When both `schema` and `children` props are provided, `schema` takes precedence
- **Stricter validation**: Some previously optional props now have stricter TypeScript contracts
- **Accessibility improvements**: Keyboard navigation and ARIA attributes added (non-breaking)

### 🚀 New Features (Non-breaking)
- **Schema API**: Declarative wizard configuration with conditions and validation
- **Imperative API**: Programmatic wizard control via refs
- **Enhanced styling**: Dark mode, custom colors, responsive design
- **Better performance**: React.memo optimizations throughout

### ✅ Compatibility
- **Children API**: Still fully supported for existing users
- **Most existing code**: Will work with minimal or no changes
- **Gradual migration**: You can adopt new features incrementally

### 📋 Version Compatibility Matrix

| Feature | v0.x | v1.0.0 |
|---------|------|--------|
| Children API | ✅ | ✅ |
| Basic styling | ✅ | ✅ |
| Validation | ✅ | ✅ |
| **Schema API** | ❌ | ✅ |
| **Imperative API** | ❌ | ✅ |
| **Dark mode** | ❌ | ✅ |
| **Accessibility** | ❌ | ✅ |
| **Mobile/touch** | ❌ | ✅ |
| **TypeScript strict** | ❌ | ✅ |
| **Performance optimizations** | ❌ | ✅ |


## Examples

You can find examples of using the `react-form-wizard-component` in the [examples](https://react-form-wizard-component-document.netlify.app/docs/category/demos) directory.

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

Please note that this is a basic README.md template, and you may need to modify it further to match your specific package and requirements.
