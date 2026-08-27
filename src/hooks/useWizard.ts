import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  UseWizardOptions,
  UseWizardReturn,
  WizardData,
  WizardPersistOptions,
  WizardStepChangeEvent,
  WizardUrlSyncOptions,
} from "../types/FormWizard.js";

/* ------------------------------------------------------------------ *
 * storage helpers — all best-effort; private mode and quota errors
 * must never break a form.
 * ------------------------------------------------------------------ */

const getStore = (storage: "session" | "local"): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return storage === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

const readStored = (key: string, storage: "session" | "local"): WizardData | null => {
  try {
    const raw = getStore(storage)?.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as WizardData) : null;
  } catch {
    return null;
  }
};

const writeStored = (key: string, storage: "session" | "local", value: WizardData) => {
  try {
    getStore(storage)?.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage blocked */
  }
};

const readUrlStep = (param: string): number | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = new URLSearchParams(window.location.search).get(param);
    if (raw === null) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
};

const resolveUrlParam = (
  syncToUrl: boolean | WizardUrlSyncOptions | undefined
): string => {
  if (syncToUrl === true || syncToUrl === undefined || syncToUrl === false) {
    return "step";
  }
  return syncToUrl.param ?? "step";
};

/* ------------------------------------------------------------------ *
 * data
 * ------------------------------------------------------------------ */

export interface UseWizardDataOptions {
  initialData?: WizardData;
  data?: WizardData;
  onDataChange?: (nextData: WizardData) => void;
  persist?: WizardPersistOptions;
}

export interface UseWizardDataReturn {
  data: WizardData;
  setData: (data: WizardData) => void;
  updateData: (patch: WizardData) => void;
  clearPersisted: () => void;
}

/**
 * Owns the wizard's shared form data. Supports controlled use (`data` prop),
 * uncontrolled use with `initialData`, and optional persistence.
 *
 * Split out from the cursor so `<FormWizard />` can read data first, derive
 * which steps are visible from it, and only then size the cursor.
 */
export function useWizardData(
  options: UseWizardDataOptions = {}
): UseWizardDataReturn {
  const { initialData, data: controlledData, onDataChange, persist } = options;

  const persistKey = persist?.key;
  const persistStorage = persist?.storage ?? "session";

  // Seeded once; later `initialData` changes are ignored, matching how React
  // treats defaultValue on inputs.
  const [uncontrolledData, setUncontrolledData] = useState<WizardData>(() => {
    const seed = initialData ?? {};
    if (persistKey) {
      const stored = readStored(persistKey, persistStorage);
      if (stored) return { ...seed, ...stored };
    }
    return seed;
  });

  const isControlled = controlledData !== undefined;
  const data = isControlled ? controlledData : uncontrolledData;

  const dataRef = useRef(data);
  dataRef.current = data;

  const commit = useCallback(
    (next: WizardData) => {
      if (!isControlled) setUncontrolledData(next);
      if (persistKey) writeStored(persistKey, persistStorage, next);
      onDataChange?.(next);
    },
    [isControlled, persistKey, persistStorage, onDataChange]
  );

  const setData = useCallback((next: WizardData) => commit(next), [commit]);

  const updateData = useCallback(
    (patch: WizardData) => commit({ ...dataRef.current, ...patch }),
    [commit]
  );

  const clearPersisted = useCallback(() => {
    if (!persistKey) return;
    try {
      getStore(persistStorage)?.removeItem(persistKey);
    } catch {
      /* best-effort */
    }
  }, [persistKey, persistStorage]);

  return useMemo(
    () => ({ data, setData, updateData, clearPersisted }),
    [data, setData, updateData, clearPersisted]
  );
}

/* ------------------------------------------------------------------ *
 * cursor
 * ------------------------------------------------------------------ */

export interface UseWizardCursorOptions {
  stepIds?: string[];
  startIndex?: number;
  onStepChange?: (event: WizardStepChangeEvent) => void;
  syncToUrl?: boolean | WizardUrlSyncOptions;
}

export interface UseWizardCursorReturn {
  currentStep: number;
  maxVisitedStep: number;
  totalSteps: number;
  stepId?: string;
  isFirstStep: boolean;
  isLastStep: boolean;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  goToId: (id: string) => void;
  reset: () => void;
  activateAll: () => void;
}

/**
 * Owns the step cursor: which step is active, the furthest step reached, and
 * every way of moving between them.
 */
