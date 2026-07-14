"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { formatRelative, priorityColor, getTheme } from "@aria/ui";
import { useTheme } from "@/lib/theme";
import type { Task } from "@aria/api-client";

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  urgent: "bg-danger",
  high: "bg-accent",
  normal: "bg-accent-cool",
  low: "bg-border",
};

const STATUS_TABS: Task["status"][] = ["open", "doing", "done"];

export default function TasksPage() {
  const { client } = useAuth();
  const { theme } = useTheme();
  const qc = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<Task["status"]>("open");
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", activeStatus],
    queryFn: () => client.tasks.list(activeStatus),
  });

  const createMut = useMutation({
    mutationFn: (title: string) => client.tasks.create({ title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setNewTitle("");
      setCreating(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task["status"] }) =>
      client.tasks.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Tasks</h1>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            {tasks.length} {activeStatus}
          </p>
        </div>
        <Button onClick={() => setCreating(true)} size="sm">
          + New task
        </Button>
      </header>

      {/* Status tabs */}
      <div className="flex gap-1 px-6 pt-4">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={[
              "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-fast",
              activeStatus === s
                ? "bg-surface-raised text-text-primary"
                : "text-text-muted hover:text-text-primary",
            ].join(" ")}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
        {creating && (
          <Card raised className="flex gap-2 items-center p-3">
            <Input
              autoFocus
              placeholder="Task title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createMut.mutate(newTitle);
                if (e.key === "Escape") setCreating(false);
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={() => createMut.mutate(newTitle)}
              loading={createMut.isPending}
            >
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </Card>
        )}

        {isLoading && (
          <p className="text-text-muted text-sm py-8 text-center">Loading…</p>
        )}

        {!isLoading && tasks.length === 0 && (
          <p className="text-text-muted text-sm py-12 text-center">
            No {activeStatus} tasks
          </p>
        )}

        {tasks.map((task) => (
          <Card
            key={task.id}
            as="li"
            className="flex items-start gap-3 p-3 list-none group hover:border-border hover:bg-surface-raised cursor-default"
          >
            {/* Priority bar */}
            <span
              className={`mt-1 w-1 h-4 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]}`}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm text-text-primary ${
                  task.status === "done" ? "line-through text-text-muted" : ""
                }`}
              >
                {task.title}
              </p>
              {task.due_at && (
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  due {formatRelative(task.due_at)}
                </p>
              )}
            </div>

            {/* Status toggle */}
            <button
              onClick={() =>
                updateMut.mutate({
                  id: task.id,
                  status: task.status === "done" ? "open" : "done",
                })
              }
              aria-label={task.status === "done" ? "Reopen task" : "Mark done"}
              className={[
                "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5",
                "transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                task.status === "done"
                  ? "bg-success border-success text-bg"
                  : "border-border hover:border-success",
              ].join(" ")}
            >
              {task.status === "done" && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              )}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
