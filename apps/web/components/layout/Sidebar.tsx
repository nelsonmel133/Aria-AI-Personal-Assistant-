"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PresenceThread } from "@/components/ui/PresenceThread";
import { initials } from "@aria/ui";

const NAV = [
  { href: "/chat", label: "Chat", icon: ChatIcon },
  { href: "/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/notes", label: "Notes", icon: NotesIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col w-16 md:w-56 h-screen border-r border-border bg-surface shrink-0">
      {/* Logo / brand */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <span className="text-bg text-xs font-bold font-display">A</span>
        </div>
        <span className="hidden md:block text-text-primary font-display font-semibold text-lg tracking-tight">
          Aria
        </span>
      </div>

      {/* Presence thread */}
      <div className="px-4 mb-4 hidden md:block">
        <PresenceThread />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-fast",
                active
                  ? "bg-surface-raised text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised",
              ].join(" ")}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${active ? "text-accent" : ""}`}
              />
              <span className="hidden md:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User avatar */}
      <div className="p-3 border-t border-border flex items-center gap-3">
        <button
          onClick={logout}
          title="Sign out"
          className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-xs font-semibold text-accent shrink-0 hover:ring-2 hover:ring-accent transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {user ? initials(user.display_name) : "?"}
        </button>
        <div className="hidden md:flex flex-col min-w-0">
          <span className="text-sm text-text-primary font-medium truncate">
            {user?.display_name}
          </span>
          <span className="text-xs text-text-muted truncate">{user?.email}</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Inline icon components (hairline style) ──────────────── */

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h12v9H9l-3 3v-3H2z" />
    </svg>
  );
}

function TasksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M5 8l2 2 4-4" />
    </svg>
  );
}

function NotesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h8a1 1 0 011 1v10l-3-2H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path d="M5 6h6M5 9h4" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  );
}
