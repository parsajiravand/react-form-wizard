# Recipes

Four complete, copy-paste examples for the things people actually build with a
multi-step form. Each one is self-contained.

- [Multi-step checkout with Zod validation](#multi-step-checkout-with-zod-validation)
- [Onboarding flow that survives a reload](#onboarding-flow-that-survives-a-reload)
- [Document upload with async verification](#document-upload-with-async-verification)
- [Survey with branching questions](#survey-with-branching-questions)

---

## Multi-step checkout with Zod validation

The most common request: one form, several steps, each step gating on its own
fields. `react-hook-form` owns the inputs, Zod owns the rules, and the wizard
asks each step whether it may advance.

```tsx
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormWizard, {
  hookFormValidator,
  type FormWizardSchema,
} from "react-form-wizard-component";
import "react-form-wizard-component/styles.css";

const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a phone number"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(3, "Enter a postcode"),
  cardNumber: z.string().regex(/^\d{16}$/, "16 digits, no spaces"),
});

type Checkout = z.infer<typeof checkoutSchema>;

function Field({
  form,
  name,
  label,
  type = "text",
}: {
  form: UseFormReturn<Checkout>;
  name: keyof Checkout;
  label: string;
  type?: string;
}) {
  const error = form.formState.errors[name];
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", marginBottom: 4 }}>{label}</span>
      <input type={type} {...form.register(name)} aria-invalid={!!error} />
      {error && (
        <span role="alert" style={{ color: "#c0392b", fontSize: 13 }}>
          {error.message}
        </span>
      )}
    </label>
  );
}

export default function Checkout() {
  const form = useForm<Checkout>({
    resolver: zodResolver(checkoutSchema),
    // onChange keeps formState.errors current, which is what the wizard reads.
    mode: "onChange",
  });

  const schema: FormWizardSchema = {
    steps: [
      {
        id: "contact",
        title: "Contact",
        icon: "ti-user",
        content: (
          <>
            <Field form={form} name="email" label="Email" type="email" />
            <Field form={form} name="phone" label="Phone" type="tel" />
          </>
        ),
        validate: hookFormValidator(form, { fields: ["email", "phone"] }),
      },
      {
        id: "address",
        title: "Address",
        icon: "ti-home",
        content: (
          <>
            <Field form={form} name="street" label="Street" />
            <Field form={form} name="city" label="City" />
            <Field form={form} name="postcode" label="Postcode" />
          </>
        ),
        validate: hookFormValidator(form, {
          fields: ["street", "city", "postcode"],
        }),
      },
      {
        id: "payment",
        title: "Payment",
        icon: "ti-credit-card",
        content: <Field form={form} name="cardNumber" label="Card number" />,
        validate: hookFormValidator(form, { fields: ["cardNumber"] }),
      },
    ],
  };

  return (
    <FormWizard
      title="Checkout"
      subtitle="Three steps, about a minute"
      schema={schema}
      color="#0e6f70"
      finishButtonText="Pay now"
      // The wizard has already confirmed the last step is valid.
      // handleSubmit returns an event handler, so invoke it rather than
      // passing it straight to onComplete.
      onComplete={() => {
        void form.handleSubmit(async (values) => {
          await fetch("/api/checkout", {
            method: "POST",
            body: JSON.stringify(values),
          });
        })();
      }}
    />
  );
}
```

**Why `mode: "onChange"`** — `hookFormValidator` reads `formState.errors`
rather than triggering validation itself, so errors need to already be there.
If you prefer validating on blur, use `mode: "onBlur"` and the same code works.

**Validating with Zod alone**, without react-hook-form:

```tsx
import FormWizard, { zodValidator } from "react-form-wizard-component";

const contact = z.object({ email: z.string().email("Enter a valid email") });

// Wizard data doubles as the form state.
{
  id: "contact",
  title: "Contact",
  content: ({ data }) => <EmailInput value={data.email} />,
  validate: zodValidator(contact, { pick: ["email"] }),
}
```

---

## Onboarding flow that survives a reload

Long onboarding loses people when a refresh wipes their answers. `persist`
keeps the data and `syncToUrl` keeps the position.

```tsx
import { useRef } from "react";
import FormWizard, {
  type FormWizardMethods,
  type FormWizardSchema,
} from "react-form-wizard-component";
import "react-form-wizard-component/styles.css";

export default function Onboarding() {
  const wizard = useRef<FormWizardMethods>(null);

  const set = (patch: Record<string, unknown>) =>
    wizard.current?.updateData(patch);

  const schema: FormWizardSchema = {
    initialData: { role: "", teamSize: "", goals: [] },
    steps: [
      {
        id: "role",
        title: "Your role",
        content: ({ data }) => (
          <fieldset>
            <legend>What best describes you?</legend>
            {["Engineer", "Designer", "Product"].map((role) => (
              <label key={role} style={{ display: "block" }}>
                <input
                  type="radio"
                  name="role"
                  checked={data.role === role}
                  onChange={() => set({ role })}
                />
                {role}
              </label>
            ))}
          </fieldset>
        ),
        validate: ({ data }) => (data.role ? true : "Pick one to continue"),
      },
      {
        id: "team",
        title: "Team size",
        content: ({ data }) => (
          <select
            value={String(data.teamSize ?? "")}
            onChange={(e) => set({ teamSize: e.target.value })}
          >
            <option value="">Choose…</option>
            <option value="solo">Just me</option>
            <option value="small">2–10</option>
            <option value="large">11+</option>
          </select>
        ),
        validate: ({ data }) => (data.teamSize ? true : "Choose a team size"),
      },
      {
        // Only shown to teams — a solo user never sees an irrelevant step.
        id: "invite",
        title: "Invite",
        condition: ({ data }) => data.teamSize !== "solo",
        content: <textarea placeholder="Emails, comma separated" />,
      },
      {
        id: "done",
        title: "Finish",
        content: ({ data }) => (
          <p>
            You are set up as a <strong>{String(data.role)}</strong>.
          </p>
        ),
      },
    ],
  };

  return (
    <FormWizard
      ref={wizard}
      title="Welcome"
      schema={schema}
      // Survives a refresh. Use storage: "local" to survive closing the tab.
      persist={{ key: "onboarding", storage: "session" }}
      // Writes ?step=2 so a refresh or shared link reopens the same step.
      syncToUrl
      onComplete={async (data) => {
        await fetch("/api/onboarding", {
          method: "POST",
          body: JSON.stringify(data),
        });
        // Clears both the cursor and the persisted answers.
        wizard.current?.reset();
      }}
    />
  );
}
```

Persistence is best-effort by design: private browsing, disabled storage and
quota errors are swallowed rather than thrown, so the form always renders.

---

## Document upload with async verification

Step validators must stay synchronous and pure — they run on every render. Do
async work in your own handler, write the result into wizard data, and let the
validator read it.

```tsx
import { useRef, useState } from "react";
import FormWizard, {
  type FormWizardMethods,
  type FormWizardSchema,
} from "react-form-wizard-component";
import "react-form-wizard-component/styles.css";

type Status = "idle" | "uploading" | "verified" | "rejected";

export default function Verification() {
  const wizard = useRef<FormWizardMethods>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function upload(file: File) {
    setStatus("uploading");
    const body = new FormData();
    body.append("document", file);

    const res = await fetch("/api/verify", { method: "POST", body });
    const { ok, reason } = await res.json();

    setStatus(ok ? "verified" : "rejected");
    // The validator reads these, so the step unlocks itself.
    wizard.current?.updateData({
      documentVerified: ok,
      rejectionReason: reason ?? null,
    });
  }

  const schema: FormWizardSchema = {
    steps: [
      {
        id: "identity",
        title: "Identity",
        content: <input placeholder="Full legal name" />,
      },
      {
        id: "document",
        title: "Document",
        content: ({ data }) => (
          <div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            {status === "uploading" && <p role="status">Checking document…</p>}
            {status === "verified" && <p role="status">Document accepted.</p>}
            {status === "rejected" && (
              <p role="alert">{String(data.rejectionReason ?? "Rejected")}</p>
            )}
          </div>
        ),
        // Synchronous and pure: it only reads what the upload handler wrote.
        validate: ({ data }) =>
          data.documentVerified === true
            ? true
            : status === "uploading"
            ? "Still checking your document…"
            : "Upload a document to continue",
      },
      {
        id: "review",
        title: "Review",
        content: <p>Everything checks out.</p>,
      },
    ],
  };

  return (
    <FormWizard
      ref={wizard}
      title="Verification"
      schema={schema}
      onComplete={(data) => console.log("submitting", data)}
    />
  );
}
```

**The rule:** never `await` inside `validate`, and never set state from it. The
wizard re-evaluates validators during render, so an effectful validator causes
an update loop.

---

## Survey with branching questions

When the shape of the form is genuinely dynamic, drop the bundled markup and
drive your own with `useWizard`.

```tsx
import { useMemo } from "react";
import { useWizardCursor, useWizardData } from "react-form-wizard-component";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  showIf?: (answers: Record<string, unknown>) => boolean;
};

const QUESTIONS: Question[] = [
  { id: "uses-react", prompt: "Do you use React at work?", options: ["Yes", "No"] },
  {
    id: "react-version",
    prompt: "Which major?",
    options: ["17", "18", "19"],
    showIf: (a) => a["uses-react"] === "Yes",
  },
  {
    id: "why-not",
    prompt: "What do you use instead?",
    options: ["Vue", "Svelte", "Angular", "Something else"],
    showIf: (a) => a["uses-react"] === "No",
  },
  { id: "forms", prompt: "How do you build forms?", options: ["By hand", "A library"] },
];

export default function Survey() {
  // Answers first: the visible question list is derived from them.
  const answers = useWizardData({ persist: { key: "survey" } });

  const visible = useMemo(
    () => QUESTIONS.filter((q) => !q.showIf || q.showIf(answers.data)),
    [answers.data]
  );

  // Then the cursor, sized by the questions that currently apply. Branches
  // appearing or disappearing resize it automatically.
  const cursor = useWizardCursor({ stepIds: visible.map((q) => q.id) });

  const question = visible[cursor.currentStep];
  const answered = question ? answers.data[question.id] !== undefined : false;

  if (!question) return <p>Thanks for taking part.</p>;

  return (
    <section aria-labelledby="q">
      <p>
        Question {cursor.currentStep + 1} of {cursor.totalSteps}
      </p>

      <h2 id="q">{question.prompt}</h2>

      <div role="radiogroup" aria-labelledby="q">
        {question.options.map((option) => (
          <label key={option} style={{ display: "block" }}>
            <input
              type="radio"
              name={question.id}
              checked={answers.data[question.id] === option}
              onChange={() => answers.updateData({ [question.id]: option })}
            />
            {option}
          </label>
        ))}
      </div>

      <button onClick={cursor.previous} disabled={cursor.isFirstStep}>
        Back
      </button>

      {cursor.isLastStep ? (
        <button
          disabled={!answered}
          onClick={() => {
            void fetch("/api/survey", {
              method: "POST",
              body: JSON.stringify(answers.data),
            });
            answers.clearPersisted();
          }}
        >
          Submit
        </button>
      ) : (
        <button onClick={cursor.next} disabled={!answered}>
          Next
        </button>
      )}
    </section>
  );
}
```

A simpler alternative: keep `<FormWizard />` and put the branching in each
step's `condition`, as the onboarding recipe does. Reach for the headless hook
when the question list itself is data, not code.

---

## Styling any of these with Tailwind

```tsx
<FormWizard
  unstyled
  classNames={{
    root: "mx-auto max-w-xl",
    header: "mb-6 text-center",
    title: "text-2xl font-semibold tracking-tight",
    subtitle: "text-sm text-slate-500",
    stepList: "mb-6 flex list-none gap-2 p-0",
    step: "cursor-pointer rounded px-3 py-1 text-sm text-slate-500",
    stepActive: "bg-teal-700 text-white",
    content: "rounded-lg border border-slate-200 p-6",
    footer: "mt-6 flex justify-between",
    backButton: "rounded px-4 py-2 text-slate-600 hover:bg-slate-100",
    nextButton: "rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-800",
    finishButton: "rounded bg-teal-700 px-4 py-2 text-white hover:bg-teal-800",
  }}
  schema={schema}
/>
```

In `unstyled` mode the stylesheet import is unnecessary — accessibility helpers
stay hidden without it.

To keep the bundled layout but change the palette, use `theme` instead:

```tsx
<FormWizard theme={{ primaryColor: "#0e6f70", borderRadius: "8px" }} schema={schema} />
```
