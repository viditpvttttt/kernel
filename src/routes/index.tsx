import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Command, Download, GitBranch, Layers, Lock, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AuroraField } from "@/components/aurora-field";
import { KernelMark, KernelWordmark } from "@/components/kernel-mark";
import { Button } from "@/components/ui/button";
import { KERNEL_MODELS } from "@/lib/models";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kernel — one calm home for every model" },
      {
        name: "description",
        content:
          "Kernel is a minimal, ambient chat workspace that runs open-source and frontier models side by side. Download for macOS, Windows and Linux.",
      },
      { property: "og:title", content: "Kernel — one calm home for every model" },
      {
        property: "og:description",
        content:
          "Switch between open-weight and frontier models mid-thread. Ambient, keyboard-first, quietly fast.",
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
      <AuroraField interactive />
      <SiteNav />
      <main className="relative">
        <Hero />
        <ModelStrip />
        <Features />
        <DownloadSection />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
          lifted ? "panel shadow-[0_18px_50px_-30px_oklch(0.2_0.02_300/0.5)]" : ""
        }`}
      >
        <Link to="/" aria-label="Kernel home">
          <KernelWordmark />
        </Link>
        <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a className="transition-colors hover:text-foreground" href="#models">
            Models
          </a>
          <a className="transition-colors hover:text-foreground" href="#craft">
            Craft
          </a>
          <a className="transition-colors hover:text-foreground" href="#download">
            Download
          </a>
          <a className="transition-colors hover:text-foreground" href="#faq">
            FAQ
          </a>
        </div>
        <Button asChild size="sm" className="rounded-full px-4">
          <Link to="/chat">
            Start chatting
            <ArrowRight />
          </Link>
        </Button>
      </nav>
    </header>
  );
}

/** Pointer-driven 3D tilt: perspective + rotate on a floating brand slab. */
function TiltMark() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: py * -22, y: px * 26, active: true });
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0, active: false })}
      className="relative mx-auto mt-14 w-full max-w-md"
      style={{ perspective: "1100px" }}
    >
      <div
        className="panel relative rounded-[2rem] p-8 transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0) scale(${
            tilt.active ? 1.02 : 1
          })`,
          transformStyle: "preserve-3d",
          boxShadow: "0 50px 90px -50px oklch(0.25 0.05 320 / 0.55)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ transform: "translateZ(46px)" }}
        >
          <KernelMark className="h-16 w-16" />
          <span className="rounded-full border border-border/70 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            v1.0 · beta
          </span>
        </div>
        <div className="mt-7 space-y-2.5" style={{ transform: "translateZ(30px)" }}>
          <div className="h-2.5 w-1/3 rounded-full bg-foreground/12" />
          <div className="h-2.5 w-full rounded-full bg-foreground/8" />
          <div className="h-2.5 w-4/5 rounded-full bg-foreground/8" />
        </div>
        <div
          className="mt-7 flex items-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-3.5 py-3 text-sm text-muted-foreground"
          style={{ transform: "translateZ(58px)" }}
        >
          <Command className="size-3.5" />
          Ask Kernel anything
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative px-5 pb-6 pt-16 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="size-1.5 rounded-full bg-aurora-3" />
          Open models and frontier models, one thread
        </p>
        <h1
          className="display-title animate-rise mt-7 text-[3.1rem] sm:text-7xl"
          style={{ animationDelay: "60ms" }}
        >
          Stop juggling
          <br />
          ten model tabs.
        </h1>
        <p
          className="animate-rise mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "140ms" }}
        >
          Kernel is a quiet workspace for thinking with machines. Swap models mid-conversation, keep
          every thread, and never lose the thread of your own thought.
        </p>
        <div
          className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "220ms" }}
        >
          <Button asChild size="lg" className="rounded-full px-6">
            <Link to="/chat">
              Start chatting
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
            <a href="#download">
              <Download />
              Download Kernel
            </a>
          </Button>
        </div>
      </div>
      <TiltMark />
    </section>
  );
}

function ModelStrip() {
  const rail = [...KERNEL_MODELS, ...KERNEL_MODELS];
  return (
    <section id="models" className="relative mt-24 overflow-hidden py-10">
      <p className="px-5 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {KERNEL_MODELS.length} models wired in, no keys required
      </p>
      <div className="relative mt-7 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex shrink-0 animate-[marquee_42s_linear_infinite] items-center gap-3 pr-3">
          {rail.map((model, index) => (
            <span
              key={`${model.id}-${index}`}
              className="panel whitespace-nowrap rounded-full px-4 py-2 text-sm text-muted-foreground"
            >
              {model.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Layers,
    title: "Every model, one surface",
    body: "Frontier reasoning or a fast open-weight Flash model — pick per message, not per app.",
  },
  {
    icon: GitBranch,
    title: "Threads that keep context",
    body: "Conversations are saved to your account, titled automatically, and picked back up anywhere.",
  },
  {
    icon: Zap,
    title: "Streaming with thinking",
    body: "Watch reasoning summaries arrive live, then read the answer. No spinner purgatory.",
  },
  {
    icon: Lock,
    title: "Yours alone",
    body: "Row-level security means your threads are readable only by you. No shared buckets.",
  },
];

function Features() {
  return (
    <section id="craft" className="relative px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="display-title max-w-xl text-4xl sm:text-5xl">
          Built for long thoughts, not loud interfaces.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="panel group rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <Icon className="size-5 text-foreground/70" />
              <h3 className="mt-4 text-base font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </div>
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
    <section id="download" className="relative px-5 py-20">
      <div className="panel mx-auto max-w-4xl overflow-hidden rounded-[2.25rem] p-8 sm:p-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="display-title text-4xl sm:text-5xl">Take Kernel with you.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              The desktop build wraps the same workspace in a native window with a global hotkey.
              Web works everywhere else — nothing to install.
            </p>
          </div>
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/chat">Use the web app</Link>
          </Button>
        </div>
        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          {PLATFORMS.map((platform) => (
            <a
              key={platform.name}
              href={`/downloads/${platform.file}`}
              className="group rounded-2xl border border-border/70 bg-background/55 p-5 transition-colors hover:border-foreground/25"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{platform.name}</span>
                <Download className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{platform.detail}</p>
              <p className="mt-4 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                {platform.file}
              </p>
            </a>
          ))}
        </div>
      </div>
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
  return (
    <section id="faq" className="relative px-5 pb-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="display-title text-4xl sm:text-5xl">Questions, answered quietly.</h2>
        <dl className="mt-10 divide-y divide-border/70 border-y border-border/70">
          {FAQS.map((item) => (
            <div key={item.q} className="py-6">
              <dt className="text-base font-medium">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-border/70 px-5 py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <KernelWordmark className="opacity-80" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kernel. Built for calm thinking.
        </p>
      </div>
    </footer>
  );
}
