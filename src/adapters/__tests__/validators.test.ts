import {
  composeValidators,
  hookFormValidator,
  zodValidator,
  type HookFormLike,
  type StandardSchemaLike,
} from "../validators";
import type { WizardValidationContext } from "../../types/FormWizard";

const context = (data: Record<string, unknown>): WizardValidationContext => ({
  data,
  currentStep: 0,
  stepIndex: 0,
});

/**
 * Stand-in for a Zod schema. The adapter is structurally typed so the package
 * stays dependency-free, which is exactly what this fake verifies.
 */
const fakeSchema = (
  check: (value: unknown) => string[] | null
): StandardSchemaLike => ({
  safeParse: (value: unknown) => {
    const messages = check(value);
    return messages
      ? { success: false, error: { issues: messages.map((message) => ({ message })) } }
      : { success: true };
  },
});

describe("zodValidator", () => {
  it("passes when the schema succeeds", () => {
    const validate = zodValidator(fakeSchema(() => null));
    expect(validate(context({ email: "a@b.com" }))).toBe(true);
  });

  it("returns the schema's message when it fails", () => {
    const validate = zodValidator(
      fakeSchema(() => ["Enter a valid email"])
    );
    expect(validate(context({}))).toBe("Enter a valid email");
  });

  it("joins multiple issues", () => {
    const validate = zodValidator(fakeSchema(() => ["Too short", "Required"]));
    expect(validate(context({}))).toBe("Too short Required");
  });

  it("falls back when the schema reports no message", () => {
    const validate = zodValidator(fakeSchema(() => []), {
      fallbackMessage: "Nope",
    });
    expect(validate(context({}))).toBe("Nope");
  });

  it("accepts a schema whose issues are readonly", () => {
    // Schemas that freeze or `as const` their issue list must still be
    // assignable — this is what the demo's inline schema does.
    const frozen: StandardSchemaLike = {
      safeParse: () =>
        ({
          success: false,
          error: { issues: [{ message: "Frozen issue" }] },
        }) as const,
    };
    expect(zodValidator(frozen)(context({}))).toBe("Frozen issue");
  });

  it("only parses the picked slice", () => {
    let seen: unknown;
    const validate = zodValidator(
      fakeSchema((value) => {
        seen = value;
        return null;
      }),
      { pick: ["email"] }
    );

    validate(context({ email: "a@b.com", password: "secret", other: 1 }));
    expect(seen).toEqual({ email: "a@b.com" });
  });
});

describe("hookFormValidator", () => {
  const form = (errors: Record<string, unknown>): HookFormLike => ({
    formState: { errors },
  });

  it("passes when the watched fields have no errors", () => {
    const validate = hookFormValidator(form({ other: { message: "nope" } }), {
      fields: ["email"],
    });
    expect(validate(context({}))).toBe(true);
  });

  it("returns the field's error message", () => {
    const validate = hookFormValidator(
      form({ email: { message: "Email is required" } }),
      { fields: ["email"] }
    );
    expect(validate(context({}))).toBe("Email is required");
  });

  it("falls back when the error carries no message", () => {
    const validate = hookFormValidator(form({ email: { type: "required" } }), {
      fields: ["email"],
      fallbackMessage: "Check the form",
    });
    expect(validate(context({}))).toBe("Check the form");
  });

  it("considers every error when no fields are given", () => {
    const validate = hookFormValidator(form({ any: { message: "Bad" } }));
    expect(validate(context({}))).toBe("Bad");
  });
});

describe("composeValidators", () => {
  it("passes only when every validator passes", () => {
    const validate = composeValidators(
      () => true,
      () => true
    );
    expect(validate(context({}))).toBe(true);
  });

  it("returns the first failure", () => {
    const validate = composeValidators(
      () => true,
      () => "second failed",
      () => "third failed"
    );
    expect(validate(context({}))).toBe("second failed");
  });

  it("propagates a boolean false", () => {
    const validate = composeValidators(() => false);
    expect(validate(context({}))).toBe(false);
  });
});
