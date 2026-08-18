import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_MODEL_ID } from "@/lib/models";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Json[];
};

export type ThreadRow = {
  id: string;
  title: string;
  model: string;
  updated_at: string;
};

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ThreadRow[]> => {
    const { data, error } = await context.supabase
      .from("threads")
      .select("id, title, model, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ model: z.string().nullable().default(null) }).parse(input ?? { model: null }),
  )
  .handler(async ({ context, data }): Promise<ThreadRow> => {
    const { data: row, error } = await context.supabase
      .from("threads")
      .insert({
        user_id: context.userId,
        title: "New chat",
        model: data.model ?? DEFAULT_MODEL_ID,
      })
      .select("id, title, model, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("threads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(
    async ({ context, data }): Promise<{ thread: ThreadRow | null; messages: StoredMessage[] }> => {
      const { data: thread } = await context.supabase
        .from("threads")
        .select("id, title, model, updated_at")
        .eq("id", data.id)
        .maybeSingle();

      if (!thread) return { thread: null, messages: [] };

      const { data: rows, error } = await context.supabase
        .from("messages")
        .select("id, role, parts, created_at")
        .eq("thread_id", data.id)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);

      const messages: StoredMessage[] = (rows ?? []).map((row) => ({
        id: row.id,
        role: row.role === "user" ? "user" : ("assistant" as const),
        parts: (Array.isArray(row.parts) ? row.parts : []) as Json[],
      }));

      return { thread, messages };
    },
  );

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ id: z.string(), title: z.string().max(120) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("threads")
      .update({ title: data.title })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
