import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ModeId = "full" | "custom" | "vault";

export type OnboardingState = {
  name: string;
  email: string;
  deviceId: string | null;
  paired: boolean;
  vaultReady: boolean;
  cloudBackup: boolean;
  mode: ModeId | null;
  signals: string[];
};

const initialState: OnboardingState = {
  name: "",
  email: "",
  deviceId: null,
  paired: false,
  vaultReady: false,
  cloudBackup: false,
  mode: null,
  signals: ["motion", "heart", "location"],
};

const STORAGE_KEY = "chronis.onboarding";

type Ctx = {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  reset: () => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState((s) => ({ ...s, ...(JSON.parse(raw) as Partial<OnboardingState>) }));
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ state, update, reset }), [state, update, reset]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}

/* ---------- realistic dummy data ---------- */

export const NEARBY_DEVICES = [
  {
    id: "CHR-7741-A",
    name: "Chronis Band · Graphite",
    firmware: "2.4.1",
    battery: 86,
    signal: -42,
    distance: "0.4 m",
    verified: true,
  },
  {
    id: "CHR-2298-B",
    name: "Chronis Band · Silver",
    firmware: "2.3.9",
    battery: 61,
    signal: -67,
    distance: "2.1 m",
    verified: true,
  },
  {
    id: "UNK-0043-X",
    name: "Unknown BLE Peripheral",
    firmware: "—",
    battery: 0,
    signal: -88,
    distance: "6.8 m",
    verified: false,
  },
];

export const RECOVERY_PHRASE = [
  "harbor",
  "lantern",
  "cobalt",
  "meadow",
  "signal",
  "quartz",
  "ember",
  "tundra",
  "violet",
  "anchor",
  "pixel",
  "orbit",
];

export const MODES = [
  {
    id: "full" as ModeId,
    name: "Full Dataset",
    tagline: "Complete memory, full AI",
    privacy: 55,
    learning: "4–6 months",
    recommended: true,
    summary:
      "Chronis captures the full sensor dataset and builds a complete personal memory model with the strongest recall quality.",
    points: [
      "All signals captured continuously",
      "Deepest AI personalisation",
      "End-to-end encrypted on device",
      "Full timeline reconstruction",
    ],
  },
  {
    id: "custom" as ModeId,
    name: "Custom Signals",
    tagline: "You pick what is captured",
    privacy: 78,
    learning: "6–9 months",
    recommended: false,
    summary:
      "Choose exactly which signal streams Chronis is allowed to record. Behavioural analysis adapts to what you enable.",
    points: [
      "Granular signal toggles",
      "Behavioural analysis on selected data",
      "Lower storage footprint",
      "Change selection anytime",
    ],
  },
  {
    id: "vault" as ModeId,
    name: "Raw Vault",
    tagline: "Storage only, no AI",
    privacy: 100,
    learning: "No learning",
    recommended: false,
    summary:
      "Everything is encrypted and stored, nothing is analysed. No model is ever trained on your memories.",
    points: [
      "Zero AI processing",
      "Encrypted archive only",
      "Manual search and export",
      "Maximum privacy posture",
    ],
  },
];

export const SIGNALS = [
  { id: "motion", label: "Motion & Activity", detail: "Accelerometer, gyroscope, step cadence" },
  { id: "audio", label: "Ambient Audio", detail: "On-device transcription, audio never uploaded" },
  { id: "heart", label: "Heart Rate", detail: "Continuous HR and variability" },
  { id: "location", label: "Location", detail: "Coarse geofence and place labels" },
  {
    id: "behaviour",
    label: "Behavioural Analysis",
    detail: "Routines, focus windows, sleep rhythm",
  },
];
