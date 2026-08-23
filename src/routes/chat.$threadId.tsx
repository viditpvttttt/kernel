import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageAction,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { KernelMark } from "@/components/kernel-mark";
import { ModelPicker } from "@/components/model-picker";
import { ShaderClickField } from "@/components/shader-click-field";
import { VoiceChatOverlay, type VoiceStatus } from "@/components/voice-chat-overlay";
import { getThread, type StoredMessage } from "@/lib/chat.functions";
import { DEFAULT_MODEL_ID, resolveModel } from "@/lib/models";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat/$threadId")({
  component: ThreadPage,
});

function toUIMessages(rows: StoredMessage[]): UIMessage[] {
  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    parts: row.parts as unknown as UIMessage["parts"],
  }));
}

function textOf(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function ThreadPage() {
  const { threadId } = useParams({ from: "/chat/$threadId" });
  const fetchThread = useServerFn(getThread);
  const queryClient = useQueryClient();

  const thread = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => fetchThread({ data: { id: threadId } }),
  });

  if (thread.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Shimmer>Loading thread…</Shimmer>
      </div>
    );
  }

  if (!thread.data?.thread) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          This thread doesn't exist, or it isn't yours.
        </p>
      </div>
    );
  }

  return (
    <ThreadChat
      key={threadId}
      threadId={threadId}
      title={thread.data.thread.title}
      initialModel={thread.data.thread.model || DEFAULT_MODEL_ID}
      initialMessages={toUIMessages(thread.data.messages)}
      onTurnComplete={() => {
        void queryClient.invalidateQueries({ queryKey: ["threads"] });
      }}
    />
  );
}

function ThreadChat({
  threadId,
  title,
  initialModel,
  initialMessages,
  onTurnComplete,
}: {
  threadId: string;
  title: string;
  initialModel: string;
  initialMessages: UIMessage[];
  onTurnComplete: () => void;
}) {
  const [modelId, setModelId] = useState(initialModel);
  const [draft, setDraft] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const modelRef = useRef(modelId);
  modelRef.current = modelId;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        body: () => ({ threadId, model: modelRef.current }),
      }),
    [threadId],
  );

  const { messages, sendMessage, regenerate, status, error, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish: onTurnComplete,
    onError: (chatError) => toast.error(chatError.message || "Kernel could not answer"),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy, threadId]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setDraft("");
    await sendMessage({ text: trimmed });
  };

  const copyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1400);
    } catch {
      toast.error("Couldn't copy that");
    }
  };

  const activeModel = resolveModel(modelId);
  const lastMessage = messages.at(-1);
  const lastAssistantText =
    lastMessage?.role === "assistant" && status !== "streaming" ? textOf(lastMessage) : undefined;

  const voiceStatus: VoiceStatus =
    status === "submitted" ? "thinking" : status === "streaming" ? "speaking" : "listening";

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-foreground/[0.06] bg-background/50 px-5 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-medium">{title || "New thread"}</h1>
          <p className="text-xs text-muted-foreground">{activeModel.blurb}</p>
        </div>
        <ModelPicker value={modelId} onChange={setModelId} />
      </header>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-8">
          {messages.length === 0 && (
            <div className="flex animate-fade-in flex-col items-center py-20 text-center">
              <KernelMark className="h-12 w-12" />
              <h2 className="display-title mt-6 text-4xl italic">What are we thinking about?</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Ask anything, or tap the mic to talk. Switch models mid-thread — the context stays
                with you.
              </p>
            </div>
          )}

          {messages.map((message, index) => {
            const reasoning = message.parts
              .filter((part) => part.type === "reasoning")
              .map((part) => ("text" in part ? part.text : ""))
              .join("\n")
              .trim();
            const text = textOf(message);
            const isLastAssistant =
              message.role === "assistant" && index === messages.length - 1 && !busy;

            return (
              <Message from={message.role} key={message.id}>
                <MessageContent
                  className={
                    message.role === "user"
                      ? "rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground"
                      : "bg-transparent p-0"
                  }
                >
                  {message.role === "assistant" && reasoning && (
                    <details className="mb-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                      <summary className="cursor-pointer select-none">Thinking</summary>
                      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{reasoning}</p>
                    </details>
                  )}
                  {message.role === "assistant" ? (
                    <MessageResponse>{text}</MessageResponse>
                  ) : (
                    <span className="whitespace-pre-wrap">{text}</span>
                  )}
                </MessageContent>

                {text && (
                  <MessageActions
                    className={
                      message.role === "user"
                        ? "justify-end opacity-0 transition-opacity group-hover:opacity-100"
                        : "opacity-0 transition-opacity group-hover:opacity-100"
                    }
                  >
                    <MessageAction
                      tooltip="Copy"
                      onClick={() => void copyMessage(message.id, text)}
                    >
                      {copiedId === message.id ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </MessageAction>
                    {isLastAssistant && (
                      <MessageAction tooltip="Regenerate" onClick={() => void regenerate()}>
                        <RotateCcw className="size-3.5" />
                      </MessageAction>
                    )}
                  </MessageActions>
                )}
              </Message>
            );
          })}

          {status === "submitted" && (
            <div className="px-1 py-2">
              <Shimmer>Thinking…</Shimmer>
            </div>
          )}
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error.message}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/70 bg-background/40 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl">
          <ShaderClickField className="rounded-3xl">
            <div
              className="spectrum-ring rounded-3xl"
              data-active={inputFocused ? "true" : "false"}
            >
              <PromptInput onSubmit={(message) => void submit(message.text ?? draft)}>
                <PromptInputTextarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={`Message Kernel · ${activeModel.label}`}
                />
                <PromptInputFooter className="justify-between">
                  <PromptInputButton
                    tooltip="Voice chat"
                    onClick={() => setVoiceOpen(true)}
                    aria-label="Open voice chat"
                  >
                    <Mic className="size-4" />
                  </PromptInputButton>
                  <PromptInputSubmit
                    status={status}
                    disabled={!draft.trim() && !busy}
                    onClick={busy ? () => stop() : undefined}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </ShaderClickField>
          <p className="mt-2 text-center text-[0.68rem] text-muted-foreground">
            Kernel can be wrong. Check anything that matters.
          </p>
        </div>
      </div>

      <VoiceChatOverlay
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSubmit={(text) => void submit(text)}
        status={voiceStatus}
        lastAssistantText={lastAssistantText}
        modelLabel={activeModel.label}
      />
    </>
  );
}
