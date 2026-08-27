import React from "react";
// The demo imports the library from source so the playground always
// exercises the current code rather than a stale dist/ build.
import FormWizard, {
  TabContent,
  useWizard,
  useWizardCursor,
  useWizardData,
  zodValidator,
  composeValidators,
} from "./main.js";
import type {
  FormWizardMethods,
  FormWizardSchema,
  WizardData,
  WizardTheme,
} from "./main.js";


/* ==================================================================== *
 * v1.2.0 samples
 *
 * These are declared at module scope rather than inside App(). A component
 * defined inside another component is a new type on every render, so React
 * remounts it and it loses its state — which would break the headless and
 * persistence demos below.
 * ==================================================================== */

// Sample 16: Theme tokens — the `theme` prop writes --rfw-* custom properties
// onto the wizard root, so one token can be overridden without restating a
// palette. Works in light and dark, unlike the older customDarkModeColor.
const Sample16_Theme = () => {
  const [theme, setTheme] = React.useState<WizardTheme>({
    primaryColor: "#0e6f70",
    borderRadius: "10px",
    errorColor: "#c0392b",
  });

  return (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <label>
          Accent{" "}
          <input
            type="color"
            value={theme.primaryColor ?? "#0e6f70"}
            onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
          />
        </label>
        <label>
          Radius{" "}
          <input
            type="range"
            min={0}
            max={24}
            value={Number.parseInt(theme.borderRadius ?? "10", 10)}
            onChange={(e) => setTheme((t) => ({ ...t, borderRadius: `${e.target.value}px` }))}
          />
        </label>
        <code style={{ fontSize: 12 }}>{JSON.stringify(theme)}</code>
      </div>

      <FormWizard title="Themed wizard" subtitle="Live CSS custom properties" theme={theme}>
        <TabContent title="One">
          <p>The accent, progress ring and buttons all read the same token.</p>
        </TabContent>
        <TabContent title="Two">
          <p>No stylesheet edit and no rebuild — just the `theme` prop.</p>
        </TabContent>
        <TabContent title="Three">
          <p>Set the same `--rfw-*` variables in your own CSS for a global default.</p>
        </TabContent>
      </FormWizard>
    </>
  );
};

// Sample 17: Unstyled mode — drop every bundled class and inline colour, then
// bring your own. `classNames` also works without `unstyled`, in which case
// the overrides are merged with the defaults instead of replacing them.
const Sample17_Unstyled = () => (
  <>
    <style>{`
      .u-root { display: flex; flex-direction: column; gap: 20px; font-family: inherit; }
      .u-steps { display: flex; gap: 8px; list-style: none; margin: 0; padding: 0; }
      .u-step { padding: 6px 14px; border-radius: 999px; background: #eef2f2;
                color: #5c6968; font-size: 14px; cursor: pointer; display: block; }
      .u-step-active { background: #0e6f70; color: #fff; }
      .u-panel { border: 1px solid #d6dede; border-radius: 10px; padding: 20px; }
      .u-footer { display: flex; gap: 10px; }
      .u-btn { border: 0; border-radius: 8px; padding: 9px 18px; cursor: pointer;
               background: #0e6f70; color: #fff; font-size: 14px; }
      .u-btn-ghost { background: transparent; color: #0e6f70; border: 1px solid #0e6f70; }
    `}</style>

    <FormWizard
      unstyled
      classNames={{
        root: "u-root",
        stepList: "u-steps",
        step: "u-step",
        stepActive: "u-step-active",
        content: "u-panel",
        footer: "u-footer",
        backButton: "u-btn u-btn-ghost",
        nextButton: "u-btn",
        finishButton: "u-btn",
      }}
      onComplete={() => alert("Unstyled wizard finished")}
    >
      <TabContent title="Details">
        <p>No bundled CSS is applied here — every class above is mine.</p>
      </TabContent>
      <TabContent title="Preferences">
        <p>Swap these for Tailwind utilities and nothing else changes.</p>
      </TabContent>
      <TabContent title="Done">
        <p>Screen-reader helpers stay hidden even without the stylesheet.</p>
      </TabContent>
    </FormWizard>
  </>
);

// Sample 18: Headless — same state machine, none of the markup.
// <FormWizard /> is built on these hooks, so behaviour is identical.
const HEADLESS_STEPS = ["account", "profile", "review"];

