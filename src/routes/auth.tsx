import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuroraField } from "@/components/aurora-field";
import { KernelWordmark } from "@/components/kernel-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type AuthSearch = { redirect?: string | undefined };

function safeRedirect(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/chat";
  return value;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in to Kernel — one calm home for every model" },
      {
        name: "description",
        content:
          "Sign in to Kernel to chat across open and frontier models with your history kept in sync.",
      },
      { property: "og:title", content: "Sign in to Kernel" },
      {
        property: "og:description",
        content: "One calm workspace for every model. Sign in to continue your threads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const target = safeRedirect(redirect);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorMsg =
        params.get("error_description") ||
        params.get("error") ||
        hashParams.get("error_description") ||
        hashParams.get("error");
      if (errorMsg) {
        toast.error(decodeURIComponent(errorMsg.replace(/\+/g, " ")));
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && session) navigate({ to: target });
  }, [loading, session, navigate, target]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${target}` },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
          setPassword("");
          return;
        }
        toast.success("Account created. You're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: target });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign you in");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(target)}`,
        },
      });

      if (error) {
        toast.error("Google sign-in failed: " + error.message);
        setBusy(false);
        return;
      }

      if (data?.url) {
        const check = await fetch(data.url, {
          headers: {
            apikey:
              import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
              process.env["SUPABASE_PUBLISHABLE_KEY"] ||
              "",
          },
          redirect: "manual",
        });

        if (check.status === 400) {
          const body = (await check.json().catch(() => null)) as { msg?: string } | null;
          if (body?.msg?.includes("missing OAuth secret") || body?.msg?.includes("Unsupported provider")) {
            toast.error(
              "Google OAuth is not enabled or missing Client Secret in Supabase. Please configure Google provider in your Supabase Dashboard.",
              { duration: 6000 }
            );
            setBusy(false);
            return;
          }
        }

        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not initiate Google sign-in");
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <AuroraField interactive />
      <div className="animate-rise panel relative w-full max-w-sm rounded-3xl p-7">
        <Link to="/" className="inline-flex">
          <KernelWordmark />
        </Link>
        <h1 className="display-title mt-7 text-3xl">
          {mode === "signin" ? "Welcome back." : "Make a Kernel."}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your threads, models and context — kept in one quiet place.
        </p>

        <Button variant="outline" className="mt-6 w-full" onClick={google} disabled={busy}>
          <GoogleGlyph />
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@studio.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-4.9 3.4-8.5Z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.7-2.9c-1 .7-2.3 1.1-3.6 1.1-2.9 0-5.3-1.9-6.2-4.5H2v3a11 11 0 0 0 10 6Z"
      />
      <path
        fill="#FBBC05"
        d="M5.8 14c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2v-3H2a11 11 0 0 0 0 10.2l3.8-2.8Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 0 0 2 6.6l3.8 3c.9-2.7 3.3-4.2 6.2-4.2Z"
      />
    </svg>
  );
}
