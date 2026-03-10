import React from "react";
import FormWizard, { TabContent } from "react-form-wizard-component";
import type { FormWizardMethods, FormWizardSchema, WizardData } from "react-form-wizard-component";


export default function App() {
  const [userInput, setUserInput] = React.useState("");
  const [plan, setPlan] = React.useState<"basic" | "premium">("basic");
  const [accepted, setAccepted] = React.useState(false);
  const [schemaData, setSchemaData] = React.useState<WizardData>({ plan: "basic", accepted: false });

  const handleComplete = (data?: WizardData) => {
    console.log("Wizard completed with data:", data);
    alert("Wizard completed!");
  };

  const handleTabChange = ({ prevIndex, nextIndex, stepId }: { prevIndex: number; nextIndex: number; stepId?: string }) => {
    console.log("Tab changed:", { prevIndex, nextIndex, stepId });
  };

  // Sample 1: Basic Children API Wizard
  const Sample1_Basic = () => (
    <FormWizard title="Sample 1: Basic Wizard" subtitle="Simple children API" onComplete={handleComplete}>
      <TabContent title="Step 1" icon="ti-user">
        <h4>Welcome</h4>
        <p>This is a basic wizard using the children API.</p>
      </TabContent>
      <TabContent title="Step 2" icon="ti-settings">
        <h4>Settings</h4>
        <p>Configure your preferences.</p>
      </TabContent>
      <TabContent title="Step 3" icon="ti-check">
        <h4>Complete</h4>
        <p>Wizard finished!</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 2: Schema API Wizard
  const Sample2_Schema = () => {
    const schema: FormWizardSchema = {
      initialData: schemaData,
      steps: [
        {
          id: "intro",
          title: "Introduction",
          content: <div><h4>Schema Mode</h4><p>This wizard uses the schema API.</p></div>,
        },
        {
          id: "premium",
          title: "Premium Features",
          condition: ({ data }) => data.plan === "premium",
          content: <div><h4>Premium Only</h4><p>This step only shows for premium plans.</p></div>,
        },
        {
          id: "finish",
          title: "Complete",
          content: <div><h4>Done</h4><p>Schema wizard complete!</p></div>,
        },
      ],
    };

    return (
      <FormWizard
        title="Sample 2: Schema Wizard"
        subtitle="Data-driven with conditions"
        schema={schema}
        data={schemaData}
        onDataChange={setSchemaData}
        onComplete={handleComplete}
      />
    );
  };

  // Sample 3: Dark Mode Wizard
  const Sample3_DarkMode = () => (
    <FormWizard
      title="Sample 3: Dark Mode"
      subtitle="Dark theme with custom colors"
      darkMode={true}
      customDarkModeColor={{
        title: "#ffffff",
        subtitle: "#cccccc",
        tab: "#ffffff",
        tabIconColor: "#3b82f6",
        buttons: "#1f1f1f",
        buttonsText: "#ffffff",
        finishButton: "#10b981",
        finishButtonText: "#ffffff",
      }}
      onComplete={handleComplete}
    >
      <TabContent title="Dark Step 1" icon="ti-moon">
        <h4>Dark Theme</h4>
        <p>This wizard uses dark mode styling.</p>
      </TabContent>
      <TabContent title="Dark Step 2" icon="ti-star">
        <h4>Dark Features</h4>
        <p>Custom dark colors applied.</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 4: Custom Colors Wizard
  const Sample4_CustomColors = () => (
    <FormWizard
      title="Sample 4: Custom Colors"
      subtitle="Orange theme with custom styling"
      color="#ff6b35"
      customDarkModeColor={{
        title: "#ff6b35",
        subtitle: "#ff8f65",
        tab: "#ff6b35",
        tabIconColor: "#ffffff",
        buttons: "#ff6b35",
        buttonsText: "#ffffff",
        finishButton: "#4caf50",
        finishButtonText: "#ffffff",
      }}
      onComplete={handleComplete}
    >
      <TabContent title="Orange Step 1" icon="ti-paint-bucket">
        <h4>Custom Colors</h4>
        <p>This wizard uses custom orange theme.</p>
      </TabContent>
      <TabContent title="Orange Step 2" icon="ti-palette">
        <h4>Color Options</h4>
        <p>Fully customizable color scheme.</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 5: Custom Button Templates
  const Sample5_CustomButtons = () => (
    <FormWizard
      title="Sample 5: Custom Buttons"
      subtitle="Custom button templates"
      nextButtonTemplate={(next) => (
        <button className="wizard-btn" onClick={next} type="button" style={{ backgroundColor: "#8b5cf6" }}>
          Continue →
        </button>
      )}
      backButtonTemplate={(back) => (
        <button className="wizard-btn" onClick={back} type="button" style={{ backgroundColor: "#6b7280" }}>
          ← Go Back
        </button>
      )}
      finishButtonTemplate={(finish) => (
        <button className="wizard-btn" onClick={finish} type="button" style={{ backgroundColor: "#10b981" }}>
          🎉 Complete!
        </button>
      )}
      onComplete={handleComplete}
    >
      <TabContent title="Custom Buttons 1" icon="ti-layout">
        <h4>Button Templates</h4>
        <p>This wizard uses custom button components.</p>
      </TabContent>
      <TabContent title="Custom Buttons 2" icon="ti-mouse">
        <h4>Interactive</h4>
        <p>Click the custom buttons to navigate.</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 6: Validation with Error Display
  const Sample6_Validation = () => (
    <FormWizard
      title="Sample 6: Validation"
      subtitle="Error states and validation"
      onComplete={handleComplete}
    >
      <TabContent
        title="Required Input"
        icon="ti-alert"
        showErrorOnTab={!userInput.trim()}
        showErrorOnTabColor="red"
      >
        <h4>Validation Required</h4>
        <p>Please enter some text to proceed.</p>
        <input
          className="form-control"
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Required field..."
        />
        {!userInput.trim() && <p style={{ color: "red" }}>This field is required</p>}
      </TabContent>
      <TabContent
        title="Length Check"
        icon="ti-check-box"
        isValid={userInput.length >= 3}
        validationError={() => alert("Please enter at least 3 characters")}
      >
        <h4>Length Validation</h4>
        <p>Input must be at least 3 characters: "{userInput}"</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 7: Conditional Steps (Schema)
  const Sample7_Conditional = () => {
    const conditionalSchema: FormWizardSchema = {
      initialData: { plan, accepted },
      steps: [
        {
          id: "plan-selection",
          title: "Choose Plan",
          content: (
            <div>
              <h4>Select Your Plan</h4>
              <select value={plan} onChange={(e) => setPlan(e.target.value as "basic" | "premium")}>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          ),
        },
        {
          id: "premium-features",
          title: "Premium Only",
          condition: ({ data }) => data.plan === "premium",
          content: <div><h4>Premium Features</h4><p>Only visible for premium plans!</p></div>,
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          validate: ({ data }) => data.accepted === true ? true : "Please accept terms",
          content: (
            <div>
              <h4>Terms Acceptance</h4>
              <label>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                I accept the terms and conditions
              </label>
            </div>
          ),
        },
      ],
    };

    return (
      <FormWizard
        title="Sample 7: Conditional Steps"
        subtitle="Dynamic steps based on data"
        schema={conditionalSchema}
        data={{ plan, accepted }}
        onDataChange={(data) => {
          setPlan(data.plan as "basic" | "premium");
          setAccepted(Boolean(data.accepted));
        }}
        onComplete={handleComplete}
      />
    );
  };

  // Sample 8: Imperative API
  const Sample8_Imperative = () => {
    const wizardRef = React.useRef<FormWizardMethods>(null);

    return (
      <div>
        <FormWizard
          ref={wizardRef}
          title="Sample 8: Imperative API"
          subtitle="External controls"
          onComplete={handleComplete}
        >
          <TabContent title="Step A" icon="ti-control-play">
            <h4>Imperative Control</h4>
            <p>Use buttons below to control navigation.</p>
          </TabContent>
          <TabContent title="Step B" icon="ti-control-forward">
            <h4>Programmatic Navigation</h4>
            <p>Wizard controlled externally.</p>
          </TabContent>
          <TabContent title="Step C" icon="ti-control-stop">
            <h4>Complete</h4>
            <p>End of imperative demo.</p>
          </TabContent>
        </FormWizard>

        <div style={{ margin: "12px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="wizard-btn" onClick={() => wizardRef.current?.prevTab()}>
            ← Previous
          </button>
          <button className="wizard-btn" onClick={() => wizardRef.current?.nextTab()}>
            Next →
          </button>
          <button className="wizard-btn" onClick={() => wizardRef.current?.goToTab(0)}>
            Go to Start
          </button>
          <button className="wizard-btn" onClick={() => wizardRef.current?.goToTab(2)}>
            Jump to End
          </button>
          <button className="wizard-btn" onClick={() => wizardRef.current?.reset()}>
            Reset
          </button>
        </div>
      </div>
    );
  };

  // Sample 9: Vertical Layout
  const Sample9_Vertical = () => (
    <FormWizard
      title="Sample 9: Vertical Layout"
      subtitle="Steps arranged vertically"
      layout="vertical"
      onComplete={handleComplete}
    >
      <TabContent title="Vertical Step 1" icon="ti-direction-alt">
        <h4>Vertical Layout</h4>
        <p>Steps are arranged vertically instead of horizontally.</p>
      </TabContent>
      <TabContent title="Vertical Step 2" icon="ti-direction">
        <h4>Layout Options</h4>
        <p>Choose between horizontal and vertical layouts.</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 10: Different Step Sizes
  const Sample10_StepSizes = () => (
    <div>
      <h4>Extra Small (xs)</h4>
      <FormWizard stepSize="xs" title="XS Size" onComplete={handleComplete}>
        <TabContent title="XS Step" icon="ti-minus">
          <p>Extra small step size</p>
        </TabContent>
      </FormWizard>

      <h4>Small (sm)</h4>
      <FormWizard stepSize="sm" title="SM Size" onComplete={handleComplete}>
        <TabContent title="SM Step" icon="ti-plus">
          <p>Small step size</p>
        </TabContent>
      </FormWizard>

      <h4>Large (lg)</h4>
      <FormWizard stepSize="lg" title="LG Size" onComplete={handleComplete}>
        <TabContent title="LG Step" icon="ti-plus">
          <p>Large step size</p>
        </TabContent>
      </FormWizard>
    </div>
  );

  // Sample 11: Inline Steps
  const Sample11_Inline = () => (
    <FormWizard
      title="Sample 11: Inline Steps"
      subtitle="Compact inline design"
      inlineStep={true}
      onComplete={handleComplete}
    >
      <TabContent title="Inline 1" icon="ti-layout-width-full">
        <h4>Inline Steps</h4>
        <p>Steps are displayed inline without progress bar.</p>
      </TabContent>
      <TabContent title="Inline 2" icon="ti-layout-width-default">
        <h4>Compact Design</h4>
        <p>Perfect for space-constrained layouts.</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 12: Square Shape
  const Sample12_Square = () => (
    <FormWizard
      title="Sample 12: Square Shape"
      subtitle="Square step indicators"
      shape="square"
      onComplete={handleComplete}
    >
      <TabContent title="Square Step 1" icon="ti-layout-grid2">
        <h4>Square Shapes</h4>
        <p>Step indicators use square shape instead of circles.</p>
      </TabContent>
      <TabContent title="Square Step 2" icon="ti-layout-grid3">
        <h4>Shape Options</h4>
        <p>Choose between circle and square shapes.</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 13: Custom Icons (React Elements)
  const Sample13_CustomIcons = () => {
    const starIcon = <span style={{ color: "#fbbf24", fontSize: "16px" }}>⭐</span>;
    const heartIcon = <span style={{ color: "#ef4444", fontSize: "16px" }}>❤️</span>;

    return (
      <FormWizard title="Sample 13: Custom Icons" subtitle="React element icons" onComplete={handleComplete}>
        <TabContent title="Star Step" icon={starIcon}>
          <h4>Custom Icons</h4>
          <p>Icons can be React elements, not just strings.</p>
        </TabContent>
        <TabContent title="Heart Step" icon={heartIcon}>
          <h4>Rich Icons</h4>
          <p>Use any React component as an icon.</p>
        </TabContent>
      </FormWizard>
    );
  };

  // Sample 14: Progress Bar (Default)
  const Sample14_ProgressBar = () => (
    <FormWizard
      title="Sample 14: Progress Bar"
      subtitle="Visual progress indication"
      showProgressBar={true}
      onComplete={handleComplete}
    >
      <TabContent title="Progress 1" icon="ti-timer">
        <h4>Progress Tracking</h4>
        <p>Visual progress bar shows completion status.</p>
      </TabContent>
      <TabContent title="Progress 2" icon="ti-dashboard">
        <h4>Step Indicators</h4>
        <p>Completed steps are visually marked.</p>
      </TabContent>
      <TabContent title="Progress 3" icon="ti-check">
        <h4>Complete</h4>
        <p>All steps completed with progress shown.</p>
      </TabContent>
    </FormWizard>
  );

  // Sample 15: Complete Feature Showcase
  const Sample15_CompleteShowcase = () => {
    const showcaseRef = React.useRef<FormWizardMethods>(null);
    const showcaseSchema: FormWizardSchema = {
      initialData: { name: "", email: "", plan: "basic", terms: false },
      steps: [
        {
          id: "personal",
          title: "Personal Info",
          validate: ({ data }) => data.name && data.email ? true : "Name and email required",
          content: (
            <div>
              <h4>Personal Information</h4>
              <input
                className="form-control"
                type="text"
                placeholder="Name"
                onChange={(e) =>
                  showcaseRef.current?.setData({ ...showcaseRef.current.getData(), name: e.target.value })
                }
              />
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                style={{ marginTop: "8px" }}
                onChange={(e) =>
                  showcaseRef.current?.setData({ ...showcaseRef.current.getData(), email: e.target.value })
                }
              />
            </div>
          ),
        },
        {
          id: "plan",
          title: "Select Plan",
          content: (
            <div>
              <h4>Choose Your Plan</h4>
              <select
                onChange={(e) =>
                  showcaseRef.current?.setData({
                    ...showcaseRef.current.getData(),
                    plan: e.target.value,
                  })
                }
              >
                <option value="basic">Basic - $9/month</option>
                <option value="premium">Premium - $29/month</option>
                <option value="enterprise">Enterprise - $99/month</option>
              </select>
            </div>
          ),
        },
        {
          id: "premium-extra",
          title: "Premium Features",
          condition: ({ data }) => data.plan === "premium" || data.plan === "enterprise",
          content: <div><h4>Premium Benefits</h4><p>Advanced features included!</p></div>,
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          validate: ({ data }) => data.terms === true ? true : "Please accept terms",
          content: (
            <div>
              <h4>Final Step</h4>
              <label>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    showcaseRef.current?.setData({
                      ...showcaseRef.current.getData(),
                      terms: e.target.checked,
                    })
                  }
                />
                I accept the terms and conditions
              </label>
            </div>
          ),
        },
      ],
    };

    return (
      <div>
        <FormWizard
          ref={showcaseRef}
          title="Sample 15: Complete Showcase"
          subtitle="All features combined"
          schema={showcaseSchema}
          layout="horizontal"
          stepSize="md"
          color="#6366f1"
          darkMode={false}
          showProgressBar={true}
          onComplete={handleComplete}
          onTabChange={handleTabChange}
          nextButtonTemplate={(next) => (
            <button className="wizard-btn" onClick={next} style={{ backgroundColor: "#6366f1" }}>
              Continue →
            </button>
          )}
          finishButtonTemplate={(finish) => (
            <button className="wizard-btn" onClick={finish} style={{ backgroundColor: "#10b981" }}>
              🎉 Complete Setup!
            </button>
          )}
        />

        <div style={{ margin: "12px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="wizard-btn" onClick={() => showcaseRef.current?.prevTab()}>
            ← Back
          </button>
          <button className="wizard-btn" onClick={() => showcaseRef.current?.nextTab()}>
            Next →
          </button>
          <button className="wizard-btn" onClick={() => showcaseRef.current?.reset()}>
            Start Over
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>React Form Wizard - 15 Feature Samples</h1>
      <p>Comprehensive showcase of all available features</p>

      <section style={{ marginBottom: "40px" }}>
        <h2>1. Basic Children API</h2>
        <Sample1_Basic />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>2. Schema API</h2>
        <Sample2_Schema />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>3. Dark Mode</h2>
        <Sample3_DarkMode />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>4. Custom Colors</h2>
        <Sample4_CustomColors />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>5. Custom Button Templates</h2>
        <Sample5_CustomButtons />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>6. Validation & Error States</h2>
        <Sample6_Validation />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>7. Conditional Steps</h2>
        <Sample7_Conditional />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>8. Imperative API</h2>
        <Sample8_Imperative />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>9. Vertical Layout</h2>
        <Sample9_Vertical />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>10. Step Sizes</h2>
        <Sample10_StepSizes />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>11. Inline Steps</h2>
        <Sample11_Inline />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>12. Square Shape</h2>
        <Sample12_Square />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>13. Custom React Icons</h2>
        <Sample13_CustomIcons />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>14. Progress Bar</h2>
        <Sample14_ProgressBar />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>15. Complete Feature Showcase</h2>
        <Sample15_CompleteShowcase />
      </section>

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
          width: 100%;
          max-width: 300px;
        }

        h1, h2, h3, h4 {
          margin: 16px 0;
        }

        section {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 32px;
        }

        h2 {
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }
      `}</style>
    </div>
  );
}