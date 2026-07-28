import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";

import { TopNav } from "@/components/chrome/TopNav";
import { cn } from "@/lib/utils";

export const STEPS = [
  { id: 1, label: "Account", path: "/signup" },
  { id: 2, label: "Pairing", path: "/pairing" },
  { id: 3, label: "Vault", path: "/vault" },
  { id: 4, label: "Mode", path: "/mode" },
];

export function StepProgress({ current }: { current: number }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                  done && "border-success bg-success text-primary-foreground",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : step.id}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 bg-border">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: done ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-px origin-left bg-success"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OnboardingLayout({
  step,
  eyebrow,
  title,
  description,
  children,
}: {
  step: number;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <TopNav />
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 grid-backdrop"
          aria-hidden
        />
        <main className="relative mx-auto w-full max-w-5xl px-5 pb-24 pt-10">
          <StepProgress current={step} />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              <Lock className="size-3" />
              {eyebrow}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-base font-medium leading-relaxed text-muted-foreground">
              {description}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function TrustBanner({ text }: { text: string }) {
  return (
    <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-xs text-muted-foreground">
      <Lock className="size-3.5 shrink-0 text-success" />
      {text}
    </div>
  );
}
