// ─── COMPOSANT BUTTON ─────────────────────────────────────────────────────────
import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "neon-green";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Map variante → classes Tailwind
const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost:
    "inline-flex items-center justify-center gap-2 bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-40",
  "neon-green":
    "inline-flex items-center justify-center gap-2 bg-neon-green bg-opacity-10 border border-neon-green text-neon-green font-semibold rounded-lg px-6 py-3 hover:bg-opacity-20 active:scale-95 transition-all duration-200 shadow-neon-green disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-base px-8 py-4",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const base = variantClasses[variant];
  const sizeClass = variant !== "ghost" ? sizeClasses[size] : "";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${sizeClass} ${widthClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};