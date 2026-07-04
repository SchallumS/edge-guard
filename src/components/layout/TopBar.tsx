// ─── BARRE DU HAUT ────────────────────────────────────────────────────────────
"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import api from "@/lib/api"; 
import { formatCurrency } from "@/lib/utils";

interface TopBarProps {
  onMenuToggle: () => void;
}

// Titres des pages
const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Configuration & Vue d'ensemble" },
  "/avant-trade": { title: "Avant-Trade", subtitle: "Garde-fou — Validation de setup" },
  "/calendar": { title: "Calendrier", subtitle: "Historique de performance" },
  "/analytics": { title: "Analyses", subtitle: "Statistiques & Graphiques" },
  "/abonnement": { title: "Abonnement", subtitle: "Gestion de votre forfait" }, // 💡 Petit oubli ajouté !
};

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();
  const [totalPnl, setTotalPnl] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  const pageInfo = PAGE_TITLES[pathname] || { title: "EdgeGuard", subtitle: "Discipline Engine" };

  useEffect(() => {
    const fetchTopBarStats = async () => {
      try {
        // 💡 AJOUT : ?limit=5000 pour être certain de récupérer tout l'historique
        // et avoir un VRAI P&L Global, même après des mois de trading.
        const res = await api.get("/trades?limit=5000");
        const allTrades = res.data.data;

        // 1. Calcul du P&L GLOBAL
        const pnlGlobal = allTrades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0);
        setTotalPnl(pnlGlobal);

        // 2. Compteur de trades de la journée (Vérification robuste)
        const todayStr = new Date().toDateString();
        const count = allTrades.filter((t: any) => new Date(t.date).toDateString() === todayStr).length;
        setTodayCount(count);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la TopBar :", error);
      }
    };

    fetchTopBarStats();
  }, [pathname]); 

  return (
    <header className="sticky top-0 z-10 bg-bg-card border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      {/* ── Menu hamburger (mobile) + Titre ─────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-elevated transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-text-primary font-semibold text-sm sm:text-base truncate">
            {pageInfo.title}
          </h1>
          <p className="text-text-muted text-xs mono hidden sm:block truncate">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* ── Infos rapides ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-shrink-0">
        
        {/* Compteur de trades du jour */}
        <div className="hidden sm:flex items-center gap-1.5 bg-bg-elevated border border-border rounded-lg px-3 py-1.5">
          <div className={todayCount > 0 ? "live-dot" : "w-2 h-2 rounded-full bg-text-muted"} />
          <span className="text-xs mono text-text-secondary">
            {todayCount} trade{todayCount > 1 ? "s" : ""}
          </span>
        </div>

        {/* P&L GLOBAL */}
        <div className="flex flex-col items-end pl-2 sm:pl-4 sm:border-l border-border">
          <span className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider">P&L Global</span>
          <span
            className={`text-sm sm:text-base font-bold mono ${totalPnl >= 0 ? "text-neon-green" : "text-neon-red"}`}
          >
            {totalPnl > 0 ? "+" : ""}
            {formatCurrency(totalPnl)}
          </span>
        </div>
        
      </div>
    </header>
  );
};