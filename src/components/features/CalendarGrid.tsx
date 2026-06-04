// ─── GRILLE DE CALENDRIER DE PERFORMANCE ─────────────────────────────────────
"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, CheckCheck } from "lucide-react";
import { TradeSession } from "@/lib/types";
import { getDaysInMonth, groupTradesByDate, formatCurrency } from "@/lib/utils";

interface CalendarGridProps {
  trades: TradeSession[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick?: (date: string, trades: TradeSession[]) => void;
}

const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// Helper pour formater une date locale en YYYY-MM-DD
const toLocalIsoDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  trades,
  currentDate,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Calcul des jours du mois ───────────────────────────────────────
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Lundi = 0

  // ── Grouper les trades par date (Ouverture) ────────────────────────
  const tradesByDate = useMemo(() => groupTradesByDate(trades), [trades]);

  // ── Stats du mois ──────────────────────────────────────────────────
  const monthStats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthTrades = trades.filter(
      (t) =>
        t.date.startsWith(monthPrefix) &&
        (t.status === "win" || t.status === "loss" || t.status === "breakeven")
    );
    const monthPnl = monthTrades.reduce((s, t) => s + (t.pnl || 0), 0);
    const wins = monthTrades.filter((t) => t.status === "win").length;
    const losses = monthTrades.filter((t) => t.status === "loss").length;
    const winRate = monthTrades.length > 0 ? Math.round((wins / monthTrades.length) * 100) : 0;
    return { total: monthTrades.length, wins, losses, winRate, pnl: monthPnl };
  }, [trades, year, month]);

  // ── Helper : Un trade "en cours" chevauche-t-il cette date ? ───────
  const isDateInActiveTrade = (dateStr: string) => {
    const targetDate = new Date(dateStr).getTime();
    return trades.some((t) => {
      // Si le trade est fermé, on ne colore que le jour de fermeture (déjà géré)
      if (t.status !== "open" && t.status !== "pending") return false;
      
      const openDate = new Date(t.date.split("T")[0]).getTime();
      const today = new Date(toLocalIsoDate(new Date())).getTime();
      
      // Si le trade a été ouvert AVANT ce jour, et n'est pas encore fermé
      return openDate <= targetDate && targetDate <= today;
    });
  };

  // ── Rendu d'un jour ────────────────────────────────────────────────
  const renderDay = (date: Date) => {
    const dateStr = toLocalIsoDate(date);
    const dayTrades = tradesByDate[dateStr] || [];
    
    // On regarde les trades clôturés CE jour-là
    const closedTrades = dayTrades.filter(
      (t) => t.status === "win" || t.status === "loss" || t.status === "breakeven"
    );
    
    const dailyPnl = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);
    const isToday = dateStr === toLocalIsoDate(new Date());
    const hasClosedTrades = closedTrades.length > 0;
    
    const isGreen = hasClosedTrades && dailyPnl > 0;
    const isRed = hasClosedTrades && dailyPnl < 0;
    const isBreakeven = hasClosedTrades && dailyPnl === 0;
    
    // Si pas de trade fermé ce jour-là, est-ce qu'on est au milieu d'un trade swing ?
    const isSwingActive = !hasClosedTrades && isDateInActiveTrade(dateStr);

    const allChecklistPerfect =
      hasClosedTrades && closedTrades.every((t) => t.allChecklistPassed);
    const isPast = date <= new Date();
    
    // Le clic est possible s'il y a des trades ouverts ou fermés ce jour-là
    const canClick = dayTrades.length > 0;

    return (
      <button
        key={dateStr}
        onClick={() => canClick && onDayClick?.(dateStr, dayTrades)}
        disabled={!canClick}
        className={`
          relative aspect-square flex flex-col items-center justify-center rounded-lg border
          transition-all duration-200 p-1 min-h-[52px] sm:min-h-[64px]
          ${
            isGreen
              ? "border-neon-green/40 bg-neon-green/10 hover:bg-neon-green/20 cursor-pointer shadow-neon-green"
              : isRed
              ? "border-neon-red/40 bg-neon-red/10 hover:bg-neon-red/20 cursor-pointer shadow-neon-red"
              : isBreakeven
              ? "border-neon-yellow/40 bg-neon-yellow/10 hover:bg-neon-yellow/20 cursor-pointer"
              : isSwingActive
              ? "border-neon-blue/30 bg-neon-blue/5 border-dashed cursor-default" // Style "Trade en cours"
              : canClick
              ? "border-border-active bg-bg-elevated cursor-pointer hover:border-border-glow"
              : "border-border/50 bg-transparent cursor-default"
          }
          ${isToday ? "ring-2 ring-neon-blue ring-offset-2 ring-offset-bg-primary" : ""}
        `.trim()}
      >
        {/* Numéro du jour */}
        <span
          className={`
            text-xs font-medium mono leading-none mb-1
            ${isToday ? "text-neon-blue font-bold" : isGreen ? "text-neon-green" : isRed ? "text-neon-red" : isSwingActive ? "text-neon-blue/70" : isPast ? "text-text-secondary" : "text-text-muted"}
          `.trim()}
        >
          {date.getDate()}
        </span>

        {/* P&L du jour (Très visible) */}
        {hasClosedTrades && (
          <span
            className={`text-xs sm:text-sm font-bold mono leading-none ${
              isGreen ? "text-neon-green" : isRed ? "text-neon-red" : "text-neon-yellow"
            }`}
          >
            {dailyPnl > 0 ? "+" : ""}
            {dailyPnl >= 1000 || dailyPnl <= -1000
              ? `${(dailyPnl / 1000).toFixed(1)}k`
              : dailyPnl.toFixed(0)}
            <span className="text-[8px] sm:text-[10px] opacity-70 ml-0.5">$</span>
          </span>
        )}

        {/* Petit indicateur "Swing" pour les jours d'attente */}
        {isSwingActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse mt-1" title="Trade en cours..." />
        )}

        {/* Badge checklist parfaite */}
        {allChecklistPerfect && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center shadow-neon-green">
            <CheckCheck size={9} className="text-bg-primary" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Navigation du mois ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg border border-border text-text-secondary hover:border-border-active hover:text-text-primary transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <h3 className="text-text-primary font-semibold text-lg">
            {MONTH_NAMES[month]} {year}
          </h3>
          <p className="text-text-muted text-xs mono mt-1">
            {monthStats.total} trades · WR {monthStats.winRate}%
          </p>
        </div>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg border border-border text-text-secondary hover:border-border-active hover:text-text-primary transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Stats mensuelles condensées ───────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Trades", value: String(monthStats.total), color: "text-text-primary" },
          { label: "Win Rate", value: `${monthStats.winRate}%`, color: "text-neon-blue" },
          { label: "Gains", value: String(monthStats.wins), color: "text-neon-green" },
          { label: "P&L", value: formatCurrency(monthStats.pnl), color: monthStats.pnl >= 0 ? "text-neon-green" : "text-neon-red" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-bg-elevated border border-border rounded-xl p-3 text-center shadow-sm"
          >
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-base font-bold mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Jours de la semaine ───────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider py-2 mono"
          >
            {day}
          </div>
        ))}

        {/* Espaces vides avant le 1er jour */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-bg-primary/30 rounded-lg border border-border/20" />
        ))}

        {/* Jours du mois */}
        {daysInMonth.map((date) => renderDay(date))}
      </div>

      {/* ── Légende ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
        {[
          { color: "border-neon-green/40 bg-neon-green/10", label: "Gain" },
          { color: "border-neon-red/40 bg-neon-red/10", label: "Perte" },
          { color: "border-neon-blue/30 bg-neon-blue/5 border-dashed", label: "En cours" },
          { color: "border-border/50 bg-transparent", label: "Sans trade" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${color}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-neon-green flex items-center justify-center shadow-neon-green">
            <CheckCheck size={8} className="text-bg-primary" />
          </div>
          <span className="text-xs text-text-muted">Discipline ✓</span>
        </div>
      </div>
    </div>
  );
};