import type {
  WizardValidation,
  WizardValidationContext,
  WizardValidationResult,
} from "../types/FormWizard.js";

/**
 * Minimal structural shape of a Zod (or Valibot/ArkType) schema.
 *
 * Typed structurally on purpose: this package stays dependency-free, so we
 * never import `zod` — anything exposing `safeParse` works, including
 * `z.object()`, `z.discriminatedUnion()`, and custom refinements.
 */
export interface StandardSchemaLike {
  safeParse: (value: unknown) =>
    | { success: true }
    | {
        success: false;
        error: {
          // Readonly so schemas that freeze or `as const` their issue list are
          // still assignable; a mutable array satisfies this too.
          issues?: ReadonlyArray<{
            message?: string;
            path?: ReadonlyArray<string | number>;
          }>;
        };
      };
}

export interface ZodValidatorOptions {
  /**
   * Validate only this slice of the wizard data. Without it the whole data
   * object is parsed, which is what you want for a schema covering one step.
   */
  pick?: string[];
  /** Message shown when the schema fails but reports no issue text. */
  fallbackMessage?: string;
  /** Join more than one issue message with this separator. */
  separator?: string;
}

const pickKeys = (data: Record<string, unknown>, keys: string[]) => {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in data) out[key] = data[key];
  }
  return out;
};

/**
 * Turn a Zod-style schema into a wizard step validator.
 *
 * Returning a string from a step validator both blocks navigation and supplies
 * the message, so schema issues surface in the UI with no extra wiring.
 *
 * @example
 * import { z } from "zod";
 * import FormWizard, { zodValidator } from "react-form-wizard-component";
 *
 * const accountSchema = z.object({ email: z.string().email("Enter a valid email") });
 *
 * const schema = {
 *   steps: [
 *     { id: "account", title: "Account", content: <AccountFields />,
 *       validate: zodValidator(accountSchema, { pick: ["email"] }) },
 *   ],
 * };
 */
export function zodValidator(
  schema: StandardSchemaLike,
  options: ZodValidatorOptions = {}
): WizardValidation {
  const {
    pick,
    fallbackMessage = "Please complete this step before continuing.",
    separator = " ",
  } = options;

  return ({ data }: WizardValidationContext): WizardValidationResult => {
    const candidate = pick ? pickKeys(data, pick) : data;
    const result = schema.safeParse(candidate);
    if (result.success) return true;

    const messages = (result.error?.issues ?? [])
      .map((issue) => issue?.message)
      .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? messages.join(separator) : fallbackMessage;
  };
}

/**
 * Minimal structural shape of a react-hook-form `UseFormReturn`.
 *
 * Structural again so `react-hook-form` never becomes a dependency of this
 * package — pass the object `useForm()` gave you.
 *
 * Deliberately only `formState.errors`: that is all this adapter reads, and
 * declaring more would break assignability. react-hook-form types `trigger`
 * and `getValues` against your field names, and a function accepting only
 * `"email" | "phone"` is not assignable to one accepting any `string`, so a
 * wider shape here would reject every real `UseFormReturn`.
 */
export interface HookFormLike {
  formState: {
    errors: Record<string, unknown>;
  };
}

export interface HookFormValidatorOptions {
  /**
   * Field names this step owns. The step blocks only on its own fields, which
   * is what makes per-step validation work in a single react-hook-form form.
   * Omit to consider every current error.
   */
  fields?: string[];
  fallbackMessage?: string;
}

const errorMessageFor = (error: unknown): string | undefined => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return undefined;
};

/**
 * Gate a wizard step on a react-hook-form field subset.
 *
 * Call `form.trigger(fields)` in your own `onNext`/blur handling to populate
 * errors — this validator reads `formState.errors`, it does not mutate form
 * state, so it stays safe to run on every render.
 *
 * @example
 * const form = useForm({ resolver: zodResolver(schema), mode: "onChange" });
 *
 * const wizardSchema = {
 *   steps: [
 *     { id: "account", title: "Account", content: <Fields form={form} />,
 *       validate: hookFormValidator(form, { fields: ["email", "password"] }) },
 *   ],
 * };
 */
export function hookFormValidator(
  form: HookFormLike,
  options: HookFormValidatorOptions = {}
): WizardValidation {
  const { fields, fallbackMessage = "Please fix the highlighted fields." } = options;

  return (): WizardValidationResult => {
    const errors = form?.formState?.errors ?? {};
    const relevant = fields ?? Object.keys(errors);

    for (const field of relevant) {
      const error = errors[field];
      if (!error) continue;
      return errorMessageFor(error) ?? fallbackMessage;
    }

    return true;
  };
}

/**
 * Combine validators; the first failure wins. Useful when a step needs both a
 * schema check and a hand-written rule.
 *
 * @example
 * validate: composeValidators(
 *   zodValidator(accountSchema),
 *   ({ data }) => data.terms === true || "You must accept the terms"
 * )
 */
export function composeValidators(
  ...validators: WizardValidation[]
): WizardValidation {
  return (context: WizardValidationContext): WizardValidationResult => {
    for (const validate of validators) {
      const result = validate(context);
      if (result !== true) return result;
    }
    return true;
  };
}
