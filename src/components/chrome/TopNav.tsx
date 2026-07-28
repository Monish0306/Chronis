import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Bot, Command, Search, ShieldCheck, Sparkles, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOnboarding } from "@/lib/onboarding";

const NOTIFICATIONS = [
  { title: "Firmware 2.4.1 verified", body: "Signed by Chronis Security Team", time: "2m ago" },
  { title: "New device detected nearby", body: "Chronis Band · Graphite (0.4 m)", time: "11m ago" },
  {
    title: "Vault encryption ready",
    body: "AES-256-GCM key material generated locally",
    time: "1h ago",
  },
];

const SEARCH_RESULTS = [
  { label: "Pair a new device", hint: "Onboarding · Step 2" },
  { label: "Recovery phrase", hint: "Vault · Security" },
  { label: "Change capture mode", hint: "Modes · Privacy" },
  { label: "What data does Chronis store?", hint: "Help centre" },
];

export function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { state } = useOnboarding();
  const initials = state.name
    ? state.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CH";

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-5">
          <Link to="/" className="group flex items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-soft"
            >
              <Sparkles className="size-4.5" />
            </motion.span>
            <span className="text-[15px] font-semibold tracking-tight">Chronis</span>
            <Badge
              variant="secondary"
              className="ml-1 hidden rounded-md text-[10px] font-medium sm:inline-flex"
            >
              Beta
            </Badge>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <StatusIndicator />
            
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary md:flex"
            >
              <Search className="size-4" />
              <span className="pr-6">Search Chronis</span>
              <kbd className="flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <Command className="size-2.5" />K
              </kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-md"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-4" />
            </Button>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-md"
                      aria-label="Notifications"
                    >
                      <Bell className="size-4" />
                      <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <PopoverContent align="end" className="w-80 rounded-lg p-0">
                <div className="px-4 py-3 text-sm font-semibold">Notifications</div>
                <Separator />
                <ul className="divide-y divide-border">
                  {NOTIFICATIONS.map((n) => (
                    <li key={n.title} className="px-4 py-3 transition-colors hover:bg-secondary/60">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>

            <Sheet>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-md" aria-label="AI assistant">
                      <Bot className="size-4" />
                    </Button>
                  </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>AI assistant</TooltipContent>
              </Tooltip>
              <SheetContent className="w-full gap-0 sm:max-w-md rounded-l-lg">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Bot className="size-4 text-brand" /> Chronis Assistant
                  </SheetTitle>
                  <SheetDescription>
                    Transparent answers about what Chronis does with your data.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-3 px-4 pb-6">
                  <div className="surface-card p-4 text-sm leading-relaxed text-muted-foreground">
                    Everything you capture is encrypted on your device with a key only you hold. I
                    can explain any step of the setup — pairing, vault keys, or capture modes.
                  </div>
                  {[
                    "How is my recovery phrase stored?",
                    "What does Raw Vault mode disable?",
                    "Can I change mode later?",
                  ].map((q) => (
                    <button
                      key={q}
                      className="rounded-md border border-border bg-background px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:shadow-soft"
                    >
                      {q}
                    </button>
                  ))}
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-success-soft px-3 py-2 text-xs text-foreground/70">
                    <ShieldCheck className="size-3.5 text-success" />
                    Answers are generated locally from device documentation.
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 rounded-md px-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold">
                    {initials}
                  </span>
                  <span className="hidden text-sm font-medium sm:inline">
                    {state.name || "Guest"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-lg">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {state.email || "Not signed in"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShieldCheck className="size-4" /> Security centre
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="rounded-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Find setup steps, security topics and device help.
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="Search Chronis…" autoFocus className="h-11 rounded-md" />
          <ul className="mt-1 space-y-1">
            {SEARCH_RESULTS.map((r) => (
              <li key={r.label}>
                <button className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary">
                  <span>{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