const Sample18_Headless = () => {
  const wizard = useWizard({ stepIds: HEADLESS_STEPS });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {HEADLESS_STEPS.map((id, i) => (
          <span
            key={id}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= wizard.currentStep ? "#0e6f70" : "#dce3e3",
            }}
          />
        ))}
      </div>

      <p style={{ margin: 0, color: "#5c6968", fontSize: 14 }}>
        Step {wizard.currentStep + 1} of {wizard.totalSteps} — <code>{wizard.stepId}</code>
      </p>

      {wizard.stepId === "account" && (
        <label>
          Email{" "}
          <input
            value={String(wizard.data.email ?? "")}
            onChange={(e) => wizard.updateData({ email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
      )}

      {wizard.stepId === "profile" && (
        <label>
          Display name{" "}
          <input
            value={String(wizard.data.name ?? "")}
            onChange={(e) => wizard.updateData({ name: e.target.value })}
            placeholder="Ada"
          />
        </label>
      )}

      {wizard.stepId === "review" && (
        <pre style={{ background: "#f5f7f7", padding: 12, borderRadius: 6, fontSize: 13 }}>
          {JSON.stringify(wizard.data, null, 2)}
        </pre>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={wizard.previous} disabled={wizard.isFirstStep}>
          Back
        </button>
        <button onClick={wizard.next} disabled={wizard.isLastStep}>
          Next
        </button>
        <button onClick={wizard.reset}>Reset</button>
      </div>
    </div>
  );
};

// Sample 19: Validation adapters. `zodValidator` is typed structurally — it
// accepts anything exposing `safeParse`, so zod never becomes a dependency of
// this package (or of this demo). With zod installed you would pass
// `z.object({ ... })` here instead of the hand-rolled schema.
const emailSchema = {
  safeParse: (value: unknown) => {
    const email = (value as { email?: unknown } | null)?.email;
    return typeof email === "string" && /.+@.+\..+/.test(email)
      ? ({ success: true } as const)
      : ({
          success: false,
          error: { issues: [{ message: "Enter a valid email address" }] },
        } as const);
  },
};

const Sample19_Adapters = () => {
  const wizardRef = React.useRef<FormWizardMethods>(null);

  const schema: FormWizardSchema = {
    initialData: { email: "", terms: false },
    steps: [
      {
        id: "email",
        title: "Email",
        content: ({ data }) => (
          <label>
            Email{" "}
            <input
              value={String(data.email ?? "")}
              onChange={(e) => wizardRef.current?.updateData({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
        ),
        // Two rules on one step; the first failure wins.
        validate: composeValidators(
          zodValidator(emailSchema, { pick: ["email"] }),
          ({ data }) =>
            String(data.email ?? "").endsWith("@example.org")
              ? "example.org addresses are not accepted"
              : true
        ),
      },
      {
        id: "terms",
        title: "Terms",
        content: ({ data }) => (
          <label>
            <input
              type="checkbox"
              checked={Boolean(data.terms)}
              onChange={(e) => wizardRef.current?.updateData({ terms: e.target.checked })}
            />{" "}
            I accept the terms
          </label>
        ),
        validate: ({ data }) => (data.terms === true ? true : "You must accept the terms"),
      },
    ],
  };

  return (
    <>
      <p style={{ color: "#5c6968", fontSize: 14 }}>
        Next stays blocked until the step is valid; the step marker turns red and
        the validator's message is what gets surfaced.
      </p>
      <FormWizard
        ref={wizardRef}
        title="Adapter validation"
        schema={schema}
        color="#0e6f70"
        onComplete={(data) => alert(`Submitted: ${JSON.stringify(data)}`)}
      />
    </>
  );
};

// Sample 20: Persistence and URL sync. Fill something in, then reload the page
// — the answers and the step both come back. Storage access is guarded, so
// private browsing and SSR never throw.
const Sample20_Persistence = () => {
  const wizardRef = React.useRef<FormWizardMethods>(null);

  const schema: FormWizardSchema = {
    initialData: { note: "" },
    steps: [
      {
        id: "write",
        title: "Write",
        content: ({ data }) => (
          <label>
            Note{" "}
            <input
              value={String(data.note ?? "")}
              onChange={(e) => wizardRef.current?.updateData({ note: e.target.value })}
              placeholder="Type, then reload the page"
            />
          </label>
        ),
      },
      {
        id: "confirm",
        title: "Confirm",
        content: ({ data }) => <p>Saved note: “{String(data.note ?? "")}”</p>,
      },
      { id: "done", title: "Done", content: <p>Still here after a refresh.</p> },
    ],
  };

  return (
    <>
      <p style={{ color: "#5c6968", fontSize: 14 }}>
        Data goes to <code>sessionStorage["demo-persist"]</code>; the active step is
        mirrored into <code>?demo-step=</code>. <b>Reload the page to see it restored.</b>
      </p>
      <FormWizard
        ref={wizardRef}
        title="Resumable wizard"
        schema={schema}
        persist={{ key: "demo-persist", storage: "session" }}
        syncToUrl={{ param: "demo-step" }}
        color="#0e6f70"
        onComplete={() => {
          alert("Done — clearing saved data");
          // reset() returns to the start and clears the persisted payload.
          wizardRef.current?.reset();
        }}
      />
    </>
  );
};

// Sample 21: Accessibility. An aria-live region announces each step change and
// focus moves to the revealed panel. Two wizards can share a page — only the
// one containing focus responds to the arrow keys.
const Sample21_Accessibility = () => (
  <>
    <p style={{ color: "#5c6968", fontSize: 14 }}>
      Click into either wizard, then use <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd>{" "}
      <kbd>End</kbd>. Only the focused wizard moves. Tabs also activate with{" "}
      <kbd>Enter</kbd> and <kbd>Space</kbd>.
    </p>
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      <FormWizard title="Wizard A" ariaLabel="Wizard A" color="#0e6f70">
        <TabContent title="A1">First panel of A</TabContent>
        <TabContent title="A2">Second panel of A</TabContent>
        <TabContent title="A3">Third panel of A</TabContent>
      </FormWizard>

      <FormWizard title="Wizard B" ariaLabel="Wizard B" color="#9a7000">
        <TabContent title="B1">First panel of B</TabContent>
        <TabContent title="B2">Second panel of B</TabContent>
        <TabContent title="B3">Third panel of B</TabContent>
      </FormWizard>
    </div>
  </>
);

// Sample 22: The split hooks. `useWizardData` owns the answers and
// `useWizardCursor` owns the position — which is what lets the step list itself
// be data, resizing as branches appear and disappear.
const QUESTIONS = [
  { id: "react", prompt: "Do you use React at work?", options: ["Yes", "No"] },
  {
    id: "version",
    prompt: "Which major?",
    options: ["17", "18", "19"],
    showIf: (a: WizardData) => a.react === "Yes",
  },
  {
    id: "instead",
    prompt: "What do you use instead?",
    options: ["Vue", "Svelte", "Angular"],
    showIf: (a: WizardData) => a.react === "No",
  },
  { id: "forms", prompt: "How do you build forms?", options: ["By hand", "A library"] },
];

const Sample22_SplitHooks = () => {
  const answers = useWizardData({});
  const visible = React.useMemo(
    () => QUESTIONS.filter((q) => !q.showIf || q.showIf(answers.data)),
    [answers.data]
  );
  const cursor = useWizardCursor({ stepIds: visible.map((q) => q.id) });
  const question = visible[cursor.currentStep];

  if (!question) return <p>Thanks for taking part.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, color: "#5c6968", fontSize: 14 }}>
        Question {cursor.currentStep + 1} of {cursor.totalSteps} — the list resizes as
        you answer.
      </p>

      <h4 id="branch-q" style={{ margin: 0 }}>
        {question.prompt}
      </h4>

      <div role="radiogroup" aria-labelledby="branch-q">
        {question.options.map((option) => (
          <label key={option} style={{ display: "block" }}>
            <input
              type="radio"
              name={question.id}
              checked={answers.data[question.id] === option}
              onChange={() => answers.updateData({ [question.id]: option })}
            />{" "}
            {option}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={cursor.previous} disabled={cursor.isFirstStep}>
          Back
        </button>
        <button
          onClick={cursor.next}
          disabled={cursor.isLastStep || answers.data[question.id] === undefined}
        >
          Next
        </button>
      </div>

      <pre style={{ background: "#f5f7f7", padding: 12, borderRadius: 6, fontSize: 13 }}>
        {JSON.stringify(answers.data, null, 2)}
      </pre>
    </div>
  );
};


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
      <h1>React Form Wizard — 22 feature samples</h1>
      <p>
        Samples 1–15 cover the existing API. Samples 16–22 are new in{" "}
        <strong>v1.2.0</strong>.
      </p>

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


      <hr style={{ margin: "48px 0 32px", border: 0, borderTop: "2px solid #101718" }} />
      <h2 style={{ borderBottom: "none" }}>New in v1.2.0</h2>

      <section style={{ marginBottom: "40px" }}>
        <h2>16. Theme tokens (CSS custom properties)</h2>
        <Sample16_Theme />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>17. Unstyled mode + classNames</h2>
        <Sample17_Unstyled />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>18. Headless useWizard()</h2>
        <Sample18_Headless />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>19. Validation adapters (Zod-shaped + composed)</h2>
        <Sample19_Adapters />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>20. Persistence + URL sync</h2>
        <Sample20_Persistence />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>21. Accessibility &amp; two wizards on one page</h2>
        <Sample21_Accessibility />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>22. Split hooks: branching questions</h2>
        <Sample22_SplitHooks />
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