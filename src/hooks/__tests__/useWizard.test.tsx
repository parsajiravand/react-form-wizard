import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useWizard } from "../useWizard";

const STEPS = ["account", "profile", "review"];

describe("useWizard", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("starts on the first step and reports totals", () => {
    const { result } = renderHook(() => useWizard({ stepIds: STEPS }));

    expect(result.current.currentStep).toBe(0);
    expect(result.current.totalSteps).toBe(3);
    expect(result.current.stepId).toBe("account");
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it("moves forward and back without leaving the range", () => {
    const { result } = renderHook(() => useWizard({ stepIds: STEPS }));

    act(() => result.current.next());
    expect(result.current.currentStep).toBe(1);

    act(() => result.current.next());
    act(() => result.current.next()); // already last — must not overflow
    expect(result.current.currentStep).toBe(2);
    expect(result.current.isLastStep).toBe(true);

    act(() => result.current.previous());
    expect(result.current.currentStep).toBe(1);

    act(() => result.current.previous());
    act(() => result.current.previous()); // already first — must not underflow
    expect(result.current.currentStep).toBe(0);
  });

  it("clamps an out-of-range startIndex on the first render", () => {
    const { result } = renderHook(() =>
      useWizard({ stepIds: STEPS, startIndex: 99 })
    );

    expect(result.current.currentStep).toBe(2);
  });

  it("jumps to a step by id and ignores unknown ids", () => {
    const { result } = renderHook(() => useWizard({ stepIds: STEPS }));

    act(() => result.current.goToId("review"));
    expect(result.current.currentStep).toBe(2);

    act(() => result.current.goToId("does-not-exist"));
    expect(result.current.currentStep).toBe(2);
  });

  it("tracks the furthest step reached", () => {
    const { result } = renderHook(() => useWizard({ stepIds: STEPS }));

    act(() => result.current.goTo(2));
    act(() => result.current.goTo(0));

    expect(result.current.currentStep).toBe(0);
    expect(result.current.maxVisitedStep).toBe(2);
  });

  it("merges patches with updateData and replaces with setData", () => {
    const { result } = renderHook(() =>
      useWizard({ stepIds: STEPS, initialData: { plan: "basic" } })
    );

    act(() => result.current.updateData({ email: "a@b.com" }));
    expect(result.current.data).toEqual({ plan: "basic", email: "a@b.com" });

    act(() => result.current.setData({ only: true }));
    expect(result.current.data).toEqual({ only: true });
  });

  it("reports step changes but not the initial mount", () => {
    const onStepChange = jest.fn();
    const { result } = renderHook(() =>
      useWizard({ stepIds: STEPS, onStepChange })
    );

    expect(onStepChange).not.toHaveBeenCalled();

    act(() => result.current.next());
    expect(onStepChange).toHaveBeenCalledWith({
      prevIndex: 0,
      nextIndex: 1,
      stepId: "profile",
    });
  });

  it("persists data to sessionStorage and restores it", () => {
    const first = renderHook(() =>
      useWizard({ stepIds: STEPS, persist: { key: "signup" } })
    );

    act(() => first.result.current.updateData({ email: "a@b.com" }));
    first.unmount();

    const second = renderHook(() =>
      useWizard({ stepIds: STEPS, persist: { key: "signup" } })
    );
    expect(second.result.current.data).toEqual({ email: "a@b.com" });

    act(() => second.result.current.clearPersisted());
    expect(window.sessionStorage.getItem("signup")).toBeNull();
  });

  it("honours a controlled data prop", () => {
    const onDataChange = jest.fn();
    const { result } = renderHook(() =>
      useWizard({ stepIds: STEPS, data: { locked: true }, onDataChange })
    );

    act(() => result.current.updateData({ extra: 1 }));

    // Controlled: internal state must not drift from the prop.
    expect(result.current.data).toEqual({ locked: true });
    expect(onDataChange).toHaveBeenCalledWith({ locked: true, extra: 1 });
  });

  it("drives a hand-rolled headless wizard", async () => {
    const Headless = () => {
      const wizard = useWizard({ stepIds: STEPS });
      return (
        <div>
          <p>
            Step {wizard.currentStep + 1} of {wizard.totalSteps}
          </p>
          <span>{wizard.stepId}</span>
          <button onClick={wizard.next} disabled={wizard.isLastStep}>
            Continue
          </button>
        </div>
      );
    };

    render(<Headless />);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("account")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("profile")).toBeInTheDocument();
  });
});
