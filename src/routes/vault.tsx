import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { OnboardingLayout, TrustBanner } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RECOVERY_PHRASE, useOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault key setup — Chronis end-to-end encryption" },
      {
        name: "description",
        content:
          "Generate your Chronis encryption key, save the 12-word recovery phrase and verify it. Only you can open your memory vault.",
      },
      { property: "og:title", content: "Chronis vault key setup" },
      {
        property: "og:description",
        content: "Generate and verify the recovery phrase for your encrypted memory vault.",
      },
    ],
  }),
  component: Vault,
});

type Stage = "intro" | "generating" | "phrase" | "verify" | "backup";

const CHECKLIST = [
  "I have written the phrase on paper, not in a screenshot",
  "I stored it somewhere only I can reach",
  "I understand Chronis cannot recover it for me",
];

function Vault() {
  const navigate = useNavigate();
  const { state, update } = useOnboarding();
  const [stage, setStage] = useState<Stage>("intro");
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [backup, setBackup] = useState(false);

  const quizIndexes = useMemo(() => [2, 6, 10], []);

  useEffect(() => {
    if (stage !== "generating") return;
    setProgress(0);
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 6)), 90);
    const done = setTimeout(() => setStage("phrase"), 1800);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [stage]);

  const allChecked = checks.every(Boolean);
  const verified = quizIndexes.every((i) => answers[i] === RECOVERY_PHRASE[i]);
  const score =
    40 +
    (stage === "phrase" || stage === "verify" ? 25 : 0) +
    (verified ? 25 : 0) +
    (backup ? 10 : 0);

  function finish() {
    update({ vaultReady: true, cloudBackup: backup });
    toast.success("Vault secured", {
      description: "Your encryption key is active on this device.",
    });
    navigate({ to: "/mode" });
  }

  return (
    <OnboardingLayout
      step={3}
      eyebrow="Step 3 of 4 · Vault key"
      title="Create your encryption key"
      description="Your vault key is generated on this device and never transmitted. The recovery phrase is the only way back in."
    >
      <TooltipProvider delayDuration={200}>
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
          <div className="surface-card p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {stage === "intro" && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="py-2"
                >
                  <span className="flex size-14 items-center justify-center rounded-md bg-brand-soft text-brand">
                    <KeyRound className="size-6" />
                  </span>
                  <h2 className="mt-5 text-h2 font-semibold">How Chronis encryption works</h2>
                  <div className="mt-4 space-y-3">
                    {[
                      [
                        "Key generated locally",
                        "A 256-bit key is derived on your device using hardware entropy.",
                      ],
                      [
                        "Memories sealed before leaving",
                        "Every record is encrypted before it touches any network.",
                      ],
                      [
                        "Zero-knowledge servers",
                        "Chronis stores ciphertext it mathematically cannot read.",
                      ],
                    ].map(([t, d]) => (
                      <div key={t} className="flex gap-3 rounded-lg bg-secondary/60 p-4">
                        <Lock className="mt-0.5 size-4 shrink-0 text-success" />
                        <div>
                          <p className="text-sm font-medium">{t}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <p className="text-sm leading-relaxed text-foreground/80">
                      There is no password reset. If you lose the recovery phrase, your memories are
                      permanently unreadable — including to us.
                    </p>
                  </div>
                  <Button
                    className="mt-6 h-11 w-full rounded-md"
                    onClick={() => setStage("generating")}
                  >
                    Generate encryption key <ArrowRight className="size-4" />
                  </Button>
                </motion.div>
              )}

              {stage === "generating" && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-12"
                >
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="flex size-20 items-center justify-center rounded-lg bg-brand-soft text-brand"
                  >
                    <Lock className="size-8" />
                  </motion.span>
                  <p className="mt-6 flex items-center gap-2 text-sm font-medium">
                    <Loader2 className="size-4 animate-spin text-brand" /> Deriving AES-256-GCM key
                    material…
                  </p>
                  <Progress value={progress} className="mt-4 h-1.5 w-64" />
                  <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                    entropy · {Math.min(256, Math.round(progress * 2.56))} / 256 bits
                  </p>
                </motion.div>
              )}

              {stage === "phrase" && (
                <motion.div
                  key="phrase"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-h2 font-semibold">Your 12-word recovery phrase</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Write these down in order.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-md"
                      onClick={() => setRevealed((r) => !r)}
                    >
                      {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      {revealed ? "Hide" : "Reveal"}
                    </Button>
                  </div>

                  <div className="relative mt-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {RECOVERY_PHRASE.map((word, i) => (
                        <div
                          key={word}
                          className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5"
                        >
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium">{word}</span>
                        </div>
                      ))}
                    </div>
                    {!revealed && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-md">
                        <Button
                          variant="outline"
                          className="rounded-md"
                          onClick={() => setRevealed(true)}
                        >
                          <Eye className="size-4" /> Tap to reveal
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md"
                          onClick={() => {
                            navigator.clipboard?.writeText(RECOVERY_PHRASE.join(" "));
                            toast.warning("Copied to clipboard", {
                              description: "Clear your clipboard once the phrase is written down.",
                            });
                          }}
                        >
                          <Copy className="size-3.5" /> Copy phrase
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Paper storage is safer than clipboard</TooltipContent>
                    </Tooltip>
                  </div>

                  <Separator className="my-5" />
                  <p className="text-sm font-medium">Recovery checklist</p>
                  <div className="mt-3 space-y-2.5">
                    {CHECKLIST.map((item, i) => (
                      <label
                        key={item}
                        className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <Checkbox
                          checked={checks[i]}
                          onCheckedChange={(v) =>
                            setChecks((c) => c.map((val, idx) => (idx === i ? Boolean(v) : val)))
                          }
                          className="mt-0.5"
                        />
                        {item}
                      </label>
                    ))}
                  </div>

                  <Button
                    className="mt-6 h-11 w-full rounded-md"
                    disabled={!allChecked}
                    onClick={() => setStage("verify")}
                  >
                    Verify phrase <ArrowRight className="size-4" />
                  </Button>
                </motion.div>
              )}

              {stage === "verify" && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-h2 font-semibold">Confirm your phrase</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select the correct word for each position to prove you saved it.
                  </p>
                  <div className="mt-5 space-y-5">
                    {quizIndexes.map((qi) => {
                      const options = [
                        RECOVERY_PHRASE[qi],
                        RECOVERY_PHRASE[(qi + 3) % 12],
                        RECOVERY_PHRASE[(qi + 7) % 12],
                      ]
                        .slice()
                        .sort();
                      return (
                        <div key={qi}>
                          <p className="text-sm font-medium">Word #{qi + 1}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setAnswers((a) => ({ ...a, [qi]: opt }))}
                                className={cn(
                                  "rounded-md border px-4 py-2 text-sm transition-all hover:-translate-y-0.5",
                                  answers[qi] === opt
                                    ? "border-brand bg-brand-soft text-foreground"
                                    : "border-border bg-background text-muted-foreground",
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {Object.keys(answers).length === 3 && !verified && (
                    <p className="mt-5 flex items-center gap-2 rounded-lg bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
                      <AlertTriangle className="size-4" /> One or more words are incorrect. Check
                      your written phrase.
                    </p>
                  )}
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="outline"
                      className="h-11 rounded-md sm:w-40"
                      onClick={() => setStage("phrase")}
                    >
                      Show phrase again
                    </Button>
                    <Button
                      className="h-11 flex-1 rounded-md"
                      disabled={!verified}
                      onClick={() => setStage("backup")}
                    >
                      {verified ? "Phrase verified" : "Verify phrase"}{" "}
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {stage === "backup" && (
                <motion.div
                  key="backup"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="flex size-14 items-center justify-center rounded-md bg-success-soft text-success">
                    <CheckCircle2 className="size-6" />
                  </span>
                  <h2 className="mt-5 text-h2 font-semibold">Vault encrypted and active</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Optionally store an encrypted copy of your key file in Chronis Cloud. It stays
                    useless without your phrase.
                  </p>
                  <div className="mt-5 flex items-start gap-4 rounded-lg border border-border p-4">
                    <span className="flex size-10 items-center justify-center rounded-md bg-secondary">
                      <Cloud className="size-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Encrypted cloud backup</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Zero-knowledge backup of the ciphertext key blob. Optional and reversible.
                      </p>
                      <p className="mt-2 text-[11px] text-destructive leading-normal font-medium">
                        If disabled, your recovery phrase is the only way to recover your vault. If you lose both your device and phrase, your memories are lost forever.
                      </p>
                    </div>
                    <Switch checked={backup} onCheckedChange={setBackup} />
                  </div>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" className="h-11 rounded-md sm:w-32" onClick={finish}>
                      Skip
                    </Button>
                    <Button className="h-11 flex-1 rounded-md" onClick={finish}>
                      {backup ? "Enable backup & continue" : "Continue"}{" "}
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="surface-card h-fit p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-h3 font-medium text-foreground">Vault security score</h3>
              <Badge variant="secondary" className="rounded-md text-[11px]">
                {score}/100
              </Badge>
            </div>
            <Progress value={score} className="mt-3 h-2" />
            <ul className="mt-5 space-y-3 text-xs text-muted-foreground">
              {[
                ["Key generated on device", stage !== "intro"],
                ["Recovery phrase saved", allChecked],
                ["Phrase verified", verified],
                ["Encrypted cloud backup", backup],
              ].map(([label, done]) => (
                <li key={String(label)} className="flex items-center gap-2">
                  <CheckCircle2 className={cn("size-3.5", done ? "text-success" : "text-border")} />
                  <span className={done ? "text-foreground" : ""}>{label}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-5" />
            <div className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
              Vault owner: {state.email || "this device"} · AES-256-GCM · Argon2id key stretching
            </div>
          </aside>
        </div>
      </TooltipProvider>
      <TrustBanner text="Your recovery phrase never leaves this screen. Chronis servers never receive it." />
    </OnboardingLayout>
  );
}
