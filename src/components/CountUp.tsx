import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

export function CountUp({
  value,
  duration = 1.2,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1], // Smooth custom cubic bezier easing
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [value, duration, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
