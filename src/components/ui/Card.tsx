// ─── COMPOSANT CARD ───────────────────────────────────────────────────────────
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
  glowColor?: "green" | "red" | "blue" | "none";
}

const glowMap = {
  green: "shadow-neon-green border-neon-green border-opacity-40",
  red: "shadow-neon-red border-neon-red border-opacity-40",
  blue: "shadow-neon-blue border-border-glow border-opacity-40",
  none: "",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  headerRight,
  noPadding = false,
  glowColor = "none",
}) => {
  const glow = glowMap[glowColor];

  return (
    <div
      className={`
        bg-bg-card border border-border rounded-xl shadow-card
        transition-shadow duration-300
        ${glow}
        ${noPadding ? "" : "p-6"}
        ${className}
      `.trim()}
    >
      {(title || headerRight) && (
        <div
          className={`flex items-start justify-between gap-4 ${
            !noPadding ? "" : "p-6 pb-0"
          } ${children ? "mb-6" : ""}`.trim()}
        >
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
          {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
};