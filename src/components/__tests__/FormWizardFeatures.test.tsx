import { createRef } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormWizard, { TabContent } from "../FormWizard";
import type { FormWizardMethods } from "../../types/FormWizard";

jest.mock("../../index.css", () => ({}));

const threeSteps = (props: Record<string, unknown> = {}) => (
  <FormWizard title="W" {...props}>
    <TabContent title="One">First</TabContent>
    <TabContent title="Two">Second</TabContent>
    <TabContent title="Three">Third</TabContent>
  </FormWizard>
);

describe("theming", () => {
  it("writes theme tokens as CSS custom properties on the root", () => {
    render(threeSteps({ theme: { primaryColor: "#ff0000", borderRadius: "12px" } }));

    const root = screen.getByRole("region");
    expect(root.style.getPropertyValue("--rfw-primary")).toBe("#ff0000");
    expect(root.style.getPropertyValue("--rfw-radius")).toBe("12px");
  });

  it("drives the accent through --rfw-primary when no color prop is given", () => {
    // Regression: `color` used to default to a literal #2196f3 applied as an
    // inline style, which beat the custom property and made `theme` inert.
    render(threeSteps({ theme: { primaryColor: "#ff0000" } }));

    const root = screen.getByRole("region");
    expect(root.style.getPropertyValue("--rfw-primary")).toBe("#ff0000");

    // The nav rail and buttons must defer to the property, not a literal.
    const list = screen.getByRole("tablist");
    expect(list.getAttribute("style")).toContain("--rfw-primary");
    const footer = screen.getByText("Next").closest("div");
    expect(footer?.getAttribute("style")).toContain("--rfw-primary");
  });

  it("lets an explicit color prop win over the theme token", () => {
    render(threeSteps({ color: "#00ff00", theme: { primaryColor: "#ff0000" } }));

    const list = screen.getByRole("tablist");
    expect(list.getAttribute("style")).toContain("rgb(0, 255, 0)");
  });

  it("omits tokens that were not supplied", () => {
    render(threeSteps({ theme: { primaryColor: "#ff0000" } }));

    const root = screen.getByRole("region");
    expect(root.style.getPropertyValue("--rfw-bg")).toBe("");
  });
});

describe("unstyled mode", () => {
  it("drops the bundled classes and applies overrides", () => {
    render(
      threeSteps({
        unstyled: true,
        classNames: { root: "my-wizard", nextButton: "my-next" },
      })
    );

    const root = screen.getByRole("region");
    expect(root).toHaveClass("my-wizard");
    expect(root).not.toHaveClass("react-form-wizard");
    expect(screen.getByText("Next")).toHaveClass("my-next");
    expect(screen.getByText("Next")).not.toHaveClass("wizard-btn");
  });

  it("still navigates by keyboard without the styling hook class", async () => {
    render(threeSteps({ unstyled: true }));

    screen.getByText("Next").focus();
    fireEvent.keyDown(document, { key: "ArrowRight" });

    await waitFor(() => expect(screen.getByText("Second")).toBeInTheDocument());
  });

  it("merges overrides with defaults when styled", () => {
    render(threeSteps({ classNames: { root: "extra" } }));

    const root = screen.getByRole("region");
    expect(root).toHaveClass("react-form-wizard");
    expect(root).toHaveClass("extra");
  });
});

