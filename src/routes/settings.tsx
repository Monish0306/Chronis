import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Cpu,
  Download,
  Eye,
  KeyRound,
  Laptop,
  PauseCircle,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell, CardHeading, SectionCard } from "@/components/chrome/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CONNECTED_DEVICES, DEVICE, SIGNAL_META, useChronis, type SignalId } from "@/lib/chronis";
import { MODES, useOnboarding } from "@/lib/onboarding";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Trust Center — Chronis Settings" },
      {
        name: "description",
        content:
          "Control every capture signal, privacy pause, notification and trusted device. Chronis explains what changes before anything is turned off.",
      },
      { property: "og:title", content: "Chronis Trust Center" },
      {
        property: "og:description",
        content:
          "Privacy dashboard, capture controls, AI transparency and trusted device management.",
      },
    ],
  }),
  component: Settings,
});

const PAUSE_OPTIONS = [
  { label: "1 hour", ms: 3_600_000 },
  { label: "4 hours", ms: 14_400_000 },
  { label: "Until tomorrow", ms: 43_200_000 },
];

function Settings() {
  const { app, update, setSignal } = useChronis();
  const { state } = useOnboarding();
  const mode = MODES.find((m) => m.id === state.mode) ?? MODES[0];

  const [pendingSignal, setPendingSignal] = useState<SignalId | null>(null);
  const [removeDevice, setRemoveDevice] = useState<string | null>(null);
  const [customPause, setCustomPause] = useState("90");
  const [removed, setRemoved] = useState<string[]>([]);

  const activeSignals = (Object.keys(app.signals) as SignalId[]).filter((k) => app.signals[k]);
  const privacyScore = Math.round(100 - activeSignals.length * 9 + (app.privacyPauseUntil ? 8 : 0));
  const paused = !!app.privacyPauseUntil && app.privacyPauseUntil > Date.now();

  function handleSignal(id: SignalId, next: boolean) {
    if (!next) {
      setPendingSignal(id);
      return;
    }
    setSignal(id, true);
    toast.success(`${SIGNAL_META[id].label} enabled`, {
      description: "Capture resumes on your next sync.",
    });
  }

  function confirmDisable() {
    if (!pendingSignal) return;
    setSignal(pendingSignal, false);
    toast.success(`${SIGNAL_META[pendingSignal].label} disabled`, {
      description: "Existing memories are untouched. New capture has stopped.",
    });
    setPendingSignal(null);
  }

  function pause(ms: number, label: string) {
    update({ privacyPauseUntil: Date.now() + ms });
    toast.success(`Privacy mode on · ${label}`, {
      description: "Nothing is recorded until it ends.",
    });
  }

  return (
    <AppShell
      breadcrumb="Settings"
      title="Trust Center"
      description="Complete control over what Chronis captures, what it understands and which devices can reach your vault."
      actions={
        <>
          <Button
            variant="outline"
            className="h-10 rounded-md"
            onClick={() =>
              toast.success("Export started", {
                description: "Your encrypted archive is being sealed.",
              })
            }
          >
            <Download className="size-4" /> Export data
          </Button>
          <Button
            className="h-10 rounded-md"
            onClick={() =>
              toast.success("Settings saved", {
                description: "Applied across all trusted devices.",
              })
            }
          >
            <Save className="size-4" /> Save
          </Button>
        </>
      }
    >
      <TooltipProvider delayDuration={200}>
        {/* Privacy dashboard */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              label: "Privacy status",
              value: paused ? "Paused" : "Protected",
              hint: `${activeSignals.length} of 5 signals capturing`,
            },
            {
              icon: Eye,
              label: "Capture status",
              value: paused ? "Off" : "Active",
              hint: "On-device only",
            },
            {
              icon: KeyRound,
              label: "Encryption",
              value: "AES-256-GCM",
              hint: "Key held only by you",
            },
            {
              icon: BadgeCheck,
              label: "Backup",
              value: state.cloudBackup ? "Encrypted backup on" : "Local only",
              hint: "Zero-knowledge storage",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="surface-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <c.icon className="size-4 text-brand" />
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-1 text-body font-semibold">{c.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
          {/* Capture controls */}
          <SectionCard className="lg:col-span-2">
            <CardHeading
              title="Capture controls"
              hint="Turning a signal off always explains what changes first"
            />
            <div className="space-y-2">
              {(Object.keys(SIGNAL_META) as SignalId[]).map((id) => (
                <div
                  key={id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{SIGNAL_META[id].label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{SIGNAL_META[id].detail}</p>
                    {!app.signals[id] && (
                      <p className="mt-2 text-[11px] font-medium text-destructive leading-normal">
                        Consequence: {SIGNAL_META[id].ifDisabled}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={app.signals[id]}
                    onCheckedChange={(v) => handleSignal(id, v)}
                    aria-label={`Toggle ${SIGNAL_META[id].label}`}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Privacy score */}
          <SectionCard>
            <CardHeading title="Privacy score" hint="Higher means less is captured" />
            <div className="flex items-center gap-4">
              <span className="text-4xl font-semibold tracking-tight">
                {Math.max(0, Math.min(100, privacyScore))}
              </span>
              <Badge variant="secondary" className="rounded-md text-[11px]">
                {privacyScore >= 75
                  ? "Very private"
                  : privacyScore >= 55
                    ? "Balanced"
                    : "Data rich"}
              </Badge>
            </div>
            <Progress value={Math.max(0, Math.min(100, privacyScore))} className="mt-3 h-2" />
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Security status</p>
            <ul className="mt-2 space-y-2 text-sm">
              {[
                ["Vault encryption", "Verified"],
                ["Recovery phrase", state.vaultReady ? "Backed up" : "Pending"],
                ["Firmware signature", "Valid"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="size-3.5 text-success" /> {v}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Privacy mode */}
          <SectionCard className="lg:col-span-2">
            <CardHeading
              title="Privacy mode"
              hint={paused ? "Capture is currently paused" : "Pause all capture temporarily"}
              action={
                paused ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-md"
                    onClick={() => {
                      update({ privacyPauseUntil: null });
                      toast.success("Capture resumed");
                    }}
                  >
                    Resume now
                  </Button>
                ) : undefined
              }
            />
            <div className="flex flex-wrap gap-2">
              {PAUSE_OPTIONS.map((o) => (
                <Button
                  key={o.label}
                  variant="outline"
                  className="h-10 rounded-md"
                  onClick={() => pause(o.ms, o.label)}
                >
                  <PauseCircle className="size-4" /> {o.label}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <Label htmlFor="custom-pause" className="text-xs text-muted-foreground">
                  Custom duration (minutes)
                </Label>
                <Input
                  id="custom-pause"
                  value={customPause}
                  onChange={(e) => setCustomPause(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 h-10 w-36 rounded-md"
                  inputMode="numeric"
                />
              </div>
              <Button
                className="h-10 rounded-md"
                onClick={() => {
                  const mins = Number(customPause);
                  if (!mins || mins < 5) {
                    toast.error("Enter at least 5 minutes");
                    return;
                  }
                  pause(mins * 60_000, `${mins} minutes`);
                }}
              >
                Pause privacy
              </Button>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard>
            <CardHeading title="Notifications" hint="Delivered locally, never by email" />
            <div className="space-y-3">
              {(
                [
                  ["dailySummary", "Daily summary"],
                  ["weeklyReport", "Weekly report"],
                  ["aiInsights", "AI insights"],
                  ["milestones", "Milestones"],
                  ["timeCapsule", "Time capsule reminder"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Bell className="size-3.5 text-muted-foreground" /> {label}
                  </span>
                  <Switch
                    checked={app.notifications[key]}
                    onCheckedChange={(v) =>
                      update({ notifications: { ...app.notifications, [key]: v } })
                    }
                    aria-label={label}
                  />
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <Label htmlFor="reminder" className="text-xs text-muted-foreground">
              Reminder time
            </Label>
            <Input
              id="reminder"
              type="time"
              value={app.notifications.reminderTime}
              onChange={(e) =>
                update({ notifications: { ...app.notifications, reminderTime: e.target.value } })
              }
              className="mt-1.5 h-10 rounded-md"
            />
          </SectionCard>

          {/* AI section */}
          <SectionCard className="lg:col-span-2">
            <CardHeading title="AI" hint="What the model does, in plain language" />
            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Current mode
                  </p>
                  <p className="mt-1 text-sm font-semibold">{mode.name}</p>
                  <p className="text-xs text-muted-foreground">{mode.tagline}</p>
                </div>
                <Button asChild variant="outline" className="h-9 rounded-md">
                  <Link to="/mode">Change mode</Link>
                </Button>
              </div>
            </div>
            <Accordion type="single" collapsible className="mt-3">
              <AccordionItem value="explain">
                <AccordionTrigger className="text-sm">AI explainability</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  Every insight shows the signals it used and a confidence score. Chronis never
                  asserts a conclusion it cannot trace back to captured moments, and you can open
                  any insight to see its evidence.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="transparency">
                <AccordionTrigger className="text-sm">AI transparency</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  The model runs on your device against your encrypted vault. No memory, transcript
                  or embedding is sent to a server, and no data is used to train shared models.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="usage">
                <AccordionTrigger className="text-sm">
                  Data usage — why each permission exists
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {(Object.keys(SIGNAL_META) as SignalId[]).map((id) => (
                      <li key={id} className="rounded-lg border border-border p-3.5">
                        <p className="text-sm font-medium">{SIGNAL_META[id].label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground/70">Why: </span>
                          {SIGNAL_META[id].why}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground/70">If disabled: </span>
                          {SIGNAL_META[id].ifDisabled}
                        </p>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SectionCard>

          {/* Account */}
          <SectionCard>
            <CardHeading title="Account information" />
            <div className="space-y-3 text-sm">
              {[
                ["Name", state.name || "Guest"],
                ["Email", state.email || "Not signed in"],
                ["Vault ID", "vlt_8f21·b4c9"],
                ["Member since", "Day 1"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="truncate font-medium">{v}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Device health</p>
            <Progress value={DEVICE.health} className="mt-2 h-1.5" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {DEVICE.name} · firmware {DEVICE.firmware} · {DEVICE.health}% healthy
            </p>
          </SectionCard>

          {/* Trusted devices */}
          <SectionCard className="lg:col-span-3">
            <CardHeading title="Trusted devices" hint="Only these devices can decrypt your vault" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-brand/30 bg-brand-soft/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Cpu className="size-4 text-brand" /> {DEVICE.name}
                  </span>
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    Current device
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Paired · firmware {DEVICE.firmware} · last sync {DEVICE.lastSync}
                </p>
              </div>

              {CONNECTED_DEVICES.filter((d) => !removed.includes(d.id)).map((d) => (
                <div key={d.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {d.kind.includes("phone") ? (
                        <Smartphone className="size-4 text-muted-foreground" />
                      ) : (
                        <Laptop className="size-4 text-muted-foreground" />
                      )}
                      {d.name}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${d.name}`}
                          onClick={() => setRemoveDevice(d.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove device</TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {d.kind} · last sync {d.lastSync}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* consent dialog for disabling a signal */}
        <AlertDialog open={!!pendingSignal} onOpenChange={(o) => !o && setPendingSignal(null)}>
          <AlertDialogContent className="rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" />
                Turn off {pendingSignal ? SIGNAL_META[pendingSignal].label : ""}?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-left">
                  <p>
                    <span className="font-medium text-foreground">Why it exists: </span>
                    {pendingSignal ? SIGNAL_META[pendingSignal].why : ""}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">What changes: </span>
                    {pendingSignal ? SIGNAL_META[pendingSignal].ifDisabled : ""}
                  </p>
                  <p className="rounded-md bg-secondary/60 px-3 py-2 text-xs">
                    Memories already captured stay in your vault and remain readable. You can
                    re-enable this signal at any time.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-md">Keep it on</AlertDialogCancel>
              <AlertDialogAction className="rounded-md" onClick={confirmDisable}>
                Yes, turn it off
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* remove device confirmation */}
        <AlertDialog open={!!removeDevice} onOpenChange={(o) => !o && setRemoveDevice(null)}>
          <AlertDialogContent className="rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this device?</AlertDialogTitle>
              <AlertDialogDescription>
                It will immediately lose access to your vault and its local decryption key will be
                revoked. You can pair it again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-md"
                onClick={() => {
                  if (removeDevice) setRemoved((p) => [...p, removeDevice]);
                  setRemoveDevice(null);
                  toast.success("Device removed", { description: "Vault access revoked." });
                }}
              >
                Remove device
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    </AppShell>
  );
}
