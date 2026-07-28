import { useState } from "react";
import { useChronis, DEVICE } from "@/lib/chronis";
import { ShieldCheck, AlertTriangle, XCircle, RotateCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export function StatusIndicator() {
  const { app } = useChronis();

  // Check if paused
  const isPaused = app.privacyPauseUntil ? Date.now() < app.privacyPauseUntil : false;

  // Check active signals count
  const activeSignals = Object.values(app.signals).filter(Boolean).length;
  const allSignalsOff = activeSignals === 0;

  // Determine state configuration
  let statusText = "Recording";
  let detailText = app.signals.audio ? "Audio processing on-device" : "Sensors active · Audio off";
  let BadgeIcon = ShieldCheck;
  let toneClass = "text-success border-success/20 bg-success-soft/30";
  let dotColor = "bg-success";

  if (isPaused) {
    statusText = "Paused";
    detailText = "Privacy pause active";
    BadgeIcon = AlertTriangle;
    toneClass = "text-warning border-warning/20 bg-warning-soft/30";
    dotColor = "bg-warning";
  } else if (allSignalsOff) {
    statusText = "Off";
    detailText = "All capture disabled";
    BadgeIcon = XCircle;
    toneClass = "text-destructive border-destructive/20 bg-destructive-soft/30";
    dotColor = "bg-destructive";
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2.5 rounded-md border px-2.5 py-1 text-xs font-medium ${toneClass} select-none transition-colors cursor-default`}
          >
            <span className="relative flex size-2">
              {!isPaused && !allSignalsOff && (
                <motion.span
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute inset-0 rounded-full ${dotColor}`}
                />
              )}
              <span className={`relative inline-flex size-2 rounded-full ${dotColor}`} />
            </span>
            <span className="font-semibold tracking-tight">{statusText}</span>
            <span className="hidden text-[11px] opacity-80 md:inline-block border-l border-current/20 pl-2">
              {detailText}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent align="center" className="w-64 rounded-lg p-3 text-xs space-y-2">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <BadgeIcon className="size-3.5" />
            Capture status: {statusText}
          </div>
          <p className="text-muted-foreground leading-normal">
            {allSignalsOff
              ? "All signals are disabled. Chronis is not recording or processing any data."
              : isPaused
                ? "Capture is temporarily paused. To resume, go to settings or toggle your pause settings."
                : "Chronis is capturing signals and processing them locally. Your keys never leave your hardware."}
          </p>
          <div className="border-t border-border pt-1.5 mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <RotateCw className="size-2.5" /> Last sync: {DEVICE.lastSync}
            </span>
            <span>Encrypted</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
