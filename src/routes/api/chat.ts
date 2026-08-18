import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  createLovableAiGatewayProvider,
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { resolveModel } from "@/lib/models";

type ChatRequestBody = {
  messages?: unknown;
  threadId?: unknown;
  model?: unknown;
};

const SYSTEM_PROMPT = [
  "You are Kernel, a calm and precise multi-model assistant.",
  "Answer directly and concisely; use markdown structure only when it aids clarity.",
  "Prefer concrete, verifiable detail over filler. Say when you are unsure.",
].join(" ");

function textFromParts(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        const threadId = typeof body.threadId === "string" ? body.threadId : null;

        if (!Array.isArray(messages) || !threadId) {
          return new Response("messages and threadId are required", { status: 400 });
        }

        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const supabaseUrl = process.env["SUPABASE_URL"];
        const supabaseKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!token || !supabaseUrl || !supabaseKey) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey } },
        });

        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        const userId = userData?.user?.id;
        if (userError || !userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { data: thread } = await supabase
          .from("threads")
          .select("id, user_id, title")
          .eq("id", threadId)
          .maybeSingle();

        if (!thread || thread.user_id !== userId) {
          return new Response("Thread not found", { status: 404 });
        }

        const lovableApiKey = process.env["LOVABLE_API_KEY"];
        if (!lovableApiKey) {
          return new Response("AI is not configured", { status: 500 });
        }

        const uiMessages = messages as UIMessage[];
        const model = resolveModel(typeof body.model === "string" ? body.model : null);
        const initialRunId = getLovableAiGatewayRunId(request);

        // Persist the incoming user turn before generating.
        const lastMessage = uiMessages[uiMessages.length - 1];
        if (lastMessage?.role === "user") {
          const { error: insertError } = await supabase.from("messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            parts: lastMessage.parts as never,
            client_message_id: lastMessage.id,
          });
          if (insertError) console.error("failed to save user message", insertError);

          const isFirstTurn = uiMessages.filter((message) => message.role === "user").length === 1;
          const title = textFromParts(lastMessage).slice(0, 70);
          await supabase
            .from("threads")
            .update({
              model: model.id,
              ...(isFirstTurn && title ? { title } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("id", threadId);
        }

        const saveAssistant = async (message: UIMessage) => {
          const { error } = await supabase.from("messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "assistant",
            parts: message.parts as never,
            model: model.id,
            client_message_id: message.id,
          });
          if (error) console.error("failed to save assistant message", error);
          await supabase
            .from("threads")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", threadId);
        };

        const modelMessages = await convertToModelMessages(uiMessages);

        try {
          if (model.family === "openai") {
            const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
            const lovable = createOpenAI({
              baseURL: "https://ai.gateway.lovable.dev/v1",
              apiKey: lovableApiKey,
              headers: {
                "Lovable-API-Key": lovableApiKey,
                "X-Lovable-AIG-SDK": "vercel-ai-sdk",
              },
              fetch: runIdFetch.fetch as typeof fetch,
            });

            const result = streamText({
              model: lovable.responses(model.id),
              system: SYSTEM_PROMPT,
              messages: modelMessages,
              abortSignal: request.signal,
              providerOptions: {
                openai: {
                  forceReasoning: true,
                  reasoningEffort: "medium",
                  reasoningSummary: "auto",
                  store: false,
                  include: ["reasoning.encrypted_content"],
                },
              },
            });

            const response = result.toUIMessageStreamResponse({
              originalMessages: uiMessages,
              sendReasoning: true,
              onFinish: ({ responseMessage }) => saveAssistant(responseMessage),
              headers: getLovableAiGatewayResponseHeaders(undefined, {
                ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
              }),
            });

            return withLovableAiGatewayRunIdHeader(response, runIdFetch);
          }

          const gateway = createLovableAiGatewayProvider(lovableApiKey, initialRunId);
          const result = streamText({
            model: gateway(model.id),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            abortSignal: request.signal,
            providerOptions: { lovable: { reasoning: { effort: "medium" } } },
          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: uiMessages,
            sendReasoning: true,
            onFinish: ({ responseMessage }) => saveAssistant(responseMessage),
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
          });

          return withLovableAiGatewayRunIdHeader(response, gateway);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          console.error("chat route failed", error);
          const message = error instanceof Error ? error.message : "Generation failed";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
