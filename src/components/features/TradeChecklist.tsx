// ─── COMPOSANT CHECKLIST AVANT-TRADE ─────────────────────────────────────────
"use client";

import React from "react";
import { CheckCircle2, Circle, Lock, Unlock } from "lucide-react";
import { ChecklistItem } from "@/lib/types";

interface TradeChecklistProps {
  items: ChecklistItem[];
  checkedIds: string[];
  onChange: (checkedIds: string[]) => void;
  disabled?: boolean;
}

export const TradeChecklist: React.FC<TradeChecklistProps> = ({
  items,
  checkedIds,
  onChange,
  disabled = false,
}) => {
  const requiredItems = items.filter((i) => i.isRequired);
  const optionalItems = items.filter((i) => !i.isRequired);
  const allRequiredChecked = requiredItems.every((i) => checkedIds.includes(i.id));
  const totalRequired = requiredItems.length;

  const toggleItem = (id: string) => {
    if (disabled) return;
    if (checkedIds.includes(id)) {
      onChange(checkedIds.filter((cid) => cid !== id));
    } else {
      onChange([...checkedIds, id]);
    }
  };

  const progressPercent =
    totalRequired > 0
      ? Math.round(
          (requiredItems.filter((i) => checkedIds.includes(i.id)).length / totalRequired) * 100
        )
      : 100;

  return (
    <div className="space-y-4">
      {/* ── En-tête avec progression ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {allRequiredChecked ? (
            <Unlock size={16} className="text-neon-green" />
          ) : (
            <Lock size={16} className="text-neon-red" />
          )}
          <span className="text-sm font-medium text-text-primary">
            Validation du setup
          </span>
        </div>
        <span className="mono text-xs text-text-secondary">
          {requiredItems.filter((i) => checkedIds.includes(i.id)).length}/{totalRequired} requis
        </span>
      </div>

      {/* ── Barre de progression ─────────────────────────────────────── */}
      <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progressPercent === 100 ? "bg-neon-green" : "bg-neon-blue"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── Items requis ─────────────────────────────────────────────── */}
      {requiredItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wider">
            Conditions obligatoires
          </p>
          {requiredItems.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                disabled={disabled}
                role="checkbox"
                aria-checked={isChecked}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg border
                  transition-all duration-200 text-left
                  ${
                    isChecked
                      ? "bg-neon-green/5 border-neon-green/30 text-neon-green" // Correction Tailwind v4
                      : "bg-bg-elevated border-border text-text-secondary hover:border-border-active hover:text-text-primary"
                  }
                  ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                `.trim()}
              >
                {isChecked ? (
                  <CheckCircle2 size={18} className="text-neon-green flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-text-muted flex-shrink-0" />
                )}
                <span className="text-sm flex-1">{item.label}</span>
                {isChecked && (
                  <span className="text-neon-green text-xs mono flex-shrink-0">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Items optionnels ─────────────────────────────────────────── */}
      {optionalItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wider">
            Conditions optionnelles
          </p>
          {optionalItems.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                disabled={disabled}
                role="checkbox"
                aria-checked={isChecked}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg border
                  transition-all duration-200 text-left opacity-80
                  ${
                    isChecked
                      ? "bg-border-glow/5 border-border-glow/20 text-border-glow" // Correction Tailwind v4
                      : "bg-bg-elevated border-border text-text-secondary hover:border-border-active hover:text-text-primary"
                  }
                  ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                `.trim()}
              >
                {isChecked ? (
                  <CheckCircle2 size={16} className="text-border-glow flex-shrink-0" />
                ) : (
                  <Circle size={16} className="text-text-muted flex-shrink-0" />
                )}
                <span className="text-sm flex-1">{item.label}</span>
                <span className="text-xs text-text-muted mono">opt.</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Message de validation ─────────────────────────────────────── */}
      {allRequiredChecked && (
        <div className="flex items-center gap-3 bg-neon-green/5 border border-neon-green/30 rounded-lg px-4 py-3 animate-slide-in">
          {/* Correction Tailwind v4 ci-dessus */}
          <CheckCircle2 size={18} className="text-neon-green flex-shrink-0" />
          <p className="text-sm text-neon-green font-medium">
            Setup validé — Le trade peut être exécuté
          </p>
        </div>
      )}
    </div>
  );
};