export function useWizardCursor(
  options: UseWizardCursorOptions = {}
): UseWizardCursorReturn {
  const { stepIds = [], startIndex = 0, onStepChange, syncToUrl } = options;

  const totalSteps = stepIds.length;
  const urlEnabled = Boolean(syncToUrl);
  const urlParam = resolveUrlParam(syncToUrl);

  const clamp = useCallback(
    (index: number) => {
      if (totalSteps === 0) return 0;
      return Math.min(Math.max(index, 0), totalSteps - 1);
    },
    [totalSteps]
  );

  // Clamped at init (not just in an effect) so the first paint already shows a
  // valid step rather than an empty panel.
  const [currentStep, setCurrentStep] = useState(() => {
    const requested = urlEnabled
      ? readUrlStep(urlParam) !== null
        ? (readUrlStep(urlParam) as number) - 1
        : startIndex
      : startIndex;
    const safe = Math.max(0, requested);
    if (stepIds.length === 0) return 0;
    return Math.min(safe, stepIds.length - 1);
  });

  const [maxVisitedStep, setMaxVisitedStep] = useState(currentStep);

  // Conditional steps can disappear underneath the cursor.
  useEffect(() => {
    if (totalSteps === 0) return;
    if (currentStep > totalSteps - 1) setCurrentStep(totalSteps - 1);
  }, [currentStep, totalSteps]);

  useEffect(() => {
    setMaxVisitedStep((prev) => (currentStep > prev ? currentStep : prev));
  }, [currentStep]);

  // Skip the initial mount so consumers never see a 0 -> 0 transition.
  const previousStep = useRef(currentStep);
  const mounted = useRef(false);
  const stepIdsRef = useRef(stepIds);
  stepIdsRef.current = stepIds;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      previousStep.current = currentStep;
      return;
    }
    if (previousStep.current === currentStep) return;
    const prevIndex = previousStep.current;
    previousStep.current = currentStep;
    onStepChange?.({
      prevIndex,
      nextIndex: currentStep,
      stepId: stepIdsRef.current[currentStep],
    });
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (!urlEnabled || typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set(urlParam, String(currentStep + 1));
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      /* history unavailable (sandboxed iframe) */
    }
  }, [currentStep, urlEnabled, urlParam]);

  const goTo = useCallback((index: number) => setCurrentStep(clamp(index)), [clamp]);

  const goToId = useCallback(
    (id: string) => {
      const index = stepIdsRef.current.indexOf(id);
      if (index !== -1) setCurrentStep(clamp(index));
    },
    [clamp]
  );

  const next = useCallback(() => {
    setCurrentStep((prev) =>
      totalSteps === 0 ? 0 : Math.min(prev + 1, totalSteps - 1)
    );
  }, [totalSteps]);

  const previous = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    const target = clamp(Math.max(0, startIndex));
    setCurrentStep(target);
    setMaxVisitedStep(target);
  }, [startIndex, clamp]);

  const activateAll = useCallback(() => {
    setMaxVisitedStep(Math.max(0, totalSteps - 1));
  }, [totalSteps]);

  return useMemo(
    () => ({
      currentStep,
      maxVisitedStep,
      totalSteps,
      stepId: stepIds[currentStep],
      isFirstStep: currentStep === 0,
      isLastStep: totalSteps === 0 || currentStep === totalSteps - 1,
      next,
      previous,
      goTo,
      goToId,
      reset,
      activateAll,
    }),
    [
      currentStep,
      maxVisitedStep,
      totalSteps,
      stepIds,
      next,
      previous,
      goTo,
      goToId,
      reset,
      activateAll,
    ]
  );
}

/* ------------------------------------------------------------------ *
 * public headless API
 * ------------------------------------------------------------------ */

/**
 * Headless wizard state machine — no markup, no styling, no CSS import.
 *
 * `<FormWizard />` is built from the same two hooks this composes, so both
 * APIs behave identically. Reach for this when you want your own markup.
 *
 * @example
 * const wizard = useWizard({
 *   stepIds: ["account", "profile", "review"],
 *   persist: { key: "signup" },
 * });
 *
 * return (
 *   <>
 *     <p>Step {wizard.currentStep + 1} of {wizard.totalSteps}</p>
 *     {wizard.stepId === "account" && <AccountFields wizard={wizard} />}
 *     <button onClick={wizard.previous} disabled={wizard.isFirstStep}>Back</button>
 *     <button onClick={wizard.next} disabled={wizard.isLastStep}>Next</button>
 *   </>
 * );
 */
export function useWizard(options: UseWizardOptions = {}): UseWizardReturn {
  const {
    stepIds,
    startIndex,
    initialData,
    data,
    onDataChange,
    onStepChange,
    persist,
    syncToUrl,
  } = options;

  const dataApi = useWizardData({ initialData, data, onDataChange, persist });
  const cursor = useWizardCursor({ stepIds, startIndex, onStepChange, syncToUrl });

  return useMemo(
    () => ({ ...cursor, ...dataApi }),
    [cursor, dataApi]
  );
}

export default useWizard;
