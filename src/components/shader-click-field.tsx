import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Burst = { id: number; x: number; y: number; size: number };

/**
 * Wraps a container and spawns a small animated mesh-gradient burst wherever
 * the user clicks inside it — the "shader gradient" moment for the chatbox.
 * Purely decorative and pointer-events-none, so it never intercepts clicks.
 */
export function ShaderClickField({
  children,
  className,
  size = 140,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const spawn = useCallback(
    (x: number, y: number) => {
      const id = Date.now() + Math.random();
      setBursts((prev) => [...prev.slice(-4), { id, x, y, size }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((burst) => burst.id !== id));
      }, 900);
    },
    [size],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      spawn(event.clientX - rect.left, event.clientY - rect.top);
    },
    [spawn],
  );

  return (
    <div ref={ref} className={cn("relative", className)} onPointerDownCapture={onPointerDown}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="absolute rounded-full"
            style={{
              left: burst.x,
              top: burst.y,
              width: burst.size,
              height: burst.size,
              marginLeft: -burst.size / 2,
              marginTop: -burst.size / 2,
              background:
                "conic-gradient(from 0deg, var(--spectrum-1), var(--spectrum-2), var(--spectrum-3), var(--spectrum-4), var(--spectrum-5), var(--spectrum-1))",
              filter: "blur(20px)",
              animation: "shader-burst 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
