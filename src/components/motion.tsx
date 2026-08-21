import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared observer helper: flips `visible` once the node scrolls into view. */
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/**
 * Scroll-triggered rise + fade. Wrap any block; `delay` staggers siblings.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}) {
  const { ref, visible } = useInView<HTMLDivElement>(0.15);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-6 opacity-0 blur-[3px]",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/**
 * Word-by-word reveal for display headlines — each word lifts from below with a
 * small stagger, the way editorial scroll reveals read.
 */
export function WordReveal({
  text,
  className,
  wordClassName,
  stagger = 55,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  stagger?: number;
  delay?: number;
}) {
  const { ref, visible } = useInView<HTMLSpanElement>(0.25);
  const lines = text.split("\n");
  let index = -1;

  return (
    <span ref={ref} className={cn("block", className)}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.split(" ").map((word) => {
            index += 1;
            return (
              <span
                key={`${word}-${index}`}
                className="inline-block overflow-hidden align-bottom"
              >
                <span
                  className={cn(
                    "inline-block transition-[transform,opacity] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    visible ? "translate-y-0 opacity-100" : "translate-y-[105%] opacity-0",
                    wordClassName,
                  )}
                  style={{ transitionDelay: `${delay + index * stagger}ms` }}
                >
                  {word}
                </span>
                <span className="inline-block">&nbsp;</span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/**
 * Magnetic hover: the element leans toward the pointer and springs back on exit.
 * Used on pills, CTAs and tile affordances.
 */
export function Magnetic({
  children,
  className,
  strength = 14,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0, active: false });

  return (
    <span
      className={cn("inline-block will-change-transform", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength * 2;
        setOffset({ x, y, active: true });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0, active: false })}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${offset.active ? 1.03 : 1})`,
        transition: offset.active
          ? "transform 140ms cubic-bezier(0.22,1,0.36,1)"
          : "transform 620ms cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Stacked-card deck: cards sit behind one another with depth offsets and
 * cycle forward on an interval or on click.
 */
export function CardStack({
  items,
  className,
  interval = 4200,
}: {
  items: { id: string; node: ReactNode }[];
  className?: string;
  interval?: number;
}) {
  const [top, setTop] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = window.setInterval(() => setTop((value) => (value + 1) % items.length), interval);
    return () => window.clearInterval(id);
  }, [paused, items.length, interval]);

  return (
    <div
      className={cn("relative", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onClick={() => setTop((value) => (value + 1) % items.length)}
      role="presentation"
    >
      {items.map((item, itemIndex) => {
        const depth = (itemIndex - top + items.length) % items.length;
        return (
          <div
            key={item.id}
            className="absolute inset-0 transition-all duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: `translate3d(0, ${depth * -14}px, 0) scale(${1 - depth * 0.05})`,
              opacity: depth > 2 ? 0 : 1 - depth * 0.22,
              zIndex: items.length - depth,
              pointerEvents: depth === 0 ? "auto" : "none",
            }}
          >
            {item.node}
          </div>
        );
      })}
    </div>
  );
}
