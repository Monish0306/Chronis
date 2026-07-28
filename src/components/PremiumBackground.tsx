import { motion, useReducedMotion } from "framer-motion";

export function PremiumBackground() {
  const shouldReduceMotion = useReducedMotion();

  // Animation values for blobs. If prefers-reduced-motion is true, they remain static.
  const blob1Animation = shouldReduceMotion
    ? {}
    : {
        x: [0, 30, -15, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.05, 0.95, 1],
      };

  const blob2Animation = shouldReduceMotion
    ? {}
    : {
        x: [0, -25, 30, 0],
        y: [0, 35, -30, 0],
        scale: [1, 0.95, 1.05, 1],
      };

  const blob3Animation = shouldReduceMotion
    ? {}
    : {
        x: [0, 15, -20, 0],
        y: [0, 25, -20, 0],
      };

  const transitions = (duration: number) => ({
    duration,
    repeat: Infinity,
    ease: "easeInOut",
  });

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-white pointer-events-none select-none">
      {/* Aurora glow blobs */}
      <motion.div
        animate={blob1Animation}
        transition={shouldReduceMotion ? {} : transitions(25)}
        className="absolute -left-1/4 -top-1/4 w-[65vw] h-[65vw] rounded-full bg-blue-400/5 blur-[120px]"
      />
      <motion.div
        animate={blob2Animation}
        transition={shouldReduceMotion ? {} : transitions(32)}
        className="absolute -right-1/4 -bottom-1/4 w-[65vw] h-[65vw] rounded-full bg-purple-400/5 blur-[120px]"
      />
      <motion.div
        animate={blob3Animation}
        transition={shouldReduceMotion ? {} : transitions(20)}
        className="absolute left-[25%] top-[15%] w-[55vw] h-[55vw] rounded-full bg-emerald-300/3 blur-[100px]"
      />

      {/* Radial soft light gradient to center attention */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-white/50 to-white/95" />

      {/* Light premium noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
