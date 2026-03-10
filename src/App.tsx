import React from "react";
import FormWizard, { TabContent } from "./components/FormWizard";
import "./index.css";
import "./App.css";

export default function ValidateTab() {
  const [firstTabInput, setFirstTabInput] = React.useState("test");
  const [plan, setPlan] = React.useState<"basic" | "premium">("basic");
  const handleComplete = () => {
    console.log("Form completed!");
    // Handle form completion logic here
  };
  // check validate tab
  const checkValidateTab = () => {
    console.log(firstTabInput,'firstTabInput');
    if (firstTabInput === "") {
      return false;
    }
    return true;
  };
  // check validate tab
  const checkValidateTab2 = () => {
    console.log(firstTabInput , 'tab2');
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

  const schemaWizard = React.useMemo(
    () => ({
      initialData: {
        plan,
      },
      steps: [
        {
          id: "schema-intro",
          title: "Schema Intro",
          content: (
            <>
              <h3>Schema Step 1</h3>
              <p>This wizard section is driven by a schema object.</p>
            </>
          ),
        },
        {
          id: "premium-only",
          title: "Premium",
          condition: ({ data }: { data: Record<string, unknown> }) =>
            data.plan === "premium",
          content: (
            <>
              <h3>Premium Step</h3>
              <p>This step is only visible when plan is premium.</p>
            </>
          ),
        },
        {
          id: "schema-review",
          title: "Schema Review",
          validate: ({ data }: { data: Record<string, unknown> }) =>
            data.plan ? true : "Please select a plan first",
          content: (
            <>
              <h3>Schema Step 2</h3>
              <p>Validation is provided by schema validate callback.</p>
            </>
          ),
        },
      ],
    }),
    [plan]
  );

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <label style={{ marginRight: "8px" }}>Plan:</label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as "basic" | "premium")}
        >
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <FormWizard
        inlineStep={false}
        layout="horizontal"
        title="Form Wizard"
        subtitle="Step by step form wizard"
        darkMode={false}
        customDarkModeColor={{
          title: "white", //simple color
          subtitle: "white",
          tab: "#fff", //hex color
          tabIconColor: "rgb(42, 74, 247)", //rgb color
          buttons: "black",
          buttonsText: "white",
          finishButton: "green",
          finishButtonText: "white",
        }}
        onComplete={handleComplete}
      >
        <TabContent
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
        </TabContent>

        <TabContent
          title="Last step"
          icon="ti-check"
          isValid={checkValidateTab2()}
          validationError={errorMessages2}
        >
          <h3>Last Tab</h3>
          <p>Some content for the last tab</p>
        </TabContent>
        <TabContent title="Last step" icon="ti-check">
          <h3>Last Tab</h3>
          <p>Some content for the last tab</p>
        </TabContent>
        <TabContent title="Last step" icon="ti-check">
          <h3>Last Tab</h3>
          <p>Some content for the last tab</p>
        </TabContent>
        <TabContent title="Last step" icon="ti-check">
          <h3>Last Tab</h3>
          <p>Some content for the last tab</p>
        </TabContent>
        <TabContent title="Last step" icon="ti-check">
          <h3>Last Tab</h3>
          <p>Some content for the last tab</p>
        </TabContent>
        <TabContent title="Last step" icon="ti-check">
          <h3>Last Tab</h3>
          <p>Some content for the last tab</p>
        </TabContent>
      </FormWizard>

      <hr style={{ margin: "24px 0" }} />

      <FormWizard
        title="Schema-first Wizard"
        subtitle="Conditional + validation from schema"
        schema={schemaWizard}
        data={{ plan }}
      />

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
