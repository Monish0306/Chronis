import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Battery,
  Bluetooth,
  CheckCircle2,
  Cpu,
  Loader2,
  QrCode,
  Radar,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  Signal,
} from "lucide-react";
import { toast } from "sonner";

import { OnboardingLayout, TrustBanner } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NEARBY_DEVICES, useOnboarding } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pairing")({
  head: () => ({
    meta: [
      { title: "Pair your Chronis device — Verified Bluetooth handshake" },
      {
        name: "description",
        content:
          "Grant Bluetooth access, scan for your Chronis band and confirm the mandatory 6-digit numeric comparison to complete secure pairing.",
      },
      { property: "og:title", content: "Pair your Chronis device" },
      {
        property: "og:description",
        content: "Secure Bluetooth pairing with 6-digit numeric verification.",
      },
    ],
  }),
  component: Pairing,
});

type Stage = "permission" | "scanning" | "found" | "handshake" | "compare" | "success";

const PAIR_CODE = "418 296";

function RgbRing({ active }: { active: boolean }) {
  return (
    <div className="relative flex size-36 items-center justify-center">
      <motion.span
        aria-hidden
        animate={active ? { rotate: 360 } : { rotate: 0 }}
        transition={{ repeat: active ? Infinity : 0, duration: 3.2, ease: "linear" }}
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, oklch(0.7 0.17 250), oklch(0.75 0.16 190), oklch(0.78 0.15 150), oklch(0.8 0.16 90), oklch(0.7 0.17 250))",
          filter: "blur(1px)",
        }}
      />
      <span className="absolute inset-[3px] rounded-full bg-background" />
      <motion.span
        aria-hidden
        animate={active ? { scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] } : {}}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border border-brand/40"
      />
      <div className="relative flex size-24 items-center justify-center rounded-full bg-secondary/70">
        <Cpu className="size-9 text-foreground/70" />
      </div>
    </div>
  );
}

