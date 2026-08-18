import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AuroraField } from "@/components/aurora-field";
import { KernelWordmark } from "@/components/kernel-mark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createThread, deleteThread, listThreads, renameThread } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Kernel workspace — chat across every model" },
      {
        name: "description",
        content:
          "Your Kernel threads: switch between open-weight and frontier models without losing context.",
      },
      { property: "og:title", content: "Kernel workspace" },
      {
        property: "og:description",
        content: "Chat across open and frontier models in one calm workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { redirect: "/chat" } });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AuroraField />
        <p className="relative text-sm text-muted-foreground">Waking Kernel…</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      <AuroraField intensity={0.7} />
      <ThreadRail />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}

function ThreadRail() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);
  const removeThread = useServerFn(deleteThread);
  const renameThreadFn = useServerFn(renameThread);

  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const threads = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetchThreads(),
  });

  const create = useMutation({
    mutationFn: () => newThread({ data: { model: null } }),
    onSuccess: async (thread) => {
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
    },
    onError: () => toast.error("Could not start a new thread"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeThread({ data: { id } }),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
      if (params.threadId === id) navigate({ to: "/chat" });
    },
    onError: () => toast.error("Could not delete that thread"),
  });

  const rename = useMutation({
    mutationFn: (vars: { id: string; title: string }) => renameThreadFn({ data: vars }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: () => toast.error("Could not rename that thread"),
  });

  const filtered = useMemo(() => {
    const list = threads.data ?? [];
    if (!query.trim()) return list;
    const needle = query.trim().toLowerCase();
    return list.filter((thread) => (thread.title || "untitled").toLowerCase().includes(needle));
  }, [threads.data, query]);

  const commitRename = (id: string) => {
    const title = editingTitle.trim();
    setEditingId(null);
    if (!title) return;
    rename.mutate({ id, title });
  };

  return (
    <aside className="relative hidden w-64 shrink-0 flex-col border-r border-border/70 bg-background/45 backdrop-blur-xl md:flex">
      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/">
          <KernelWordmark className="text-base [&_span]:text-[1.15rem]" />
        </Link>
      </div>

      <div className="space-y-2 px-3">
        <Button
          className="w-full justify-start rounded-xl"
          variant="secondary"
          onClick={() => create.mutate()}
          disabled={create.isPending}
        >
          <Plus />
          New thread
        </Button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search threads…"
            className="h-8 w-full rounded-lg border border-transparent bg-accent/50 pl-8 pr-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-border/70 focus:bg-background/70"
          />
        </div>
      </div>

      <nav className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {threads.data?.length === 0 && (
          <p className="px-2 py-6 text-xs text-muted-foreground">
            No threads yet. Start one above.
          </p>
        )}
        {threads.data && threads.data.length > 0 && filtered.length === 0 && (
          <p className="px-2 py-6 text-xs text-muted-foreground">No threads match “{query}”.</p>
        )}
        {filtered.map((thread) => {
          const active = params.threadId === thread.id;
          const editing = editingId === thread.id;
          return (
            <div
              key={thread.id}
              className={`group flex items-center gap-1 rounded-xl px-1 transition-colors ${
                active ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              {editing ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  onBlur={() => commitRename(thread.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitRename(thread.id);
                    if (event.key === "Escape") setEditingId(null);
                  }}
                  className="min-w-0 flex-1 rounded-md bg-background/80 px-2 py-1.5 text-sm outline-none ring-1 ring-ring"
                />
              ) : (
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: thread.id }}
                  className="min-w-0 flex-1 truncate px-2 py-2 text-sm"
                  title={thread.title}
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    setEditingId(thread.id);
                    setEditingTitle(thread.title || "");
                  }}
                >
                  {thread.title || "Untitled"}
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete thread"
                className="opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => remove.mutate(thread.id)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border/70 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
