import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Clock3, LayoutDashboard, Settings2 } from "lucide-react";

import { TopNav } from "@/components/chrome/TopNav";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/timeline", label: "Timeline", icon: Clock3 },
  { to: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function AppShell({
  title,
  description,
  breadcrumb,
  actions,
  children,
}: {
  title: string;
  description: string;
  breadcrumb: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <TopNav />

      <div className="sticky top-16 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-5 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md bg-slate-100 shadow-sm border border-slate-200/50"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex items-center gap-2 transition-colors duration-200",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[9px] font-normal text-muted-foreground"
          >
            <Link to="/" className="transition-colors hover:text-foreground">
              Chronis
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{breadcrumb}</span>
          </nav>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="mt-1.5 max-w-xl text-base font-medium leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>

          <div className="mt-7">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}

export function SectionCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -3, scale: 1.012, boxShadow: "var(--shadow-lift)" }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className={cn(
        "surface-card p-5 bg-card/75 backdrop-blur-md border border-border/60 rounded-xl transition-colors duration-300",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

export function CardHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
        {hint ? <p className="mt-0.5 text-[9px] font-normal text-muted-foreground leading-normal">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
