import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { KernelMark } from "@/components/kernel-mark";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createThread, listThreads } from "@/lib/chat.functions";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

/** Lands the user on a real thread URL: newest existing thread, or a fresh one. */
function ChatIndex() {
  const navigate = useNavigate();
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);

  const threads = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetchThreads(),
    retry: 1,
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!threads.data) return;
    let cancelled = false;

    const go = async () => {
      try {
        const existing = threads.data[0];
        if (existing) {
          navigate({ to: "/chat/$threadId", params: { threadId: existing.id } });
          return;
        }
        const created = await newThread({ data: { model: null } });
        if (!cancelled) {
          navigate({ to: "/chat/$threadId", params: { threadId: created.id } });
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    void go();
    return () => {
      cancelled = true;
    };
  }, [threads.data, navigate, newThread]);

  const broken = failed || threads.isError;

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <KernelMark className={broken ? "h-12 w-12" : "h-12 w-12 animate-pulse"} />
        {broken ? (
          <>
            <p className="max-w-xs text-sm text-muted-foreground">
              Kernel couldn't open your workspace. Your session may have expired.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFailed(false);
                  void threads.refetch();
                }}
              >
                Try again
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/auth", search: { redirect: "/chat" } });
                }}
              >
                Sign in again
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Opening your workspace…</p>
        )}
      </div>
    </div>
  );
}
