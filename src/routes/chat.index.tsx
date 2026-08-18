import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { KernelMark } from "@/components/kernel-mark";
import { createThread, listThreads } from "@/lib/chat.functions";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

/** Lands the user on a real thread URL: newest existing thread, or a fresh one. */
function ChatIndex() {
  const navigate = useNavigate();
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);

  const threads = useQuery({ queryKey: ["threads"], queryFn: () => fetchThreads() });

  useEffect(() => {
    if (!threads.data) return;
    let cancelled = false;

    const go = async () => {
      const existing = threads.data[0];
      if (existing) {
        navigate({ to: "/chat/$threadId", params: { threadId: existing.id } });
        return;
      }
      const created = await newThread({ data: { model: null } });
      if (!cancelled) {
        navigate({ to: "/chat/$threadId", params: { threadId: created.id } });
      }
    };

    void go();
    return () => {
      cancelled = true;
    };
  }, [threads.data, navigate, newThread]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <KernelMark className="h-12 w-12 animate-pulse" />
        <p className="text-sm text-muted-foreground">Opening your workspace…</p>
      </div>
    </div>
  );
}
