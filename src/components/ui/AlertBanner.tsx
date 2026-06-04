// ─── COMPOSANT ALERTBANNER ────────────────────────────────────────────────────
import React from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { TradeAlert } from "@/lib/types";

interface AlertBannerProps {
  alerts: TradeAlert[];
  onDismiss?: (index: number) => void;
}

// Typage strict de la map d'icônes
const iconMap: Record<string, React.ReactElement> = {
  warning: <AlertTriangle size={16} />,
  danger: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  onDismiss,
}) => {
  if (!alerts.length) return null;

  return (
    <div className="flex flex-col gap-2 animate-slide-in">
      {alerts.map((alert, i) => (
        <div
          // Clé optimisée pour éviter les bugs visuels au clic sur "Dismiss"
          key={`${alert.type}-${i}`}
          className={`
            flex items-start gap-3 p-4 rounded-lg border
            ${
              alert.severity === "danger"
                ? "bg-neon-red bg-opacity-10 border-neon-red border-opacity-40 text-neon-red"
                : "bg-neon-yellow bg-opacity-10 border-neon-yellow border-opacity-40 text-neon-yellow"
            }
            animate-slide-in
          `.trim()}
        >
          <span className="flex-shrink-0 mt-0.5">
            {iconMap[alert.severity]}
          </span>
          <p className="text-sm flex-1 font-medium">{alert.message}</p>
          {onDismiss && (
            <button
              onClick={() => onDismiss(i)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Fermer l'alerte"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};