function Pairing() {
  const navigate = useNavigate();
  const { update } = useOnboarding();
  const [stage, setStage] = useState<Stage>("permission");
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmUnverified, setConfirmUnverified] = useState<string | null>(null);
  const device = NEARBY_DEVICES.find((d) => d.id === selected) ?? null;

  useEffect(() => {
    if (stage !== "scanning") return;
    setProgress(0);
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 8)), 110);
    const done = setTimeout(() => setStage("found"), 1600);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "handshake") return;
    const t = setTimeout(() => setStage("compare"), 2200);
    return () => clearTimeout(t);
  }, [stage]);

  function selectDevice(id: string, verified: boolean) {
    if (!verified) {
      setConfirmUnverified(id);
      return;
    }
    setSelected(id);
  }

  function confirmCode(match: boolean) {
    if (!match) {
      setStage("found");
      toast.error("Pairing aborted", {
        description: "Codes did not match. The connection was discarded.",
      });
      return;
    }
    setStage("success");
    update({ deviceId: selected, paired: true });
    toast.success("Device paired securely", {
      description: `${device?.name} is now a trusted device.`,
    });
  }

  return (
    <OnboardingLayout
      step={2}
      eyebrow="Step 2 of 4 · Device pairing"
      title="Pair your Chronis device"
      description="Pairing establishes an authenticated Bluetooth channel. Nothing is transmitted until both codes match."
    >
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="surface-card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {stage === "permission" && (
              <motion.div
                key="permission"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <Bluetooth className="size-6" />
                </span>
                <h2 className="mt-5 text-h2 font-semibold">Allow Bluetooth access</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Chronis uses Bluetooth Low Energy only to discover and authenticate your own band.
                  Discovery never leaves your device.
                </p>
                <p className="mt-2 text-xs text-destructive">
                  Without Bluetooth permission, Chronis cannot scan for, pair, or sync data with your wearable device.
                </p>
                <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button className="h-11 rounded-md px-6" onClick={() => setStage("scanning")}>
                    <Radar className="size-4" /> Allow & scan devices
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-md px-6"
                    onClick={() => setQrOpen(true)}
                  >
                    <QrCode className="size-4" /> Scan QR instead
                  </Button>
                </div>
              </motion.div>
            )}

            {stage === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-4"
              >
                <RgbRing active />
                <p className="mt-6 flex items-center gap-2 text-sm font-medium">
                  <Loader2 className="size-4 animate-spin text-brand" /> Scanning for nearby
                  devices…
                </p>
                <Progress value={progress} className="mt-4 h-1.5 w-64" />
                <div className="mt-8 w-full space-y-3">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border p-4"
                    >
                      <Skeleton className="size-10 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {stage === "found" && (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-h3 font-medium">Nearby devices</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-md"
                    onClick={() => setStage("scanning")}
                  >
                    <Radar className="size-3.5" /> Rescan
                  </Button>
                </div>
                <ul className="mt-4 space-y-3">
                  {NEARBY_DEVICES.map((d) => (
                    <li key={d.id}>
                      <button
                        onClick={() => selectDevice(d.id, d.verified)}
                        className={cn(
                          "group flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft",
                          selected === d.id
                            ? "border-brand bg-brand-soft/40"
                            : "border-border bg-background",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-10 items-center justify-center rounded-md",
                            d.verified
                              ? "bg-secondary text-foreground"
                              : "bg-warning-soft text-warning",
                          )}
                        >
                          {d.verified ? (
                            <Cpu className="size-5" />
                          ) : (
                            <ShieldAlert className="size-5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{d.name}</span>
                            {d.verified ? (
                              <Badge
                                className="rounded-md bg-success-soft text-[10px] text-success"
                                variant="secondary"
                              >
                                Trusted
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="rounded-md bg-warning-soft text-[10px] text-warning"
                              >
                                Unverified
                              </Badge>
                            )}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span>ID {d.id}</span>
                            <span className="flex items-center gap-1">
                              <Signal className="size-3" /> {d.signal} dBm · {d.distance}
                            </span>
                            {d.verified && (
                              <span className="flex items-center gap-1">
                                <Battery className="size-3" /> {d.battery}%
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {device && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-5"
                  >
                    <Separator />
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Firmware", device.firmware],
                        ["Battery", `${device.battery}%`],
                        ["Signature", "Valid · Chronis CA"],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-secondary/60 px-4 py-3">
                          <p className="text-[11px] text-muted-foreground">{k}</p>
                          <p className="mt-0.5 text-sm font-medium">{v}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="mt-5 h-11 w-full rounded-md"
                      onClick={() => setStage("handshake")}
                    >
                      Pair device <ArrowRight className="size-4" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {stage === "handshake" && (
              <motion.div
                key="handshake"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6"
              >
                <RgbRing active />
                <h2 className="mt-6 text-h2 font-semibold">Digital handshake in progress</h2>
                <div className="mt-4 w-full max-w-sm space-y-2.5">
                  {[
                    "Exchanging public keys",
                    "Deriving session secret",
                    "Verifying firmware signature",
                  ].map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.55 }}
                      className="flex items-center gap-2 rounded-lg bg-secondary/60 px-4 py-2.5 text-sm"
                    >
                      <RadioTower className="size-3.5 text-brand" /> {s}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {stage === "compare" && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-4 text-center"
              >
                <Badge variant="secondary" className="rounded-md text-[11px]">
                  Mandatory verification
                </Badge>
                <h2 className="mt-4 text-h2 font-semibold">Do the codes match?</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Compare this 6-digit code with the one shown on your Chronis band. Confirm only if
                  they are identical.
                </p>
                <div className="mt-6 flex gap-2">
                  {PAIR_CODE.replace(" ", "")
                    .split("")
                    .map((digit, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex size-12 items-center justify-center rounded-md border border-border bg-secondary/60 text-xl font-semibold tabular-nums"
                      >
                        {digit}
                      </motion.span>
                    ))}
                </div>
                <div className="mt-7 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button className="h-11 rounded-md px-6" onClick={() => confirmCode(true)}>
                    <CheckCircle2 className="size-4" /> Codes match
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-md px-6"
                    onClick={() => confirmCode(false)}
                  >
                    They don't match
                  </Button>
                </div>
              </motion.div>
            )}

            {stage === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="flex size-16 items-center justify-center rounded-full bg-success-soft text-success"
                >
                  <CheckCircle2 className="size-8" />
                </motion.span>
                <h2 className="mt-5 text-h2 font-semibold">Device paired securely</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {device?.name} is now a trusted device with an authenticated encrypted channel.
                </p>
                <Button
                  className="mt-6 h-11 rounded-md px-6"
                  onClick={() => navigate({ to: "/vault" })}
                >
                  Continue to vault setup <ArrowRight className="size-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="surface-card h-fit p-6">
          <span className="flex size-9 items-center justify-center rounded-md bg-brand-soft text-brand">
            <ShieldCheck className="size-4.5" />
          </span>
          <h3 className="mt-4 text-h3 font-medium text-foreground">Why the 6-digit check matters</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Numeric comparison defeats man-in-the-middle attacks during Bluetooth pairing. If a
            device shows a different code, the channel is not trustworthy.
          </p>
          <Separator className="my-5" />
          <ul className="space-y-3 text-xs text-muted-foreground">
            {[
              "Session keys rotate on every connection",
              "Firmware is signature-checked before trust",
              "Unverified peripherals require explicit confirmation",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" /> {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <TrustBanner text="Pairing happens locally over BLE. No memory data is exchanged during this step." />

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="rounded-lg sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan device QR code</DialogTitle>
            <DialogDescription>
              Point your camera at the code printed on the band's charging base.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-2">
            <div className="grid size-44 grid-cols-8 gap-0.5 rounded-lg border border-border bg-background p-3">
              {Array.from({ length: 64 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-[2px]",
                    (i * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent",
                  )}
                />
              ))}
            </div>
            <Button
              className="mt-5 h-10 w-full rounded-md"
              onClick={() => {
                setQrOpen(false);
                setSelected(NEARBY_DEVICES[0].id);
                setStage("handshake");
              }}
            >
              Simulate successful scan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(confirmUnverified)}
        onOpenChange={() => setConfirmUnverified(null)}
      >
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>This device is not verified</AlertDialogTitle>
            <AlertDialogDescription>
              Chronis could not validate this peripheral's firmware signature. Pairing with unknown
              hardware is not recommended.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md"
              onClick={() => {
                if (confirmUnverified) setSelected(confirmUnverified);
                toast.warning("Proceeding with an unverified device");
              }}
            >
              Continue anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OnboardingLayout>
  );
}
