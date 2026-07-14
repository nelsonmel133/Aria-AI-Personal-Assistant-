"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import tokens from "@aria/tokens";

type ThemeName = keyof typeof tokens.themes;
const THEMES: { id: ThemeName; label: string; desc: string }[] = [
  { id: "dusk", label: "Dusk", desc: "Dark amber — the default" },
  { id: "dawn", label: "Dawn", desc: "Warm light mode" },
  { id: "mono", label: "Mono", desc: "High contrast black & white" },
  { id: "reef", label: "Reef", desc: "Teal and coral" },
];

export default function SettingsPage() {
  const { client, user } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const [assistantName, setAssistantName] = useState("Aria");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const { data: prefs } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => client.preferences.get(),
  });

  useEffect(() => {
    if (prefs) {
      setAssistantName(prefs.assistant_name ?? "Aria");
      setVoiceEnabled(prefs.voice_enabled ?? true);
    }
  }, [prefs]);

  const saveMut = useMutation({
    mutationFn: () =>
      client.preferences.update({
        theme: currentTheme as any,
        assistant_name: assistantName,
        voice_enabled: voiceEnabled,
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="px-6 py-5 border-b border-border">
        <h1 className="font-display text-2xl text-text-primary">Settings</h1>
        <p className="text-xs text-text-muted font-mono mt-0.5">{user?.email}</p>
      </header>

      <div className="flex flex-col gap-6 p-6 max-w-2xl">
        {/* Appearance */}
        <section>
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
            Appearance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEMES.map((t) => {
              const colors = tokens.themes[t.id];
              const active = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={[
                    "rounded-xl p-3 border-2 transition-all duration-fast text-left",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active ? "border-accent" : "border-border hover:border-text-muted",
                  ].join(" ")}
                  style={{ background: colors.bg }}
                >
                  {/* Mini preview */}
                  <div className="flex flex-col gap-1 mb-2">
                    <div
                      className="h-1.5 rounded-full w-full"
                      style={{ background: colors.surface }}
                    />
                    <div
                      className="h-1.5 rounded-full w-3/4"
                      style={{ background: colors.accent }}
                    />
                    <div
                      className="h-1.5 rounded-full w-1/2"
                      style={{ background: colors.surface }}
                    />
                  </div>
                  <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                    {t.label}
                  </p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    {t.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Assistant */}
        <section>
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
            Assistant
          </h2>
          <Card className="p-4 flex flex-col gap-4">
            <Input
              label="Assistant name"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
            />
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm text-text-primary">Voice input & output</p>
                <p className="text-xs text-text-muted">Microphone and speech synthesis</p>
              </div>
              <button
                role="switch"
                aria-checked={voiceEnabled}
                onClick={() => setVoiceEnabled((v) => !v)}
                className={[
                  "w-10 h-6 rounded-full relative transition-all duration-fast",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  voiceEnabled ? "bg-accent" : "bg-border",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 w-4 h-4 rounded-full bg-bg transition-all duration-fast",
                    voiceEnabled ? "left-5" : "left-1",
                  ].join(" ")}
                />
              </button>
            </label>
          </Card>
        </section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => saveMut.mutate()}
            loading={saveMut.isPending}
            size="md"
          >
            Save changes
          </Button>
          {saved && (
            <p className="text-sm text-success font-mono">Saved.</p>
          )}
        </div>
      </div>
    </div>
  );
}