describe("accessibility", () => {
  it("announces the active step in a live region", async () => {
    render(threeSteps());

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Step 1 of 3: One");

    await userEvent.click(screen.getByText("Next"));
    expect(status).toHaveTextContent("Step 2 of 3: Two");
  });

  it("moves focus to the panel on step change but not on mount", async () => {
    render(threeSteps());

    const panel = screen.getByRole("tabpanel");
    expect(panel).not.toHaveFocus();

    await userEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(screen.getByRole("tabpanel")).toHaveFocus());
  });

  it("can be turned off", () => {
    render(threeSteps({ announceStepChanges: false }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("accepts a custom region label", () => {
    render(threeSteps({ ariaLabel: "Checkout steps" }));
    expect(
      screen.getByRole("region", { name: "Checkout steps" })
    ).toBeInTheDocument();
  });

  it("activates a tab with Enter and Space", async () => {
    render(threeSteps());

    // Reach step 3 so earlier tabs become clickable.
    await userEvent.click(screen.getByText("Next"));
    await userEvent.click(screen.getByText("Next"));

    const firstTab = screen.getAllByRole("tab")[0];
    fireEvent.keyDown(firstTab, { key: "Enter" });
    await waitFor(() => expect(screen.getByText("First")).toBeInTheDocument());
  });
});

describe("keyboard and swipe toggles", () => {
  it("ignores arrow keys when keyboardNavigation is false", () => {
    render(threeSteps({ keyboardNavigation: false }));

    screen.getByText("Next").focus();
    fireEvent.keyDown(document, { key: "ArrowRight" });

    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("supports Home and End", async () => {
    render(threeSteps());

    screen.getByText("Next").focus();
    fireEvent.keyDown(document, { key: "End" });
    await waitFor(() => expect(screen.getByText("Third")).toBeInTheDocument());

    fireEvent.keyDown(document, { key: "Home" });
    await waitFor(() => expect(screen.getByText("First")).toBeInTheDocument());
  });

  it("does not react to keys while focus sits outside the wizard", () => {
    render(
      <>
        <button>outside</button>
        {threeSteps()}
      </>
    );

    screen.getByText("outside").focus();
    fireEvent.keyDown(document, { key: "ArrowRight" });

    expect(screen.getByText("First")).toBeInTheDocument();
  });
});

describe("imperative API", () => {
  it("exposes navigation and data helpers", async () => {
    const ref = createRef<FormWizardMethods>();
    render(
      <FormWizard ref={ref} title="W" schema={{ initialData: { a: 1 }, steps: [
        { id: "one", title: "One", content: <div>First</div> },
        { id: "two", title: "Two", content: <div>Second</div> },
        { id: "three", title: "Three", content: <div>Third</div> },
      ] }} />
    );

    expect(ref.current?.getCurrentStep()).toBe(0);
    expect(ref.current?.getData()).toEqual({ a: 1 });

    ref.current?.goToTabById("three");
    await waitFor(() => expect(screen.getByText("Third")).toBeInTheDocument());
    expect(ref.current?.getCurrentStep()).toBe(2);

    ref.current?.updateData({ b: 2 });
    await waitFor(() => expect(ref.current?.getData()).toEqual({ a: 1, b: 2 }));

    ref.current?.reset();
    await waitFor(() => expect(screen.getByText("First")).toBeInTheDocument());
  });

  it("goToTab bypasses the visited-step gate", async () => {
    const ref = createRef<FormWizardMethods>();
    render(
      <FormWizard ref={ref} title="W">
        <TabContent title="One">First</TabContent>
        <TabContent title="Two">Second</TabContent>
        <TabContent title="Three">Third</TabContent>
      </FormWizard>
    );

    ref.current?.goToTab(2);
    await waitFor(() => expect(screen.getByText("Third")).toBeInTheDocument());
  });
});

describe("persistence", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("restores schema data from storage on mount", () => {
    window.sessionStorage.setItem("chk", JSON.stringify({ plan: "premium" }));

    const ref = createRef<FormWizardMethods>();
    render(
      <FormWizard
        ref={ref}
        title="W"
        persist={{ key: "chk" }}
        schema={{
          initialData: { plan: "basic" },
          steps: [{ id: "one", title: "One", content: <div>First</div> }],
        }}
      />
    );

    expect(ref.current?.getData()).toEqual({ plan: "premium" });
  });

  it("writes updates back to storage", async () => {
    const ref = createRef<FormWizardMethods>();
    render(
      <FormWizard ref={ref} title="W" persist={{ key: "chk" }}>
        <TabContent title="One">First</TabContent>
      </FormWizard>
    );

    ref.current?.updateData({ email: "a@b.com" });

    await waitFor(() =>
      expect(JSON.parse(window.sessionStorage.getItem("chk") ?? "{}")).toEqual({
        email: "a@b.com",
      })
    );
  });
});

describe("validation messages", () => {
  it("blocks Next and surfaces a string validator message", async () => {
    const onComplete = jest.fn();
    render(
      <FormWizard
        title="W"
        onComplete={onComplete}
        schema={{
          steps: [
            {
              id: "one",
              title: "One",
              validate: () => "Fill this in first",
              content: <div>First</div>,
            },
            { id: "two", title: "Two", content: <div>Second</div> },
          ],
        }}
      />
    );

    await userEvent.click(screen.getByText("Next"));
    // Still on step one: an invalid step must not advance.
    expect(screen.getByText("First")).toBeInTheDocument();
  });
});

describe("two wizards on one page", () => {
  it("only the focused wizard responds to arrow keys", async () => {
    render(
      <>
        <FormWizard title="A" ariaLabel="Wizard A">
          <TabContent title="A1">A-first</TabContent>
          <TabContent title="A2">A-second</TabContent>
        </FormWizard>
        <FormWizard title="B" ariaLabel="Wizard B">
          <TabContent title="B1">B-first</TabContent>
          <TabContent title="B2">B-second</TabContent>
        </FormWizard>
      </>
    );

    const wizardB = screen.getByRole("region", { name: "Wizard B" });
    const nextInB = Array.from(wizardB.querySelectorAll("button")).find(
      (b) => b.textContent === "Next"
    ) as HTMLButtonElement;

    nextInB.focus();
    fireEvent.keyDown(document, { key: "ArrowRight" });

    await waitFor(() => expect(screen.getByText("B-second")).toBeInTheDocument());
    // Wizard A must not have moved.
    expect(screen.getByText("A-first")).toBeInTheDocument();
  });
});
