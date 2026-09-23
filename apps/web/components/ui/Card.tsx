import { type ComponentPropsWithoutRef, type ElementType } from "react";

interface CardOwnProps {
  raised?: boolean;
  as?: "div" | "article" | "section" | "li" | "button";
}

type CardProps = CardOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof CardOwnProps>;

export function Card({ raised = false, as: Tag = "div", className = "", ...props }: CardProps) {
  const Component = Tag as ElementType;
  return (
    <Component
      className={[
        "rounded-xl border border-border transition-all duration-default",
        raised ? "bg-surface-raised" : "bg-surface",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
