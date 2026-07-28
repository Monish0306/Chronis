import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  Database,
  HeartPulse,
  Info,
  MapPin,
  Mic,
  Shield,
  Sparkles,
  Waves,
} from "lucide-react";
import { toast } from "sonner";

import { OnboardingLayout, TrustBanner } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MODES, SIGNALS, useOnboarding, type ModeId } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mode")({
  head: () => ({
    meta: [
      { title: "Choose your Chronis mode — Privacy vs AI recall" },
      {
        name: "description",
        content:
          "Pick Full Dataset, Custom Signals or Raw Vault. Compare privacy level, AI learning time and exactly which signals Chronis captures.",
      },
      { property: "og:title", content: "Choose your Chronis capture mode" },
      {
        property: "og:description",
        content: "Compare privacy, AI learning time and captured signals before you commit.",
      },
    ],
  }),
  component: ModeSelection,
});

const ICONS: Record<ModeId, typeof Brain> = { full: Brain, custom: Waves, vault: Database };
const SIGNAL_ICONS: Record<string, typeof Activity> = {
  motion: Activity,
  audio: Mic,
  heart: HeartPulse,
  location: MapPin,
  behaviour: Sparkles,
};

function ModeSelection() {
  const navigate = useNavigate();
  const { state, update } = useOnboarding();
  const [selected, setSelected] = useState<ModeId | null>(state.mode);
  const [signals, setSignals] = useState<string[]>(state.signals);
  const [learnMore, setLearnMore] = useState<ModeId | null>(null);

  const mode = MODES.find((m) => m.id === selected) ?? null;
  const learnMoreMode = MODES.find((m) => m.id === learnMore) ?? null;
  const privacy =
    selected === "custom" ? Math.round(100 - signals.length * 9) : (mode?.privacy ?? 0);

  function toggleSignal(id: string) {
    setSignals((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function complete() {
    if (!selected) return;
    update({ mode: selected, signals });
    toast.success(`${mode?.name} mode selected`, {
      description: "Chronis is ready to start remembering.",
    });
    navigate({ to: "/ready" });
  }

  return (
    <OnboardingLayout
      step={4}
      eyebrow="Step 4 of 4 · Capture mode"
      title="Choose how Chronis works for you"
      description="Modes control what is captured and whether AI is allowed to learn from it. You can change this later at any time."
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-3">
          {MODES.map((m, i) => {
            const Icon = ICONS[m.id];
            const active = selected === m.id;
            return (
              <motion.button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className={cn(
                  "surface-card relative flex flex-col p-6 text-left transition-shadow duration-300 hover:shadow-lift",
                  active && "border-brand ring-2 ring-brand/25",
                )}
              >
                {m.recommended && (
                  <Badge
                    className="absolute right-4 top-4 rounded-md bg-brand-soft text-[10px] text-brand"
                    variant="secondary"
                  >
                    AI recommended
                  </Badge>
                )}
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-md",
                    active ? "bg-brand text-brand-foreground" : "bg-secondary text-foreground",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-h3 font-medium text-foreground">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.summary}</p>

                <div className="mt-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Privacy level</span>
                      <span className="font-medium text-foreground">{m.privacy}%</span>
                    </div>
                    <Progress value={m.privacy} className="mt-1.5 h-1.5" />
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-secondary/70 px-3 py-2 text-[11px]">
                    <span className="text-muted-foreground">AI learning</span>
                    <span className="font-medium">{m.learning}</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" /> {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors",
                      active ? "bg-primary text-primary-foreground" : "border border-border",
                    )}
                  >
                    {active ? "Selected" : "Select mode"}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLearnMore(m.id);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && setLearnMore(m.id)}
                    className="flex size-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-secondary"
                  >
                    <Info className="size-4" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {selected === "custom" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card mt-6 p-6"
          >
            <h3 className="text-h3 font-medium">Choose your signals</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Only enabled streams are ever captured or analysed.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SIGNALS.map((s) => {
                const Icon = SIGNAL_ICONS[s.id];
                const on = signals.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                      on ? "border-brand/40 bg-brand-soft/30" : "border-border",
                    )}
                  >
                    <span className="flex size-9 items-center justify-center rounded-md bg-background">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                    <Switch checked={on} onCheckedChange={() => toggleSignal(s.id)} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="surface-card p-6 lg:col-span-2">
            <h3 className="text-h3 font-medium text-foreground">Live preview</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A sample of what your timeline would look like in {mode?.name ?? "the selected mode"}.
            </p>
            <div className="mt-4 space-y-2.5">
              {selected === null && (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-10 text-center">
                  <Shield className="size-6 text-muted-foreground/60" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Select a mode to preview your memory timeline
                  </p>
                </div>
              )}
              {selected === "vault" &&
                [
                  "08:42 · Encrypted record",
                  "13:15 · Encrypted record",
                  "19:04 · Encrypted record",
                ].map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3 text-sm"
                  >
                    <Database className="size-4 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {r} · no AI summary
                    </span>
                  </div>
                ))}
              {(selected === "full" || selected === "custom") &&
                [
                  ["08:42", "Morning run along the river, 5.2 km at steady heart rate"],
                  ["13:15", "Lunch with Priya — discussed the Q3 launch timeline"],
                  ["19:04", "Focus block: two hours on the Chronis design system"],
                ].map(([time, text]) => (
                  <div
                    key={time}
                    className="flex items-start gap-3 rounded-lg bg-secondary/60 px-4 py-3"
                  >
                    <span className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      {time}
                    </span>
                    <span className="text-sm">{text}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="surface-card h-fit p-6">
            <h3 className="text-h3 font-medium text-foreground">Privacy meter</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {selected ? privacy : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Progress value={selected ? privacy : 0} className="mt-3 h-2" />
            <Separator className="my-5" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {selected === "vault"
                ? "Maximum privacy. No model ever reads your memories."
                : selected === "custom"
                  ? `${signals.length} of ${SIGNALS.length} signal streams enabled. Disable more to raise your score.`
                  : selected === "full"
                    ? "Richest recall. All processing still happens against encrypted data you own."
                    : "Choose a mode to see how it affects your privacy posture."}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="h-11 w-full rounded-md px-6 sm:w-auto"
            onClick={() => navigate({ to: "/vault" })}
          >
            Back to vault
          </Button>
          <Button
            className="h-11 w-full rounded-md px-8 sm:w-auto"
            disabled={!selected}
            onClick={complete}
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <TrustBanner text="Modes are reversible. Switching to Raw Vault stops all AI processing immediately." />

      <Dialog open={Boolean(learnMore)} onOpenChange={() => setLearnMore(null)}>
        <DialogContent className="rounded-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{learnMoreMode?.name}</DialogTitle>
            <DialogDescription>{learnMoreMode?.summary}</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {learnMoreMode?.points.map((p) => (
              <li key={p} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {p}
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-secondary/70 p-4 text-xs text-muted-foreground">
            Estimated learning period: {learnMoreMode?.learning} · Privacy level{" "}
            {learnMoreMode?.privacy}%
          </div>
        </DialogContent>
      </Dialog>
    </OnboardingLayout>
  );
}
