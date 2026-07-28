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
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="sticky top-16 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-5 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
              activeProps={{ className: "bg-secondary" }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link to="/" className="transition-colors hover:text-foreground">
              Chronis
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{breadcrumb}</span>
          </nav>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "surface-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
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
        <h2 className="text-h3 font-medium text-foreground tracking-tight">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
