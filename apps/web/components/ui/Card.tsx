import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
  as?: "div" | "article" | "section" | "li";
}

export function Card({ raised = false, as: Tag = "div", className = "", ...props }: CardProps) {
  return (
    <Tag
      className={[
        "rounded-xl border border-border transition-all duration-default",
        raised ? "bg-surface-raised" : "bg-surface",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
