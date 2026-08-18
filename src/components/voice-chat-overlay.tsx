import { Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Minimal ambient typing for the Web Speech API — not in every lib.dom target.
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type VoiceStatus = "listening" | "thinking" | "speaking";

export function VoiceChatOverlay({
  open,
  onClose,
  onSubmit,
  status,
  lastAssistantText,
  modelLabel,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  /** Derived from the chat's own status so the orb reacts to what Kernel is doing. */
  status: VoiceStatus;
  lastAssistantText?: string | undefined;
  modelLabel: string;
}) {
  const [micOn, setMicOn] = useState(true);
  const [speakOn, setSpeakOn] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenRef = useRef<string | undefined>(undefined);

  // Speech recognition lifecycle — only runs while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i]?.[0]?.transcript ?? "";
      }
      setTranscript(text);
    };
    recognition.onend = () => {
      // Auto-restart while the overlay is open and mic is enabled (continuous listening).
      if (micRef.current && openRef.current) {
        try {
          recognition.start();
        } catch {
          // already started; ignore
        }
      }
    };
    recognition.onerror = () => {
      /* swallow — mic permission or transient network errors */
    };

    recognitionRef.current = recognition;
    if (micOn) {
      try {
        recognition.start();
      } catch {
        // ignore double-start
      }
    }

    return () => {
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Refs so the recognition's onend callback always sees fresh values.
  const micRef = useRef(micOn);
  micRef.current = micOn;
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (micOn) {
      try {
        recognition.start();
      } catch {
        // ignore
      }
    } else {
      recognition.stop();
    }
  }, [micOn]);

  // Speak the assistant's latest reply aloud when it changes, if enabled.
  useEffect(() => {
    if (!open || !speakOn) return;
    if (!lastAssistantText || lastAssistantText === spokenRef.current) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    spokenRef.current = lastAssistantText;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastAssistantText);
    utterance.rate = 1.02;
    window.speechSynthesis.speak(utterance);
  }, [lastAssistantText, open, speakOn]);

  useEffect(() => {
    if (!open) {
      window.speechSynthesis?.cancel();
      setTranscript("");
      spokenRef.current = undefined;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const send = () => {
    const trimmed = transcript.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setTranscript("");
  };

  const animating = status === "listening" || status === "speaking";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Voice chat"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-5 top-5 rounded-full"
        onClick={onClose}
        aria-label="Close voice chat"
      >
        <X />
      </Button>

      <p className="mb-10 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Kernel voice · {modelLabel}
      </p>

      {/* The "Dia" unfurl-and-breathe orb */}
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, var(--spectrum-1), var(--spectrum-2), var(--spectrum-3), var(--spectrum-4), var(--spectrum-5), var(--spectrum-1))",
            animation: "spectrum-spin 6s linear infinite",
          }}
        />
        <div
          key={String(open)}
          className="absolute inset-6 shadow-2xl"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, var(--spectrum-1), var(--spectrum-2) 40%, var(--spectrum-5) 78%, var(--spectrum-4) 100%)",
            animation: `dia-unfurl 0.7s cubic-bezier(0.22, 1, 0.36, 1) both, ${
              status === "thinking"
                ? "dia-breathe-fast 1.4s ease-in-out infinite 0.7s"
                : "dia-breathe 4.5s ease-in-out infinite 0.7s"
            }`,
          }}
        />
        {/* Waveform bars, layered on top while listening / speaking */}
        {animating && (
          <div className="relative z-10 flex items-end gap-1.5">
            {[0, 1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className="w-1.5 rounded-full bg-white/85"
                style={{
                  height: 34,
                  animation: `waveform-bar ${0.6 + bar * 0.08}s ease-in-out infinite`,
                  animationDelay: `${bar * 90}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-10 min-h-6 max-w-md px-6 text-center text-sm text-muted-foreground">
        {status === "thinking"
          ? "Thinking…"
          : !supported
            ? "Voice input isn't supported in this browser — try Chrome, or type below."
            : transcript || (micOn ? "Listening…" : "Mic paused")}
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Button
          type="button"
          variant={micOn ? "secondary" : "outline"}
          size="icon"
          className="size-12 rounded-full"
          onClick={() => setMicOn((prev) => !prev)}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          {micOn ? <Mic /> : <MicOff />}
        </Button>
        <Button
          type="button"
          onClick={send}
          disabled={!transcript.trim()}
          className="h-12 rounded-full px-6"
        >
          Send
        </Button>
        <Button
          type="button"
          variant={speakOn ? "secondary" : "outline"}
          size="icon"
          className="size-12 rounded-full"
          onClick={() => setSpeakOn((prev) => !prev)}
          aria-label={speakOn ? "Mute Kernel's voice" : "Unmute Kernel's voice"}
        >
          {speakOn ? <Volume2 /> : <VolumeX />}
        </Button>
      </div>

      {!supported && (
        <TypeFallback
          className="mt-6"
          onSubmit={(text) => {
            onSubmit(text);
          }}
        />
      )}
    </div>
  );
}

function TypeFallback({
  className,
  onSubmit,
}: {
  className?: string;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className={cn("flex w-full max-w-sm items-center gap-2 px-6", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setValue("");
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type instead…"
        className="h-10 flex-1 rounded-full border border-border/70 bg-background/60 px-4 text-sm outline-none"
      />
      <Button type="submit" size="sm" className="rounded-full">
        Send
      </Button>
    </form>
  );
}
