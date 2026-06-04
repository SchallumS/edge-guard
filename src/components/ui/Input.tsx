// ─── COMPOSANT INPUT ──────────────────────────────────────────────────────────
import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  className = "",
  id,
  ...props
}) => {
  // Remplacement de Math.random() par useId() pour éviter les erreurs d'hydratation Next.js
  const reactId = useId();
  const inputId = id || reactId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 flex items-center text-text-muted pointer-events-none">
            {leftAddon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            cyber-input
            ${leftAddon ? "pl-10" : ""}
            ${rightAddon ? "pr-10" : ""}
            ${error ? "border-neon-red focus:border-neon-red focus:shadow-neon-red" : ""}
            ${className}
          `.trim()}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3 flex items-center text-text-muted">
            {rightAddon}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-neon-red flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
};