import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
  as?: "div" | "article" | "section" | "li";
}

export function Card({ raised = false, as: asTag = "div", className = "", ...props }: CardProps) {
  const Tag = asTag as any;
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
