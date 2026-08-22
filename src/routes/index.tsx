import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUp, Command, Download, GitBranch, Layers, Lock, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AuroraField } from "@/components/aurora-field";
import { KernelMark, KernelWordmark } from "@/components/kernel-mark";
import { CardStack, Magnetic, Reveal, WordReveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { KERNEL_MODELS } from "@/lib/models";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kernel — intelligence, unbound by model" },
      {
        name: "description",
        content:
          "Kernel is a tactile, minimal chat workspace that runs open-weight and frontier models in one thread. Download for macOS, Windows and Linux.",
      },
      { property: "og:title", content: "Kernel — intelligence, unbound by model" },
      {
        property: "og:description",
        content:
          "Swap models mid-conversation, keep every thread, and never lose the thread of your own thought.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraField interactive intensity={0.55} />
      <PillNav />
      <main className="relative">
        <Hero />
        <SpectralStrip />
        <ModelBand />
        <FeatureBento />
        <WorkspacePreview />
        <DownloadSection />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}

function PillNav() {
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <nav
        className={`pointer-events-auto flex items-center gap-6 rounded-full border border-foreground/[0.07] bg-background/75 px-4 py-2 backdrop-blur-xl transition-shadow duration-500 ${
          lifted ? "shadow-[0_18px_44px_-28px_oklch(0.2_0.02_300/0.55)]" : "shadow-sm"
        }`}
      >
        <Link to="/" aria-label="Kernel home" className="shrink-0">
          <KernelWordmark className="text-base [&_span]:text-[1.15rem]" />
        </Link>
        <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <a className="transition-colors hover:text-foreground" href="#models">
            Models
          </a>
          <a className="transition-colors hover:text-foreground" href="#craft">
            Features
          </a>
          <a className="transition-colors hover:text-foreground" href="#download">
            Download
          </a>
          <a className="transition-colors hover:text-foreground" href="#faq">
            FAQ
          </a>
        </div>
        <Magnetic strength={5}>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to="/chat">Get started</Link>
          </Button>
        </Magnetic>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-6 pb-14 pt-36 text-center sm:pt-40">
      <div className="relative z-10 mx-auto max-w-4xl">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-card/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-aurora-3" />
            Open-weight and frontier models, one thread
          </p>
        </Reveal>

        <h1 className="display-title mt-8 text-[3.2rem] italic leading-[0.92] tracking-tight sm:text-7xl md:text-[5.4rem]">
          <WordReveal text={"Intelligence,\nunbound by model."} stagger={70} />
        </h1>

        <Reveal delay={220}>
          <p className="mx-auto mt-7 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground sm:text-lg">
            The multi-model workspace for people who think out loud. Swap models mid-conversation,
            keep every thread, and never lose the thread of your own thought.
          </p>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic strength={8}>
              <Button asChild size="lg" className="rounded-xl px-7 text-base">
                <a href="#download">
                  <Download />
                  Download desktop
                </a>
              </Button>
            </Magnetic>
            <Magnetic strength={8}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-foreground/10 bg-card px-7 text-base"
              >
                <Link to="/chat">
                  Open web app
                  <ArrowRight />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Grainy spectral gradient strip — the signature band from the reference art. */
function SpectralStrip() {
  return (
    <Reveal className="relative mx-auto max-w-6xl px-6">
      <div className="grain spectral-strip h-24 w-full overflow-hidden rounded-2xl opacity-90 sm:h-28" />
    </Reveal>
  );
}

function ModelBand() {
  const rail = [...KERNEL_MODELS, ...KERNEL_MODELS];
  return (
    <section
      id="models"
      className="relative mt-10 border-y border-foreground/[0.06] bg-card/40 py-12 backdrop-blur-sm"
    >
      <p className="px-5 text-center text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
        {KERNEL_MODELS.length} models wired in · no keys required
      </p>
      <div className="mt-8 flex overflow-hidden whitespace-nowrap [mask-image:linear-gradient(90deg,transparent,black_14%,black_86%,transparent)]">
        <div className="flex shrink-0 animate-[marquee_46s_linear_infinite] items-center gap-14 pr-14">
          {rail.map((model, index) => (
            <span
              key={`${model.id}-${index}`}
              className="display-title text-2xl italic text-muted-foreground/70 transition-colors duration-300 hover:text-foreground"
            >
              {model.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBento() {
  return (
    <section id="craft" className="relative mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <h2 className="display-title max-w-2xl text-4xl italic sm:text-5xl">
          Built for long thoughts, not loud interfaces.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-6">
        {/* Wide: thread rails */}
        <Reveal className="md:col-span-4" delay={60}>
          <article className="tile group flex h-full flex-col justify-between overflow-hidden rounded-3xl p-8 transition-transform duration-500 hover:-translate-y-1">
            <div>
              <Layers className="size-5 text-foreground/60" />
              <h3 className="display-title mt-5 text-3xl italic">Unified thread rails</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Every conversation is titled, saved and searchable. Compare how two models answered
                without losing the context you built.
              </p>
            </div>
            <div className="mt-9 flex gap-2.5">
              {["aurora-1", "aurora-3", "aurora-5"].map((tone, index) => (
                <div
                  key={tone}
                  className="h-20 flex-1 rounded-xl border transition-transform duration-500 group-hover:-translate-y-1"
                  style={{
                    background: `color-mix(in oklab, var(--${tone}) 24%, transparent)`,
                    borderColor: `color-mix(in oklab, var(--${tone}) 45%, transparent)`,
                    transitionDelay: `${index * 70}ms`,
                  }}
                />
              ))}
            </div>
          </article>
        </Reveal>

        {/* Ink tile: privacy */}
        <Reveal className="md:col-span-2" delay={140}>
          <article className="tile-ink flex h-full flex-col justify-end rounded-3xl p-8">
            <div className="mb-6 flex size-12 items-center justify-center rounded-full border border-background/25">
              <Lock className="size-4" />
            </div>
            <h3 className="display-title text-3xl italic">Yours alone</h3>
            <p className="mt-3 text-sm leading-relaxed opacity-65">
              Row-level security means your threads are readable only by you. No shared buckets, no
              training on your words.
            </p>
          </article>
        </Reveal>

        {/* Reasoning */}
        <Reveal className="md:col-span-2" delay={200}>
          <article
            className="flex h-full flex-col rounded-3xl p-8"
            style={{
              background: "color-mix(in oklab, var(--aurora-5) 12%, transparent)",
              border: "1px solid color-mix(in oklab, var(--aurora-5) 34%, transparent)",
            }}
          >
            <Zap className="size-5 text-foreground/60" />
            <h3 className="display-title mt-5 text-3xl italic">Reasoning, visible</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Watch the thinking arrive live, then read the answer. No spinner purgatory.
            </p>
            <div className="mt-auto space-y-2 pt-8">
              <div className="h-2 w-full rounded-full bg-foreground/10" />
              <div className="h-2 w-3/4 rounded-full bg-foreground/10" />
              <div className="h-2 w-1/2 rounded-full bg-foreground/10" />
            </div>
          </article>
        </Reveal>

        {/* Wide: composer with card stack */}
        <Reveal className="md:col-span-4" delay={260}>
          <article className="tile flex h-full flex-col items-start gap-8 rounded-3xl p-8 sm:flex-row sm:items-center">
            <div className="flex-1">
              <GitBranch className="size-5 text-foreground/60" />
              <h3 className="display-title mt-5 text-3xl italic">The composer</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Switch models from inside the message box — the next reply uses a different mind and
                the same memory.
              </p>
            </div>
            <CardStack
              className="h-32 w-full shrink-0 sm:w-52"
              items={KERNEL_MODELS.slice(0, 4).map((model) => ({
                id: model.id,
                node: (
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-foreground/[0.07] bg-background/85 p-4 shadow-sm backdrop-blur">
                    <span className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                      Model
                    </span>
                    <span className="display-title text-xl italic leading-tight">
                      {model.label}
                    </span>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full rounded-full bg-aurora-3/45" />
                      <div className="h-2 w-4/5 rounded-full bg-aurora-1/45" />
                    </div>
                  </div>
                ),
              }))}
            />
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/** Static, tactile mock of the signed-in workspace. */
function WorkspacePreview() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-8">
      <Reveal>
        <div className="tile flex h-[30rem] overflow-hidden rounded-[2.5rem]">
          <aside className="hidden w-60 shrink-0 flex-col border-r border-foreground/[0.06] bg-background/50 p-6 md:flex">
            <div className="mb-9 flex items-center gap-2 text-muted-foreground">
              <KernelMark className="size-4" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">
                Threads
              </span>
            </div>
            <div className="space-y-3">
              {["Symbolic logic, compared", "Rewrite the launch note", "Local weights setup"].map(
                (thread, index) => (
                  <div
                    key={thread}
                    className={`truncate rounded-xl px-3 py-2 text-xs ${
                      index === 0
                        ? "bg-accent/70 text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {thread}
                  </div>
                ),
              )}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-16 items-center justify-between border-b border-foreground/[0.06] px-7">
              <div className="flex items-center gap-3">
                <span className="size-6 rounded-md bg-aurora-1/60" />
                <span className="text-sm font-medium">{KERNEL_MODELS[0]?.label}</span>
              </div>
              <div className="flex gap-2">
                <span className="size-8 rounded-full bg-foreground/[0.06]" />
                <span className="size-8 rounded-full bg-foreground/[0.06]" />
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-hidden p-7">
              <div className="ml-auto w-fit max-w-sm rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                Compare open-weight and frontier reasoning on symbolic logic.
              </div>
              <div className="flex gap-4">
                <span className="mt-1 size-7 shrink-0 rounded-lg bg-foreground" />
                <div className="min-w-0 space-y-3">
                  <p className="text-xs italic text-muted-foreground">Thinking…</p>
                  <div
                    className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "color-mix(in oklab, var(--aurora-3) 10%, transparent)",
                      border: "1px solid color-mix(in oklab, var(--aurora-3) 26%, transparent)",
                    }}
                  >
                    Frontier models still lead on zero-shot deduction, but the open-weight gap is
                    closing fast on structured proofs.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-7 pt-0">
              <div className="flex min-h-[5.5rem] flex-col rounded-2xl border border-foreground/[0.09] bg-background/70 p-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Command className="size-3.5" />
                  Ask Kernel anything…
                </p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="rounded-md border border-foreground/[0.07] bg-card px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Shift + ↵
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ArrowUp className="size-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const PLATFORMS = [
  { name: "macOS", detail: "Apple silicon · Intel", file: "Kernel-1.0.0-universal.dmg" },
  { name: "Windows", detail: "x64 · arm64", file: "Kernel-Setup-1.0.0.exe" },
  { name: "Linux", detail: "AppImage · deb", file: "Kernel-1.0.0.AppImage" },
];

function DownloadSection() {
  return (
    <section id="download" className="relative px-6 py-24">
      <Reveal>
        <div className="tile mx-auto max-w-4xl overflow-hidden rounded-[2.25rem] p-8 sm:p-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="display-title text-4xl italic sm:text-5xl">Take Kernel with you.</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                The desktop build wraps the same workspace in a native window with a global hotkey.
                Web works everywhere else — nothing to install.
              </p>
            </div>
            <Magnetic strength={6}>
              <Button asChild variant="outline" className="rounded-xl border-foreground/10">
                <Link to="/chat">Use the web app</Link>
              </Button>
            </Magnetic>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {PLATFORMS.map((platform, index) => (
              <Reveal key={platform.name} delay={index * 90}>
                <a
                  href={`/downloads/${platform.file}`}
                  className="group block rounded-2xl border border-foreground/[0.07] bg-background/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{platform.name}</span>
                    <Download className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-y-0.5" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{platform.detail}</p>
                  <p className="mt-5 truncate text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {platform.file}
                  </p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FAQS = [
  {
    q: "Do I need my own API keys?",
    a: "No. Kernel ships with model access built in — sign in and start typing.",
  },
  {
    q: "Can I switch models inside a conversation?",
    a: "Yes. The picker sits in the composer, so the next message can use a different model with the same context.",
  },
  {
    q: "Where is my history stored?",
    a: "In your Kernel account, protected by row-level security so only you can read your threads.",
  },
  {
    q: "Is the desktop app required?",
    a: "Never. It is the same workspace with a native window and a global hotkey.",
  },
];

function Faq() {
  const [open, setOpen] = useState<string | null>(FAQS[0]?.q ?? null);

  return (
    <section id="faq" className="relative px-6 pb-28">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="display-title text-4xl italic sm:text-5xl">Questions, answered quietly.</h2>
        </Reveal>
        <div className="mt-12 space-y-3">
          {FAQS.map((item, index) => {
            const expanded = open === item.q;
            return (
              <Reveal key={item.q} delay={index * 70}>
                <div className="tile overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : item.q)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-base font-medium">{item.q}</span>
                    <span
                      className="text-muted-foreground transition-transform duration-500"
                      style={{ transform: expanded ? "rotate(45deg)" : "none" }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      gridTemplateRows: expanded ? "1fr" : "0fr",
                      opacity: expanded ? 1 : 0,
                    }}
                  >
                    <p className="overflow-hidden px-6 text-sm leading-relaxed text-muted-foreground">
                      <span className="block pb-5">{item.a}</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-foreground/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <KernelWordmark className="opacity-80" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kernel. Built for calm thinking.
        </p>
      </div>
    </footer>
  );
}
