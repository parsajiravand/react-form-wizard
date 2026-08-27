import { render, screen } from "@testing-library/react";
import FormWizard, { TabContent } from "../../components/FormWizard";
import { tailwindPreset } from "../tailwind";

jest.mock("../../index.css", () => ({}));

const wizard = (props: Record<string, unknown> = {}) => (
  <FormWizard title="W" unstyled classNames={tailwindPreset()} {...props}>
    <TabContent title="One">First</TabContent>
    <TabContent title="Two">Second</TabContent>
  </FormWizard>
);

describe("tailwindPreset", () => {
  it("covers every class slot the wizard renders", () => {
    const preset = tailwindPreset();
    const slots = [
      "root", "header", "title", "subtitle", "navigation", "stepList",
      "step", "stepActive", "stepComplete", "stepInvalid", "stepTitle",
      "stepIcon", "content", "footer", "backButton", "nextButton",
      "finishButton",
    ] as const;

    const missing = slots.filter((key) => !preset[key]);
    expect(missing).toEqual([]);
  });

  it("emits only literal class names", () => {
    // Tailwind finds classes by scanning source text, so anything built by
    // string concatenation would never be generated. Guard against a future
    // edit reintroducing that.
    const preset = tailwindPreset();
    const all = Object.values(preset).join(" ");
    expect(all).not.toMatch(/\$\{|undefined|\[object/);
  });

  it("takes the accent from a CSS variable so it stays themeable", () => {
    const preset = tailwindPreset();
    expect(preset.nextButton).toContain("bg-[var(--rfw-primary)]");
    expect(preset.stepComplete).toContain("var(--rfw-primary)");
  });

  it("drops dark variants on request", () => {
    expect(tailwindPreset().content).toContain("dark:");
    expect(tailwindPreset({ dark: false }).content).not.toContain("dark:");
  });

  it("appends extend without dropping the preset classes", () => {
    const preset = tailwindPreset({ extend: { content: "p-10" } });
    expect(preset.content).toContain("rounded-xl");
    expect(preset.content).toContain("p-10");
  });

  it("keeps extend keys the preset does not style", () => {
    const preset = tailwindPreset({ extend: { header: "sr-only" } });
    expect(preset.header).toContain("sr-only");
  });

  it("applies to the rendered wizard in unstyled mode", () => {
    render(wizard());

    const root = screen.getByRole("region");
    expect(root).toHaveClass("flex");
    // unstyled means none of the bundled classes survive
    expect(root).not.toHaveClass("react-form-wizard");

    expect(screen.getByText("Next")).toHaveClass("bg-[var(--rfw-primary)]");
    expect(screen.getAllByRole("tab")[0]).toHaveClass("cursor-pointer");
  });

  it("marks the active step with the active slot", () => {
    render(wizard());
    const [first] = screen.getAllByRole("tab");
    expect(first).toHaveClass("text-slate-900");
  });
});
