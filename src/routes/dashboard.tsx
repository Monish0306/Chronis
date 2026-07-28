import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BatteryMedium,
  Brain,
  ChevronDown,
  Clock3,
  Cpu,
  Download,
  FileBarChart,
  Gauge,
  HeartPulse,
  Lightbulb,
  RefreshCw,
  Settings2,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { AppShell, CardHeading, SectionCard } from "@/components/chrome/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AI_INSIGHTS,
  CONNECTED_DEVICES,
  DEVICE,
  LEARNING_TARGET_DAYS,
  LIFE_BALANCE,
  MOMENTS,
  RECENT_ACTIVITY,
  SMART_SUGGESTIONS,
  TODAY_STATS,
  WEEK_SERIES,
  WELLNESS,
  useChronis,
} from "@/lib/chronis";
import { MODES, useOnboarding } from "@/lib/onboarding";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Chronis AI Memory Companion" },
      {
        name: "description",
        content:
          "Your daily AI summary, capture status, wellness signals and life balance — all computed on your encrypted memory vault.",
      },
      { property: "og:title", content: "Chronis Dashboard" },
      {
        property: "og:description",
        content:
          "Daily AI summary, today's stats, life balance and device health in one private dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const chartTooltip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-soft)",
    fontSize: 12,
    background: "var(--background)",
  },
} as const;

