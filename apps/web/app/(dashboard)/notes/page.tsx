"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatRelative } from "@aria/ui";

export default function NotesPage() {
  const { client } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [search, setSearch] = useState("");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => client.notes.list(),
  });

  const createMut = useMutation({
    mutationFn: () => client.notes.create({ title: draft.title, body: draft.body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setDraft({ title: "", body: "" });
      setCreating(false);
    },
  });

  const filtered = notes.filter(
    (n) =>
      n.body.toLowerCase().includes(search.toLowerCase()) ||
      (n.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-text-primary shrink-0">Notes</h1>
        <Input
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" onClick={() => setCreating(true)}>
          + New note
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* New note form */}
        {creating && (
          <Card raised className="p-4 mb-4 flex flex-col gap-3">
            <Input
              placeholder="Title (optional)"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
            <textarea
              autoFocus
              placeholder="Start writing…"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={5}
              className="w-full resize-none rounded-lg px-3 py-2 text-sm bg-surface-raised border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => createMut.mutate()}
                loading={createMut.isPending}
                disabled={!draft.body.trim()}
              >
                Save note
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
                Discard
              </Button>
            </div>
          </Card>
        )}

        {/* Notes grid */}
        {isLoading && (
          <p className="text-text-muted text-sm text-center py-12">Loading…</p>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-text-muted text-sm text-center py-12">
            {search ? "No notes match that search" : "No notes yet"}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((note) => (
            <Card
              key={note.id}
              as="article"
              className="p-4 flex flex-col gap-2 hover:border-border hover:bg-surface-raised cursor-pointer"
            >
              {note.title && (
                <h3 className="text-sm font-medium text-text-primary">{note.title}</h3>
              )}
              <p className="text-sm text-text-muted line-clamp-4">{note.body}</p>
              <p className="text-xs font-mono text-text-muted mt-auto">
                {formatRelative(note.updated_at)}
              </p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 rounded bg-surface-raised text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
