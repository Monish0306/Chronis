import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SignalId = "motion" | "audio" | "heart" | "location" | "behaviour";

export type AppState = {
  signals: Record<SignalId, boolean>;
  privacyPauseUntil: number | null;
  favorites: string[];
  notifications: {
    dailySummary: boolean;
    weeklyReport: boolean;
    aiInsights: boolean;
    milestones: boolean;
    timeCapsule: boolean;
    reminderTime: string;
  };
  removedDevices: string[];
  daysActive: number;
};

const initialAppState: AppState = {
  signals: { motion: true, audio: false, heart: true, location: true, behaviour: true },
  privacyPauseUntil: null,
  favorites: ["m-004", "m-009"],
  notifications: {
    dailySummary: true,
    weeklyReport: true,
    aiInsights: true,
    milestones: true,
    timeCapsule: false,
    reminderTime: "21:30",
  },
  removedDevices: [],
  daysActive: 42,
};

const STORAGE_KEY = "chronis.app";

type Ctx = {
  app: AppState;
  update: (patch: Partial<AppState>) => void;
  setSignal: (id: SignalId, value: boolean) => void;
  toggleFavorite: (id: string) => void;
  hydrated: boolean;
};

const ChronisContext = createContext<Ctx | null>(null);

export function ChronisProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<AppState>(initialAppState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setApp((s) => ({ ...s, ...(JSON.parse(raw) as Partial<AppState>) }));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<AppState>) => {
    setApp((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setSignal = useCallback((id: SignalId, value: boolean) => {
    setApp((prev) => {
      const next = { ...prev, signals: { ...prev.signals, [id]: value } };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setApp((prev) => {
      const favorites = prev.favorites.includes(id)
        ? prev.favorites.filter((f) => f !== id)
        : [...prev.favorites, id];
      const next = { ...prev, favorites };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ app, update, setSignal, toggleFavorite, hydrated }),
    [app, update, setSignal, toggleFavorite, hydrated],
  );

  return <ChronisContext.Provider value={value}>{children}</ChronisContext.Provider>;
}

export function useChronis() {
  const ctx = useContext(ChronisContext);
  if (!ctx) throw new Error("useChronis must be used inside ChronisProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Dummy data                                                         */
/* ------------------------------------------------------------------ */

export const LEARNING_TARGET_DAYS = 120;

export const DEVICE = {
  id: "CHR-7741-A",
  name: "Chronis Band · Graphite",
  firmware: "2.4.1",
  battery: 78,
  storage: 41,
  temperature: "31.4°C",
  lastSync: "3 minutes ago",
  health: 96,
};

export const CONNECTED_DEVICES = [
  {
    id: "IPH-2210",
    name: "iPhone 15 Pro",
    kind: "Companion phone",
    lastSync: "3 minutes ago",
    current: true,
  },
  {
    id: "MBP-8841",
    name: "MacBook Pro 14”",
    kind: "Desktop vault client",
    lastSync: "2 hours ago",
    current: false,
  },
  {
    id: "IPD-5512",
    name: "iPad Air",
    kind: "Read-only viewer",
    lastSync: "Yesterday, 22:10",
    current: false,
  },
];

export const TODAY_STATS = [
  { label: "Moments captured", value: "34", delta: "+6 vs yesterday" },
  { label: "Active capture", value: "9h 12m", delta: "82% of waking hours" },
  { label: "Avg heart rate", value: "68 bpm", delta: "−3 bpm vs 7-day" },
  { label: "Focus windows", value: "4", delta: "2h 40m deep work" },
];

export const WEEK_SERIES = [
  { day: "Mon", moments: 28, focus: 130, mood: 62 },
  { day: "Tue", moments: 34, focus: 168, mood: 71 },
  { day: "Wed", moments: 22, focus: 96, mood: 58 },
  { day: "Thu", moments: 41, focus: 184, mood: 76 },
  { day: "Fri", moments: 37, focus: 152, mood: 80 },
  { day: "Sat", moments: 19, focus: 48, mood: 84 },
  { day: "Sun", moments: 24, focus: 62, mood: 78 },
];

export const LIFE_BALANCE = [
  { area: "Work", value: 82 },
  { area: "Health", value: 68 },
  { area: "Social", value: 54 },
  { area: "Rest", value: 61 },
  { area: "Learning", value: 73 },
  { area: "Creative", value: 47 },
];

export const WELLNESS = [
  { label: "Sleep quality", value: 76, note: "6h 52m average this week" },
  { label: "Stress load", value: 38, note: "Lower than your baseline" },
  { label: "Movement", value: 64, note: "7,940 steps daily average" },
  { label: "Recovery", value: 71, note: "HRV trending upward" },
];

export const AI_INSIGHTS = [
  {
    id: "i-1",
    title: "Your best focus window is 09:20–11:10",
    body: "Across 18 days, deep work started strongest mid-morning. Meetings after 15:00 fragment your attention.",
    confidence: 92,
    tag: "Productivity",
  },
  {
    id: "i-2",
    title: "Evening walks improve next-day recovery",
    body: "On days with a walk after 19:00, your morning HRV was 12% higher and sleep latency dropped by 9 minutes.",
    confidence: 84,
    tag: "Wellness",
  },
  {
    id: "i-3",
    title: "Social contact dipped this week",
    body: "Conversational moments fell 31% versus your 4-week average. Saturdays are your natural reconnect day.",
    confidence: 71,
    tag: "Social",
  },
];

export const SMART_SUGGESTIONS = [
  {
    id: "s-1",
    text: "Schedule deep work at 09:30 tomorrow",
    why: "Matches your peak focus window",
  },
  {
    id: "s-2",
    text: "Create a Time Capsule for day 100",
    why: "You are 58 days away from the milestone",
  },
  {
    id: "s-3",
    text: "Enable ambient audio for richer summaries",
    why: "Currently disabled — summaries lack context",
  },
];

export const RECENT_ACTIVITY = [
  { id: "a-1", text: "Daily summary generated", time: "12 min ago", kind: "ai" },
  { id: "a-2", text: "Vault synced · 34 encrypted moments", time: "1 h ago", kind: "sync" },
  { id: "a-3", text: "Heart rate signal re-enabled", time: "3 h ago", kind: "privacy" },
  {
    id: "a-4",
    text: "Milestone reached · 40 days of memory",
    time: "Yesterday",
    kind: "milestone",
  },
];

export type Moment = {
  id: string;
  day: number;
  date: string;
  time: string;
  duration: string;
  type: "Work" | "Movement" | "Social" | "Rest" | "Learning" | "Travel";
  importance: "high" | "medium" | "low";
  title: string;
  summary: string;
  emotion: { label: string; score: number; palette: { label: string; value: number }[] };
  observation: string;
  related: string[];
  journey: string[];
  chapter: string;
};

export const MOMENTS: Moment[] = [
  {
    id: "m-001",
    day: 42,
    date: "Today",
    time: "08:10",
    duration: "42 min",
    type: "Movement",
    importance: "medium",
    title: "Morning run along the river",
    summary:
      "A steady 5.4 km run at an easy pace. Heart rate stayed in zone 2 for 84% of the session with a strong finish.",
    emotion: {
      label: "Energised",
      score: 78,
      palette: [
        { label: "Calm", value: 46 },
        { label: "Energy", value: 78 },
        { label: "Focus", value: 62 },
        { label: "Stress", value: 18 },
      ],
    },
    observation:
      "Runs before 08:30 consistently precede your highest-focus mornings. This is the 11th such pairing.",
    related: ["m-006", "m-009"],
    journey: ["First tracked run · Day 4", "Longest run · Day 26", "Today · Day 42"],
    chapter: "Building the routine",
  },
  {
    id: "m-002",
    day: 42,
    date: "Today",
    time: "09:35",
    duration: "1 h 48 m",
    type: "Work",
    importance: "high",
    title: "Deep work block — product architecture",
    summary:
      "Uninterrupted session with only two short context switches. Longest sustained focus stretch recorded this week.",
    emotion: {
      label: "Focused",
      score: 88,
      palette: [
        { label: "Calm", value: 62 },
        { label: "Energy", value: 70 },
        { label: "Focus", value: 88 },
        { label: "Stress", value: 27 },
      ],
    },
    observation:
      "Focus quality is 23% higher when this block follows physical activity within 90 minutes.",
    related: ["m-001", "m-005"],
    journey: ["First deep block · Day 2", "Focus record · Day 31", "Today · Day 42"],
    chapter: "Building the routine",
  },
  {
    id: "m-003",
    day: 42,
    date: "Today",
    time: "13:05",
    duration: "55 min",
    type: "Social",
    importance: "medium",
    title: "Lunch with the design team",
    summary:
      "Relaxed conversation covering the new onboarding direction. Ambient tone was warm and collaborative.",
    emotion: {
      label: "Warm",
      score: 74,
      palette: [
        { label: "Calm", value: 71 },
        { label: "Energy", value: 66 },
        { label: "Focus", value: 41 },
        { label: "Stress", value: 15 },
      ],
    },
    observation: "Midday social contact correlates with a 14% lower afternoon stress reading.",
    related: ["m-007"],
    journey: ["First team lunch · Day 8", "Today · Day 42"],
    chapter: "Building the routine",
  },
  {
    id: "m-004",
    day: 41,
    date: "Yesterday",
    time: "19:40",
    duration: "2 h 05 m",
    type: "Learning",
    importance: "high",
    title: "Evening study — cryptography fundamentals",
    summary:
      "Long, steady reading session with high retention markers. You revisited key exchange concepts three times.",
    emotion: {
      label: "Absorbed",
      score: 81,
      palette: [
        { label: "Calm", value: 68 },
        { label: "Energy", value: 52 },
        { label: "Focus", value: 84 },
        { label: "Stress", value: 22 },
      ],
    },
    observation: "Your longest evening learning streak so far: 6 consecutive days.",
    related: ["m-008"],
    journey: ["Started topic · Day 33", "Streak begins · Day 36", "Yesterday · Day 41"],
    chapter: "Deepening the craft",
  },
  {
    id: "m-005",
    day: 40,
    date: "2 days ago",
    time: "10:15",
    duration: "1 h 12 m",
    type: "Work",
    importance: "medium",
    title: "Architecture review call",
    summary:
      "Collaborative review with moderate interruptions. Decisions were reached in the final 20 minutes.",
    emotion: {
      label: "Engaged",
      score: 66,
      palette: [
        { label: "Calm", value: 48 },
        { label: "Energy", value: 64 },
        { label: "Focus", value: 69 },
        { label: "Stress", value: 41 },
      ],
    },
    observation:
      "Meetings longer than an hour reduce your following focus block by an average of 18 minutes.",
    related: ["m-002"],
    journey: ["First review · Day 12", "2 days ago · Day 40"],
    chapter: "Deepening the craft",
  },
  {
    id: "m-006",
    day: 36,
    date: "6 days ago",
    time: "07:50",
    duration: "1 h 04 m",
    type: "Movement",
    importance: "low",
    title: "Long weekend hike",
    summary:
      "Gentle elevation gain with a sustained low heart rate. Recovery markers peaked the following morning.",
    emotion: {
      label: "Calm",
      score: 85,
      palette: [
        { label: "Calm", value: 85 },
        { label: "Energy", value: 58 },
        { label: "Focus", value: 44 },
        { label: "Stress", value: 9 },
      ],
    },
    observation: "Outdoor time above 60 minutes is your strongest predictor of next-day mood.",
    related: ["m-001"],
    journey: ["First hike · Day 15", "6 days ago · Day 36"],
    chapter: "Finding balance",
  },
  {
    id: "m-007",
    day: 28,
    date: "14 days ago",
    time: "20:20",
    duration: "3 h 10 m",
    type: "Social",
    importance: "high",
    title: "Birthday dinner with close friends",
    summary:
      "A long, high-warmth gathering. One of the most positive emotional signatures recorded since setup.",
    emotion: {
      label: "Joyful",
      score: 94,
      palette: [
        { label: "Calm", value: 62 },
        { label: "Energy", value: 88 },
        { label: "Focus", value: 33 },
        { label: "Stress", value: 8 },
      ],
    },
    observation: "This remains your highest-rated memory. Chronis flagged it as a life milestone.",
    related: ["m-003"],
    journey: ["Planning · Day 24", "The evening · Day 28"],
    chapter: "Finding balance",
  },
  {
    id: "m-008",
    day: 19,
    date: "23 days ago",
    time: "15:30",
    duration: "48 min",
    type: "Travel",
    importance: "medium",
    title: "Train journey to the coast",
    summary:
      "Quiet transit with reading and light note-taking. Location signal shows a 92 km route.",
    emotion: {
      label: "Reflective",
      score: 69,
      palette: [
        { label: "Calm", value: 79 },
        { label: "Energy", value: 40 },
        { label: "Focus", value: 57 },
        { label: "Stress", value: 14 },
      ],
    },
    observation: "Travel time is where 38% of your reading happens.",
    related: ["m-004"],
    journey: ["First trip · Day 19"],
    chapter: "First impressions",
  },
  {
    id: "m-009",
    day: 7,
    date: "35 days ago",
    time: "18:00",
    duration: "26 min",
    type: "Rest",
    importance: "high",
    title: "First week complete",
    summary:
      "Chronis finished its first calibration week. Baselines for heart rate, movement and routine were established.",
    emotion: {
      label: "Settled",
      score: 72,
      palette: [
        { label: "Calm", value: 76 },
        { label: "Energy", value: 45 },
        { label: "Focus", value: 50 },
        { label: "Stress", value: 20 },
      ],
    },
    observation: "Baseline calibration completed 2 days earlier than typical.",
    related: ["m-001"],
    journey: ["Setup · Day 1", "Calibration complete · Day 7"],
    chapter: "First impressions",
  },
  {
    id: "m-010",
    day: 1,
    date: "41 days ago",
    time: "11:20",
    duration: "18 min",
    type: "Rest",
    importance: "high",
    title: "Day 1 — Chronis activated",
    summary: "Your vault was created, the band paired and the first encrypted moment was written.",
    emotion: {
      label: "Curious",
      score: 65,
      palette: [
        { label: "Calm", value: 60 },
        { label: "Energy", value: 62 },
        { label: "Focus", value: 55 },
        { label: "Stress", value: 25 },
      ],
    },
    observation: "Every memory in your timeline traces back to this moment.",
    related: [],
    journey: ["Vault created · Day 1"],
    chapter: "First impressions",
  },
];

export const CHAPTERS = [
  { name: "First impressions", range: "Day 1 – 19", moments: 3 },
  { name: "Finding balance", range: "Day 20 – 36", moments: 2 },
  { name: "Deepening the craft", range: "Day 37 – 41", moments: 2 },
  { name: "Building the routine", range: "Day 42 – today", moments: 3 },
];

export const TIME_CAPSULES = [
  { id: "tc-1", title: "Letter to future me", unlocks: "Day 100", daysLeft: 58, locked: true },
  { id: "tc-2", title: "First month reflection", unlocks: "Day 30", daysLeft: 0, locked: false },
];

export const GOALS = [
  { id: "g-1", name: "Reach 100 days of memory", progress: 42, target: 100, unit: "days" },
  { id: "g-2", name: "Sustain a 6-day learning streak", progress: 6, target: 6, unit: "days" },
  { id: "g-3", name: "Average 7h sleep", progress: 6.9, target: 7, unit: "h" },
];

export const SIGNAL_META: Record<
  SignalId,
  { label: string; detail: string; why: string; ifDisabled: string }
> = {
  motion: {
    label: "Motion & Activity",
    detail: "Accelerometer, gyroscope, step cadence",
    why: "Detects when a moment starts and ends, and separates rest from activity.",
    ifDisabled:
      "Moment boundaries become approximate, and movement and wellness charts stop updating.",
  },
  audio: {
    label: "Ambient Audio",
    detail: "On-device transcription, audio never leaves the band",
    why: "Adds conversational context so daily summaries describe what actually happened.",
    ifDisabled: "Summaries lose conversational detail and social moments may be missed entirely.",
  },
  heart: {
    label: "Heart Rate",
    detail: "Continuous HR and variability",
    why: "Powers emotion analysis, stress load and recovery scoring.",
    ifDisabled: "Emotion analysis, stress and recovery insights stop being generated.",
  },
  location: {
    label: "Location",
    detail: "Coarse geofence and place labels",
    why: "Labels where a memory happened and groups moments into places you return to.",
    ifDisabled: "Memories lose place labels and travel moments will not be recognised.",
  },
  behaviour: {
    label: "Behavioural Analysis",
    detail: "Routines, focus windows, sleep rhythm",
    why: "Builds your routine model — focus windows, life balance and smart suggestions.",
    ifDisabled: "AI insights, life balance and smart suggestions are paused.",
  },
};