function Dashboard() {
  const { app, update } = useChronis();
  const { state } = useOnboarding();
  const [coldStart, setColdStart] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [insight, setInsight] = useState<(typeof AI_INSIGHTS)[number] | null>(null);

  const mode = MODES.find((m) => m.id === state.mode) ?? MODES[0];
  const activeSignals = Object.values(app.signals).filter(Boolean).length;
  const learningProgress = Math.round((app.daysActive / LEARNING_TARGET_DAYS) * 100);
  const daysRemaining = LEARNING_TARGET_DAYS - app.daysActive;
  const firstName = state.name ? state.name.split(" ")[0] : "there";

  const recentMoments = useMemo(() => MOMENTS.slice(0, 4), []);

  function refresh() {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      update({ daysActive: app.daysActive });
      toast.success("Dashboard updated", {
        description: "Synced 34 encrypted moments from your band.",
      });
    }, 1100);
  }

  return (
    <AppShell
      breadcrumb="Dashboard"
      title={`Good afternoon, ${firstName}`}
      description="Chronis has been learning quietly in the background. Here is what it understands so far."
      actions={
        <>
          <div className="mr-1 flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">Cold start view</span>
            <Switch
              checked={coldStart}
              onCheckedChange={setColdStart}
              aria-label="Toggle cold start view"
            />
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-md"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} /> Sync
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-md">
            <Link to="/timeline">
              <Clock3 className="size-4" /> Timeline
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-md"
            onClick={() =>
              toast.success("Weekly report generated", {
                description: "Saved to your encrypted vault.",
              })
            }
          >
            <FileBarChart className="size-4" /> Reports
          </Button>
          <Button asChild className="h-10 rounded-md">
            <Link to="/settings">
              <Settings2 className="size-4" /> Settings
            </Link>
          </Button>
        </>
      }
    >
      <TooltipProvider delayDuration={200}>
        {/* status strip */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Activity,
              label: "Capture status",
              value: app.privacyPauseUntil ? "Paused" : "Active",
              hint: `${activeSignals} of 5 signals on`,
              tone: app.privacyPauseUntil ? "warning" : "success",
            },
            {
              icon: BatteryMedium,
              label: "Battery",
              value: `${DEVICE.battery}%`,
              hint: "≈ 19 h remaining",
              tone: "success",
            },
            {
              icon: RefreshCw,
              label: "Last sync",
              value: DEVICE.lastSync,
              hint: "End-to-end encrypted",
              tone: "muted",
            },
            {
              icon: Sparkles,
              label: "Current mode",
              value: mode.name,
              hint: mode.tagline,
              tone: "brand",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="surface-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <s.icon className="size-4 text-muted-foreground" />
                <span
                  className={
                    s.tone === "success"
                      ? "size-2 rounded-full bg-success"
                      : s.tone === "warning"
                        ? "size-2 rounded-full bg-warning"
                        : s.tone === "brand"
                          ? "size-2 rounded-full bg-brand"
                          : "size-2 rounded-full bg-border"
                  }
                />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 text-body font-semibold">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
            </motion.div>
          ))}
        </div>

        {coldStart ? (
          <ColdStart progress={learningProgress} daysRemaining={daysRemaining} />
        ) : (
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
            {/* daily summary */}
            <SectionCard className="lg:col-span-2">
              <CardHeading
                title="Daily AI summary"
                hint="Generated locally at 13:42 · Today"
                action={
                  <Badge variant="secondary" className="rounded-md text-[11px]">
                    <Brain className="mr-1 size-3" /> Confidence 87%
                  </Badge>
                }
              />
              {refreshing ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-8/12" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-foreground/80">
                  A strong, structured day. You opened with a 42-minute run, moved straight into
                  your longest focus block of the week, and kept stress markers low through the
                  afternoon. Social contact returned at lunch after two quieter days.
                </p>
              )}

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {[
                        [
                          "Morning",
                          "Run at 08:10 followed by a 1 h 48 m deep work block — your highest focus of the week.",
                        ],
                        [
                          "Afternoon",
                          "Team lunch at 13:05 lifted mood markers; stress stayed 14% below baseline.",
                        ],
                        [
                          "Evening",
                          "Light activity expected. Recovery is trending upward after last night's study session.",
                        ],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-3">
                          <span className="mt-0.5 w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {k}
                          </span>
                          <p className="text-sm leading-relaxed text-foreground/80">{v}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  className="h-9 rounded-md"
                  onClick={() => setExpanded((v) => !v)}
                >
                  <ChevronDown
                    className={
                      expanded
                        ? "size-4 rotate-180 transition-transform"
                        : "size-4 transition-transform"
                    }
                  />
                  {expanded ? "Collapse summary" : "Expand summary"}
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 rounded-md"
                  onClick={() =>
                    toast.success("Summary exported", {
                      description: "Encrypted copy saved to your vault.",
                    })
                  }
                >
                  <Download className="size-4" /> Export
                </Button>
              </div>
            </SectionCard>

            {/* AI confidence + learning */}
            <SectionCard>
              <CardHeading title="AI confidence" hint="How well Chronis knows you" />
              <div className="flex items-center gap-4">
                <Ring value={87} />
                <div className="text-sm">
                  <p className="font-semibold">Strong understanding</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Built from {app.daysActive} days of encrypted memory across {activeSignals}{" "}
                    active signals.
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                AI learning journey
              </p>
              <Progress value={learningProgress} className="mt-2 h-2" />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Day {app.daysActive}</span>
                <span>{daysRemaining} days to full model</span>
              </div>
            </SectionCard>

            {/* weekly stats */}
            <SectionCard className="lg:col-span-2">
              <CardHeading
                title="Weekly statistics"
                hint="Moments captured and focus minutes"
                action={
                  <Button asChild variant="ghost" className="h-8 rounded-md text-xs">
                    <Link to="/timeline">View raw data</Link>
                  </Button>
                }
              />
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEK_SERIES} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gMoments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="var(--muted-foreground)"
                      unit=" pts"
                    />
                    <RTooltip {...chartTooltip} />
                    <Area
                      type="monotone"
                      dataKey="moments"
                      stroke="var(--brand)"
                      strokeWidth={2}
                      fill="url(#gMoments)"
                      name="Moments"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEK_SERIES} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="var(--muted-foreground)"
                      unit="m"
                    />
                    <RTooltip {...chartTooltip} />
                    <Bar
                      dataKey="focus"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                      name="Focus min"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* life balance */}
            <SectionCard>
              <CardHeading
                title="Life balance wheel"
                hint="Last 30 days"
                action={
                  <Button asChild variant="ghost" className="h-8 rounded-md text-xs">
                    <Link to="/timeline">View raw data</Link>
                  </Button>
                }
              />
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={LIFE_BALANCE} outerRadius="72%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="area" fontSize={11} stroke="var(--muted-foreground)" />
                    <Radar
                      dataKey="value"
                      stroke="var(--brand)"
                      fill="var(--brand)"
                      fillOpacity={0.22}
                    />
                    <RTooltip {...chartTooltip} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* today's stats */}
            <SectionCard className="lg:col-span-2">
              <CardHeading title="Today's stats" hint="Live from your paired band" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TODAY_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-border bg-secondary/40 p-4"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1.5 text-xl font-semibold tracking-tight">{s.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.delta}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* wellness */}
            <SectionCard>
              <CardHeading title="Wellness status" hint="Derived from heart rate and movement" />
              <div className="space-y-4">
                {WELLNESS.map((w) => (
                  <div key={w.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{w.label}</span>
                      <span className="text-muted-foreground">{w.value}%</span>
                    </div>
                    <Progress value={w.value} className="mt-1.5 h-1.5" />
                    <p className="mt-1 text-xs text-muted-foreground">{w.note}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* memory timeline preview */}
            <SectionCard className="lg:col-span-2">
              <CardHeading
                title="Memory timeline"
                hint="Most recent moments"
                action={
                  <Button asChild variant="ghost" className="h-8 rounded-md text-xs">
                    <Link to="/timeline">Open timeline</Link>
                  </Button>
                }
              />
              <ol className="relative space-y-4 pl-5">
                <span
                  className="absolute left-1.5 top-1 h-[calc(100%-0.5rem)] w-px bg-border"
                  aria-hidden
                />
                {recentMoments.map((m) => (
                  <li key={m.id} className="relative">
                    <span
                      className={
                        m.importance === "high"
                          ? "absolute -left-[15px] top-1.5 size-2.5 rounded-full bg-brand ring-4 ring-background"
                          : "absolute -left-[15px] top-1.5 size-2.5 rounded-full bg-border ring-4 ring-background"
                      }
                    />
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-medium">{m.title}</p>
                      <Badge variant="secondary" className="rounded-md text-[10px]">
                        {m.type}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.date} · {m.time} · {m.duration}
                    </p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            {/* device status */}
            <SectionCard>
              <CardHeading title="Device status" hint={DEVICE.name} />
              <div className="space-y-3 text-sm">
                {[
                  ["Firmware", DEVICE.firmware],
                  ["Battery", `${DEVICE.battery}%`],
                  ["Vault storage used", `${DEVICE.storage}%`],
                  ["Temperature", DEVICE.temperature],
                  ["Device health", `${DEVICE.health}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                {CONNECTED_DEVICES.length} trusted devices connected to this vault.
              </p>
              <Button asChild variant="outline" className="mt-3 h-9 w-full rounded-md">
                <Link to="/settings">
                  <Cpu className="size-4" /> Manage devices
                </Link>
              </Button>
            </SectionCard>

            {/* insights */}
            <SectionCard className="lg:col-span-2">
              <CardHeading title="AI insight cards" hint="Patterns Chronis noticed for you" />
              <div className="grid gap-3 sm:grid-cols-3">
                {AI_INSIGHTS.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setInsight(i)}
                    className="rounded-lg border border-border bg-background p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <Badge variant="secondary" className="rounded-md text-[10px]">
                      {i.tag}
                    </Badge>
                    <p className="mt-2.5 text-sm font-medium leading-snug">{i.title}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Gauge className="size-3.5" /> {i.confidence}% confidence
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* quick actions */}
            <SectionCard>
              <CardHeading title="Quick actions" />
              <div className="grid gap-2">
                {[
                  {
                    label: "Pause capture for 1 hour",
                    icon: HeartPulse,
                    run: () => {
                      update({ privacyPauseUntil: Date.now() + 3600_000 });
                      toast.success("Capture paused", {
                        description: "Chronis will resume automatically in 1 hour.",
                      });
                    },
                  },
                  {
                    label: "Generate weekly report",
                    icon: FileBarChart,
                    run: () =>
                      toast.success("Weekly report ready", {
                        description: "Available in your vault exports.",
                      }),
                  },
                  {
                    label: "Ask the AI assistant",
                    icon: Wand2,
                    run: () =>
                      toast("Assistant", {
                        description: "Open the assistant from the top navigation.",
                      }),
                  },
                  {
                    label: "Export encrypted data",
                    icon: Download,
                    run: () =>
                      toast.success("Export started", {
                        description: "You will be notified when the archive is sealed.",
                      }),
                  },
                ].map((a) => (
                  <Tooltip key={a.label}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={a.run}
                        className="flex items-center gap-3 rounded-md border border-border bg-background px-3.5 py-3 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0"
                      >
                        <a.icon className="size-4 text-brand" />
                        {a.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Runs locally on your device</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </SectionCard>

            {/* smart suggestions */}
            <SectionCard>
              <CardHeading title="Smart suggestions" hint="Based on your routine model" />
              <div className="space-y-3">
                {SMART_SUGGESTIONS.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-secondary/40 p-3.5">
                    <p className="text-sm font-medium">{s.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.why}</p>
                    <div className="mt-2.5 flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 rounded-md"
                        onClick={() => toast.success("Added", { description: s.text })}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-md"
                        onClick={() =>
                          toast("Dismissed", {
                            description: "Chronis will suggest this less often.",
                          })
                        }
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* recent activity */}
            <SectionCard className="lg:col-span-2">
              <CardHeading title="Recent activity" hint="Everything Chronis did on your behalf" />
              <ul className="divide-y divide-border">
                {RECENT_ACTIVITY.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="flex items-center gap-2.5">
                      <Lightbulb className="size-4 text-muted-foreground" />
                      {a.text}
                    </span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        <Dialog open={!!insight} onOpenChange={(o) => !o && setInsight(null)}>
          <DialogContent className="rounded-lg sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{insight?.title}</DialogTitle>
              <DialogDescription>
                {insight?.tag} insight · {insight?.confidence}% confidence
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm leading-relaxed text-foreground/80">{insight?.body}</p>
            <div className="rounded-md bg-success-soft px-3.5 py-2.5 text-xs text-foreground/70">
              This insight was computed on device. No raw data left your vault.
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-md" onClick={() => setInsight(null)}>
                Close
              </Button>
              <Button
                className="rounded-md"
                onClick={() => {
                  toast.success("Saved to highlights");
                  setInsight(null);
                }}
              >
                Save to highlights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AppShell>
  );
}

function ColdStart({ progress, daysRemaining }: { progress: number; daysRemaining: number }) {
  return (
    <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
      <SectionCard className="lg:col-span-2">
        <CardHeading title="AI learning journey" hint="Chronis needs time before insights appear" />
        <div className="flex items-center gap-5">
          <Ring value={progress} />
          <div>
            <p className="text-sm font-semibold">Learning your rhythm</p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
              Your first summaries unlock once enough baseline data exists. Nothing is uploaded —
              the model is being built entirely inside your vault.
            </p>
          </div>
        </div>
        <Progress value={progress} className="mt-5 h-2" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Learning progress {progress}%</span>
          <span>{daysRemaining} days remaining</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Baseline calibration", "Complete"],
            ["Routine modelling", "In progress"],
            ["Emotion mapping", "Queued"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-secondary/40 p-3.5">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="mt-1 text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <CardHeading
          title="While you wait"
          hint="Nothing is missing — data is still being captured"
        />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
          <Skeleton className="h-4 w-7/12" />
          <Separator className="my-2" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Daily summaries, life balance and wellness scoring appear automatically once calibration
          finishes.
        </p>
      </SectionCard>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 72 72" className="size-20 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <motion.circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {value}%
      </span>
    </div>
  );
}
