// ─── COMPOSANT ALERTE BANNER ─────────────────────────────────────────────────
"use client";

import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { TradeAlert } from "@/lib/types";

interface AlertBannerProps {
  alerts: TradeAlert[];
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const isDanger = alert.severity === "danger";
        
        // 💡 CORRECTION TAILWIND V4 : On utilise bg-neon-red/10 au lieu de bg-opacity-10
        const bgClass = isDanger 
          ? "bg-neon-red/10 border-neon-red/30" 
          : "bg-neon-yellow/10 border-neon-yellow/30";
        
        const textClass = isDanger ? "text-neon-red" : "text-neon-yellow";
        const Icon = isDanger ? ShieldAlert : AlertTriangle;

        return (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-xl border ${bgClass} animate-fade-in`}
          >
            <Icon size={20} className={`${textClass} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${textClass}`}>
                {alert.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};