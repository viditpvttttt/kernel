import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Ambient aurora background: layered soft spectral blobs that drift slowly and
 * lean toward the pointer. Purely presentational, GPU-friendly (transform/opacity only).
 */
export function AuroraField({
  className,
  interactive = false,
  intensity = 1,
}: {
  className?: string;
  interactive?: boolean;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;
    const onMove = (event: PointerEvent) => {
      setPointer({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  const lean = (depth: number) => ({
    transform: `translate3d(${pointer.x * depth}px, ${pointer.y * depth}px, 0)`,
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("grain pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity: intensity }}
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="animate-aurora absolute -left-[20%] top-[-25%] h-[85vh] w-[75vw] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle at 40% 40%, var(--aurora-1), transparent 68%)",
          ...lean(38),
        }}
      />
      <div
        className="animate-drift absolute left-[8%] top-[10%] h-[80vh] w-[70vw] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--aurora-2), transparent 66%)",
          ...lean(-26),
        }}
      />
      <div
        className="animate-aurora absolute right-[-10%] top-[-10%] h-[90vh] w-[70vw] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle at 55% 45%, var(--aurora-3), transparent 66%)",
          animationDelay: "-8s",
          ...lean(30),
        }}
      />
      <div
        className="animate-drift absolute bottom-[-25%] right-[5%] h-[80vh] w-[65vw] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--aurora-4), transparent 68%)",
          animationDelay: "-6s",
          ...lean(-34),
        }}
      />
      <div
        className="animate-aurora absolute bottom-[-30%] left-[15%] h-[75vh] w-[60vw] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--aurora-5), transparent 68%)",
          animationDelay: "-14s",
          ...lean(22),
        }}
      />
      {/* paper fade at the edges keeps the field ambient rather than loud */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 30%, color-mix(in oklab, var(--background) 92%, transparent) 100%)",
        }}
      />
    </div>
  );
}
