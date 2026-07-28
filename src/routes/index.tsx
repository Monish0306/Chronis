import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { TopNav } from "@/components/chrome/TopNav";
import { Button } from "@/components/ui/button";
import { ChronisHero } from "@/components/ChronisHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chronis — Your AI Memory Companion, Encrypted End to End" },
      {
        name: "description",
        content:
          "Chronis captures your life's signals into a private, end-to-end encrypted memory vault. You hold the key, you choose the mode.",
      },
      { property: "og:title", content: "Chronis — AI Memory Companion" },
      {
        property: "og:description",
        content:
          "A private, encrypted AI memory vault. Pair your device, set your key, choose your mode.",
      },
      { property: "og:image", content: "/logo/chronis-logo.png" },
      { name: "twitter:image", content: "/logo/chronis-logo.png" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <ChronisHero>
      <Welcome />
    </ChronisHero>
  );
}

const PILLARS = [
  {
    icon: Lock,
    title: "Encrypted on device",
    body: "AES-256-GCM keys are generated on your hardware and never leave it in readable form.",
  },
  {
    icon: KeyRound,
    title: "You hold the key",
    body: "A 12-word recovery phrase you own. Chronis cannot read, reset, or recover your vault.",
  },
  {
    icon: Waypoints,
    title: "Transparent AI",
    body: "Every signal Chronis learns from is listed, toggleable, and revocable at any moment.",
  },
];

const STATS = [
  { value: "AES-256", label: "Vault encryption" },
  { value: "0", label: "Plaintext servers" },
  { value: "6-digit", label: "Pairing verification" },
  { value: "100%", label: "Data ownership" },
];

function Welcome() {
  return (
    <div className="min-h-screen bg-transparent">
      <TopNav />
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] grid-backdrop"
          aria-hidden
        />
        <main className="relative mx-auto w-full max-w-6xl px-5 pb-28 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-medium text-muted-foreground shadow-soft">
              <Sparkles className="size-3.5 text-brand" />
              Private memory infrastructure
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              Your memory, <span className="brand-gradient-text">remembered privately</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed text-muted-foreground">
              Chronis turns the signals of your day into a searchable personal memory — sealed
              inside a vault only you can open.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 w-full rounded-md px-6 sm:w-auto">
                <Link to="/signup">
                  Get started <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-md px-6 sm:w-auto"
              >
                <Link to="/signup" search={{ mode: "login" }}>
                  I already have an account
                </Link>
              </Button>
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" />
              Setup takes about 3 minutes. Nothing is uploaded during onboarding.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-20 grid max-w-5xl gap-4 sm:grid-cols-3"
          >
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="surface-card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <p.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-h3 font-medium">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </motion.div>

          <div className="surface-card mx-auto mt-6 grid max-w-5xl grid-cols-2 divide-border sm:grid-cols-4 sm:divide-x">
            {STATS.map((s) => (
              <div key={s.label} className="px-6 py-6 text-center">
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-6 flex max-w-5xl flex-col items-start gap-4 rounded-lg border border-border bg-secondary/40 p-6 sm:flex-row sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-soft">
              <Cpu className="size-5" />
            </span>
            <div className="flex-1">
              <h3 className="text-h3 font-medium">Bring your Chronis band</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Pairing uses Bluetooth secure connections with mandatory 6-digit numeric comparison
                — the same class of verification used in banking hardware.
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <Fingerprint className="size-3.5 text-brand" /> Verified pairing
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
