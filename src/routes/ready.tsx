import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Cpu, KeyRound, Sparkles } from "lucide-react";

import { TopNav } from "@/components/chrome/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MODES, useOnboarding } from "@/lib/onboarding";

export const Route = createFileRoute("/ready")({
  head: () => ({
    meta: [
      { title: "Setup complete — Chronis is ready to remember" },
      {
        name: "description",
        content:
          "Your device is paired, your vault is encrypted and your capture mode is set. Chronis is ready.",
      },
      { property: "og:title", content: "Chronis setup complete" },
      {
        property: "og:description",
        content: "Device paired, vault encrypted, capture mode selected.",
      },
    ],
  }),
  component: Ready,
});

function Ready() {
  const { state } = useOnboarding();
  const mode = MODES.find((m) => m.id === state.mode);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="relative mx-auto w-full max-w-3xl px-5 pb-24 pt-20 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 grid-backdrop"
          aria-hidden
        />
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
          className="relative mx-auto flex size-16 items-center justify-center rounded-md bg-success-soft text-success"
        >
          <CheckCircle2 className="size-8" />
        </motion.span>
        <h1 className="relative mt-6 text-3xl font-semibold tracking-tight sm:text-h1">
          Chronis is ready{state.name ? `, ${state.name.split(" ")[0]}` : ""}
        </h1>
        <p className="relative mx-auto mt-3 max-w-md text-body leading-relaxed text-muted-foreground">
          Onboarding is complete. Your dashboard, timeline and Trust Center are ready.
        </p>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Cpu, label: "Paired device", value: state.deviceId ?? "Not paired" },
            {
              icon: KeyRound,
              label: "Vault",
              value: state.vaultReady ? "Encrypted · AES-256" : "Pending",
            },
            { icon: Sparkles, label: "Mode", value: mode?.name ?? "Not selected" },
          ].map((c) => (
            <div key={c.label} className="surface-card p-5 text-left">
              <c.icon className="size-4 text-brand" />
              <p className="mt-3 text-meta uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-1 text-sm font-medium">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="surface-card relative mt-4 flex flex-col items-start gap-4 p-6 text-left sm:flex-row sm:items-center">
          <Clock className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <h3 className="text-h3 font-medium text-foreground">AI learning timeline</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Expected personalisation window: {mode?.learning ?? "—"}
            </p>
          </div>
          <Badge variant="secondary" className="rounded-md text-[11px]">
            Active
          </Badge>
        </div>

        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline" className="h-11 rounded-md px-6">
            <Link to="/mode">Change mode</Link>
          </Button>
          <Button asChild className="h-11 rounded-md px-6">
            <Link to="/dashboard">
              Open dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
