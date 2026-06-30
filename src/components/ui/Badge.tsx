// ─── COMPOSANT BADGE ──────────────────────────────────────────────────────────
import React from "react";

type BadgeVariant = "green" | "red" | "blue" | "yellow" | "gray" | "ghost";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

// 💡 CORRECTION : Utilisation de la nouvelle syntaxe Tailwind (/10 et /30)
const variantStyles: Record<BadgeVariant, string> = {
  green: "bg-neon-green/10 text-neon-green border border-neon-green/30",
  red: "bg-neon-red/10 text-neon-red border border-neon-red/30",
  blue: "bg-border-glow/10 text-border-glow border border-border-glow/30",
  yellow: "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30",
  gray: "bg-bg-elevated text-text-secondary border border-border",
  ghost: "text-text-muted",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gray",
  size = "sm",
  dot = false,
  className = "",
}) => {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium mono
        ${sizeClass}
        ${variantStyles[variant]}
        ${className}
      `.trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            variant === "green"
              ? "bg-neon-green"
              : variant === "red"
              ? "bg-neon-red"
              : "bg-text-secondary"
          }`}
        />
      )}
      {children}
    </span>
  );
};