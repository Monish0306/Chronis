"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      asChild
      className="h-full w-full flex-1 bg-gradient-to-r from-primary to-secondary transition-all"
    >
      <motion.div
        initial={{ transform: "translateX(-100%)" }}
        animate={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
      />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
