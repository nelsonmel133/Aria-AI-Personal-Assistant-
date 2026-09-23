"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const rec: SpeechRecognition = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setValue(transcript);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-border bg-surface">
      {/* Voice button */}
      <button
        onClick={toggleVoice}
        title={listening ? "Stop listening" : "Voice input"}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        className={[
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          listening
            ? "bg-accent text-bg"
            : "bg-surface-raised text-text-muted hover:text-text-primary",
        ].join(" ")}
      >
        <MicIcon className="w-4 h-4" />
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ask Aria anything…"
        disabled={disabled}
        rows={1}
        className={[
          "flex-1 resize-none rounded-xl px-3 py-2 text-sm",
          "bg-surface-raised border border-border",
          "text-text-primary placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
          "transition-all duration-fast disabled:opacity-50",
          "scrollbar-thin",
        ].join(" ")}
      />

      {/* Send button */}
      <button
        onClick={submit}
        disabled={!value.trim() || disabled}
        aria-label="Send message"
        className={[
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          "bg-accent text-bg transition-all duration-fast",
          "hover:opacity-90 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        <SendIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="1" width="6" height="9" rx="3" />
      <path d="M2 8a6 6 0 0012 0M8 14v2M5 16h6" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L2 7l5 2 2 5z" />
    </svg>
  );
}
