import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  Flag,
  Heart,
  Lock,
  Route as RouteIcon,
  Search,
  Sparkles,
  Star,
  Timer,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell, CardHeading, SectionCard } from "@/components/chrome/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CHAPTERS, GOALS, MOMENTS, TIME_CAPSULES, useChronis, type Moment } from "@/lib/chronis";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Memory Timeline — Chronis" },
      {
        name: "description",
        content:
          "Scroll every captured moment from day one to today, with AI summaries, emotion analysis and memory journeys.",
      },
      { property: "og:title", content: "Chronis Memory Timeline" },
      {
        property: "og:description",
        content:
          "Explore your encrypted memories day by day with AI summaries and emotion analysis.",
      },
    ],
  }),
  component: Timeline,
});

const FILTERS = [
  "All",
  "Work",
  "Movement",
  "Social",
  "Rest",
  "Learning",
  "Travel",
  "Favorites",
] as const;

function Timeline() {
  const { app, toggleFavorite } = useChronis();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState<string[]>(["m-001"]);
  const [journey, setJourney] = useState<Moment | null>(null);
  const [capsuleOpen, setCapsuleOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOMENTS.filter((m) => {
      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Favorites"
            ? app.favorites.includes(m.id)
            : m.type === filter;
      const matchesQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.chapter.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter, app.favorites]);

  function toggle(id: string) {
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <AppShell
      breadcrumb="Timeline"
      title="Memory timeline"
      description="Every moment from day one to today, encrypted in your vault and readable only by you."
      actions={
        <>
          <Button
            variant="outline"
            className="h-10 rounded-md"
            onClick={() => setCapsuleOpen(true)}
          >
            <Lock className="size-4" /> Time capsule
          </Button>
          <Button
            className="h-10 rounded-md"
            onClick={() => document.getElementById("timeline-search")?.focus()}
          >
            <Search className="size-4" /> AI search
          </Button>
        </>
      }
    >
      <TooltipProvider delayDuration={200}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {/* search + filters */}
            <div className="surface-card p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="timeline-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask your memory — “focus”, “dinner”, “run”…"
                  className="h-11 rounded-md pl-9"
                />
              </div>
              <Tabs
                value={filter}
                onValueChange={(v) => setFilter(v as (typeof FILTERS)[number])}
                className="mt-3"
              >
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-md bg-secondary/60 p-1">
                  {FILTERS.map((f) => (
                    <TabsTrigger key={f} value={f} className="rounded-md text-xs">
                      {f}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* timeline */}
            {filtered.length === 0 ? (
              <div className="surface-card mt-4 flex flex-col items-center px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <Search className="size-5" />
                </span>
                <p className="mt-4 text-body font-semibold">No memories match that search</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Try a different phrase, or clear the filter to see your full timeline.
                </p>
                <Button
                  variant="outline"
                  className="mt-5 h-9 rounded-md"
                  onClick={() => {
                    setQuery("");
                    setFilter("All");
                  }}
                >
                  Reset search
                </Button>
              </div>
            ) : (
              <ol className="relative mt-4 space-y-3 pl-6">
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-border origin-top"
                  aria-hidden
                />
                {filtered.map((m, idx) => {
                  const isOpen = open.includes(m.id);
                  const fav = app.favorites.includes(m.id);
                  return (
                    <motion.li
                      key={m.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: Math.min(idx * 0.05, 0.4),
                        type: "spring",
                        stiffness: 260,
                        damping: 24,
                      }}
                      className="relative"
                    >
                      <span
                        className={
                          m.importance === "high"
                            ? "absolute -left-[22px] top-6 size-3 rounded-full bg-brand ring-4 ring-background"
                            : m.importance === "medium"
                              ? "absolute -left-[22px] top-6 size-3 rounded-full bg-foreground/30 ring-4 ring-background"
                              : "absolute -left-[22px] top-6 size-3 rounded-full bg-border ring-4 ring-background"
                        }
                        aria-hidden
                      />
                      <div className="surface-card p-4 bg-card/75 backdrop-blur-sm border border-border/50 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.012] hover:shadow-lift">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Day {m.day}</span>
                              <span>·</span>
                              <span>{m.date}</span>
                              <span>·</span>
                              <span>{m.time}</span>
                              <span className="flex items-center gap-1">
                                <Timer className="size-3" /> {m.duration}
                              </span>
                            </div>
                            <p className="mt-1.5 truncate text-body font-semibold tracking-tight">
                              {m.title}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <Badge variant="secondary" className="rounded-md text-[10px]">
                                {m.type}
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={
                                      m.importance === "high"
                                        ? "rounded-md bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                                        : m.importance === "medium"
                                          ? "rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                                          : "rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                                    }
                                  >
                                    {m.importance} importance
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Scored by emotional weight and rarity
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Favorite memory"
                                  onClick={() => {
                                    toggleFavorite(m.id);
                                    toast.success(
                                      fav ? "Removed from favorites" : "Added to favorites",
                                    );
                                  }}
                                >
                                  <Star
                                    className={fav ? "size-4 fill-warning text-warning" : "size-4"}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{fav ? "Unfavorite" : "Favorite"}</TooltipContent>
                            </Tooltip>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Expand memory"
                              onClick={() => toggle(m.id)}
                            >
                              <ChevronDown
                                className={
                                  isOpen
                                    ? "size-4 rotate-180 transition-transform"
                                    : "size-4 transition-transform"
                                }
                              />
                            </Button>
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 space-y-4 border-t border-border pt-4">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    AI summary
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                                    {m.summary}
                                  </p>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                      Emotion analysis
                                    </p>
                                    <Badge variant="secondary" className="rounded-md text-[10px]">
                                      {m.emotion.label} · {m.emotion.score}
                                    </Badge>
                                  </div>
                                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {m.emotion.palette.map((p) => (
                                      <div key={p.label}>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-muted-foreground">{p.label}</span>
                                          <span>{p.value}</span>
                                        </div>
                                        <Progress value={p.value} className="mt-1 h-1.5" />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-lg bg-secondary/50 p-3.5">
                                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                    <Sparkles className="size-3" /> AI observation
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                                    {m.observation}
                                  </p>
                                </div>

                                {m.related.length > 0 && (
                                  <div>
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                      Related memories
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {m.related.map((rid) => {
                                        const r = MOMENTS.find((x) => x.id === rid);
                                        if (!r) return null;
                                        return (
                                          <button
                                            key={rid}
                                            onClick={() => {
                                              setOpen((p) => (p.includes(rid) ? p : [...p, rid]));
                                              toast("Jumped to related memory", {
                                                description: r.title,
                                              });
                                            }}
                                            className="rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
                                          >
                                            {r.title}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <Button
                                  variant="outline"
                                  className="h-9 rounded-md"
                                  onClick={() => setJourney(m)}
                                >
                                  <RouteIcon className="size-4" /> View memory journey
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* side rail */}
          <aside className="space-y-4">
            <SectionCard>
              <CardHeading title="Goal timeline" hint="Remaining days to each milestone" />
              <div className="space-y-4">
                {GOALS.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {g.progress}/{g.target} {g.unit}
                      </span>
                    </div>
                    <Progress
                      value={(Number(g.progress) / Number(g.target)) * 100}
                      className="mt-1.5 h-1.5"
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <CardHeading title="Life chapters" hint="How Chronis grouped your story" />
              <ul className="space-y-2.5">
                {CHAPTERS.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-3.5 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.range}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-md text-[10px]">
                      {c.moments}
                    </Badge>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard>
              <CardHeading title="Memory highlights" hint="Your favourites and milestones" />
              {app.favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Star any memory to keep it here. Nothing is highlighted yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {app.favorites.map((id) => {
                    const m = MOMENTS.find((x) => x.id === id);
                    if (!m) return null;
                    return (
                      <li key={id} className="flex items-center gap-2 text-sm">
                        <Heart className="size-3.5 shrink-0 text-brand" />
                        <span className="truncate">{m.title}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Separator className="my-4" />
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Flag className="size-3" /> Milestone notifications
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Day 50 “Half way to the model” unlocks in 8 days.
              </p>
            </SectionCard>

            <SectionCard>
              <CardHeading title="AI reflection" hint="Weekly, written for you" />
              <p className="text-sm leading-relaxed text-foreground/80">
                “This month you traded intensity for consistency. Your mornings became the anchor of
                your day, and your calmest memories all happened outdoors.”
              </p>
              <Button
                variant="ghost"
                className="mt-3 h-9 rounded-md"
                onClick={() =>
                  toast.success("Reflection saved", { description: "Added to your highlights." })
                }
              >
                <BookOpen className="size-4" /> Save reflection
              </Button>
            </SectionCard>
          </aside>
        </div>

        {/* journey dialog */}
        <Dialog open={!!journey} onOpenChange={(o) => !o && setJourney(null)}>
          <DialogContent className="rounded-lg sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Memory journey</DialogTitle>
              <DialogDescription>{journey?.title}</DialogDescription>
            </DialogHeader>
            <ol className="relative space-y-4 pl-5">
              <span
                className="absolute left-1.5 top-1 h-[calc(100%-0.5rem)] w-px bg-border"
                aria-hidden
              />
              {journey?.journey.map((j) => (
                <li key={j} className="relative text-sm">
                  <span className="absolute -left-[15px] top-1.5 size-2.5 rounded-full bg-brand ring-4 ring-background" />
                  {j}
                </li>
              ))}
            </ol>
            <DialogFooter>
              <Button className="rounded-md" onClick={() => setJourney(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* time capsule dialog */}
        <Dialog open={capsuleOpen} onOpenChange={setCapsuleOpen}>
          <DialogContent className="rounded-lg sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>AI time capsules</DialogTitle>
              <DialogDescription>
                Messages and reflections sealed until a future day.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {TIME_CAPSULES.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3.5"
                >
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Unlocks {c.unlocks}
                      {c.locked ? ` · ${c.daysLeft} days remaining` : " · available now"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={c.locked ? "outline" : "default"}
                    className="h-9 rounded-md"
                    disabled={c.locked}
                    onClick={() => toast.success("Time capsule opened", { description: c.title })}
                  >
                    {c.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                    {c.locked ? "Sealed" : "Open"}
                  </Button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                className="rounded-md"
                onClick={() => {
                  toast.success("New time capsule created", {
                    description: "Sealed until day 100.",
                  });
                  setCapsuleOpen(false);
                }}
              >
                Create capsule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AppShell>
  );
}
