import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Github, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { OnboardingLayout, TrustBanner } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOnboarding } from "@/lib/onboarding";

const searchSchema = z.object({ mode: z.enum(["signup", "login"]).optional() });

export const Route = createFileRoute("/signup")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Create your Chronis account — Secure sign up" },
      {
        name: "description",
        content:
          "Create a Chronis account to begin secure device pairing and encrypted vault setup.",
      },
      { property: "og:title", content: "Create your Chronis account" },
      {
        property: "og:description",
        content: "Secure sign up for the Chronis encrypted memory vault.",
      },
    ],
  }),
  component: SignUp,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

function strengthOf(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function SignUp() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { update } = useOnboarding();
  const [tab, setTab] = useState<"signup" | "login">(mode === "login" ? "login" : "signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = strengthOf(form.password);
  const strengthLabels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = tab === "login" ? { ...form, name: form.name || "Chronis User" } : form;
    const parsed = formSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted fields");
      return;
    }
    if (tab === "signup" && !agree) {
      toast.error("Please accept the privacy terms to continue");
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      update({ name: parsed.data.name, email: parsed.data.email });
      setLoading(false);
      toast.success(tab === "login" ? "Welcome back" : "Account created", {
        description: "Next: pair your Chronis device.",
      });
      navigate({ to: "/pairing" });
    }, 900);
  }

  return (
    <OnboardingLayout
      step={1}
      eyebrow="Step 1 of 4 · Account"
      title={tab === "login" ? "Welcome back to Chronis" : "Create your Chronis account"}
      description="Your account identifies your devices. It never holds the key to your memories — only you do."
    >
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_340px]">
        <div className="surface-card p-6 sm:p-8">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signup" | "login")}>
            <TabsList className="grid w-full grid-cols-2 rounded-md">
              <TabsTrigger value="signup" className="rounded-md">
                Sign up
              </TabsTrigger>
              <TabsTrigger value="login" className="rounded-md">
                Log in
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {tab === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ava Mercer"
                  className="h-11 rounded-md"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ava@company.com"
                className="h-11 rounded-md"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                maxLength={128}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••"
                className="h-11 rounded-md"
              />
              {tab === "signup" && form.password.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex h-1 flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i < strength ? "bg-success" : "bg-border"} transition-colors`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {tab === "signup" && (
              <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-muted-foreground">
                <Checkbox
                  checked={agree}
                  onCheckedChange={(v) => setAgree(Boolean(v))}
                  className="mt-0.5"
                />
                <span>
                  I understand Chronis stores my memories encrypted and that losing my recovery
                  phrase means losing access permanently.
                </span>
              </label>
            )}

            <Button type="submit" disabled={loading} className="h-11 w-full rounded-md">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Securing account…
                </>
              ) : (
                <>
                  {tab === "login" ? "Log in" : "Create account"} <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <div className="relative py-1">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                or
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md"
                onClick={() => toast.info("SSO is available in the enterprise plan")}
              >
                <Mail className="size-4" /> Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md"
                onClick={() => toast.info("SSO is available in the enterprise plan")}
              >
                <Github className="size-4" /> GitHub
              </Button>
            </div>
          </form>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="surface-card h-fit p-6"
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-success-soft text-success">
            <ShieldCheck className="size-4.5" />
          </span>
          <h3 className="mt-4 text-h3 font-medium text-foreground">What we store about you</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            {[
              "Email and display name, for device management only",
              "A device registry of public identifiers",
              "Never: memories, audio, location or vault keys",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-lg bg-secondary/70 p-3 text-xs leading-relaxed text-muted-foreground">
            Account credentials are hashed with Argon2id. Sessions expire after 30 days of
            inactivity.
          </div>
        </motion.aside>
      </div>
      <TrustBanner text="Encrypted transport · No memory data is transmitted during account creation." />
    </OnboardingLayout>
  );
}
