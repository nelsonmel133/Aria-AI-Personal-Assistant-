"use client";

const BAR_COUNT = 24;

export function PresenceThread({ active = false }: { active?: boolean }) {
  return (
    <div
      className="flex items-center gap-[2px] h-5"
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          className={`thread-bar inline-block w-[2px] rounded-full bg-accent origin-bottom ${
            active ? "active" : ""
          }`}
          style={{
            height: "8px",
            animationDelay: `${(i / BAR_COUNT) * 4}s`,
          }}
        />
      ))}
    </div>
  );
}
