// ─── UTILITAIRES GÉNÉRAUX ─────────────────────────────────────────────────────

import { TradeSession, TradingRules, TradeAlert, TradingStats, EquityPoint, AssetStat } from "./types";

// ── Génération d'ID unique ─────────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Formatage des nombres (police mono dans le JSX, format ici) ────────────
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Calcul du risque d'un trade ────────────────────────────────────────────
export function calculateTradeRisk(
  entryPrice: number,
  stopLoss: number,
  positionSize: number,
  capital: number
): { riskAmount: number; riskPercent: number } {
  if (!entryPrice || !stopLoss || !positionSize || !capital) {
    return { riskAmount: 0, riskPercent: 0 };
  }
  const priceDiff = Math.abs(entryPrice - stopLoss);
  const riskAmount = priceDiff * positionSize;
  const riskPercent = (riskAmount / capital) * 100;
  
  return { riskAmount, riskPercent };
}

// ── Validation des alertes avant-trade ────────────────────────────────────
export function validateTrade(
  riskPercent: number,
  todayTradesCount: number,
  dailyPnlPercent: number,
  rules: TradingRules
): TradeAlert[] {
  const alerts: TradeAlert[] = [];

  if (riskPercent > rules.maxRiskPerTrade) {
    alerts.push({
      type: "risk_exceeded",
      message: `Risque de ${riskPercent.toFixed(2)}% dépasse le max autorisé (${rules.maxRiskPerTrade}%)`,
      severity: "danger",
    });
  }

  if (todayTradesCount >= rules.maxTradesPerDay) {
    alerts.push({
      type: "trades_exceeded",
      message: `Limite journalière atteinte : ${todayTradesCount}/${rules.maxTradesPerDay} trades`,
      severity: "danger",
    });
  }

  if (dailyPnlPercent < 0 && Math.abs(dailyPnlPercent) > rules.maxDailyDrawdown) {
    alerts.push({
      type: "drawdown_exceeded",
      message: `Drawdown journalier de ${Math.abs(dailyPnlPercent).toFixed(2)}% dépasse la limite (${rules.maxDailyDrawdown}%)`,
      severity: "danger",
    });
  }

  return alerts;
}

// ── Calcul des statistiques globales ──────────────────────────────────────
export function computeStats(
  trades: TradeSession[],
  initialCapital: number
): TradingStats {
  const closedTrades = trades.filter(
    (t) => t.status === "win" || t.status === "loss" || t.status === "breakeven"
  );

  const wins = closedTrades.filter((t) => t.status === "win");
  const losses = closedTrades.filter((t) => t.status === "loss");
  const breakevens = closedTrades.filter((t) => t.status === "breakeven");

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  
  const grossProfit = wins.reduce((s, t) => s + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0));
  
  const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  
  // Sécurisation du Profit Factor pour éviter les divisions par zéro
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);

  // Construction de la courbe de capital (triée chronologiquement)
  const sorted = [...closedTrades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningCapital = initialCapital;
  const equityCurve: EquityPoint[] = [
    { date: "Départ", capital: initialCapital, pnl: 0 },
  ];

  sorted.forEach((t) => {
    runningCapital += t.pnl || 0;
    equityCurve.push({
      date: t.date.split("T")[0],
      capital: runningCapital,
      pnl: t.pnl || 0,
    });
  });

  // Répartition par actif
  const assetMap: Record<string, AssetStat> = {};
  closedTrades.forEach((t) => {
    if (!assetMap[t.asset]) {
      assetMap[t.asset] = { asset: t.asset, count: 0, pnl: 0 };
    }
    assetMap[t.asset].count += 1;
    assetMap[t.asset].pnl += t.pnl || 0;
  });

  return {
    totalTrades: closedTrades.length,
    wins: wins.length,
    losses: losses.length,
    breakevens: breakevens.length,
    winRate,
    totalPnl,
    totalPnlPercent: (totalPnl / initialCapital) * 100,
    averageWin,
    averageLoss,
    profitFactor,
    currentCapital: initialCapital + totalPnl,
    equityCurve,
    assetDistribution: Object.values(assetMap),
  };
}

// ── Grouper les trades par date pour le calendrier ─────────────────────────
export function groupTradesByDate(trades: TradeSession[]) {
  const map: Record<string, TradeSession[]> = {};
  trades.forEach((t) => {
    const day = t.date.split("T")[0];
    if (!map[day]) map[day] = [];
    map[day].push(t);
  });
  return map;
}

// ── Obtenir tous les jours d'un mois (Sécurisé pour les fuseaux) ───────────
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  // On fixe l'heure à midi (12h) pour éviter que les décalages horaires (DST) ne sautent un jour
  const firstDay = new Date(year, month, 1, 12, 0, 0);
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0);
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

// ── Classer une couleur PnL (Intégration Tailwind) ────────────────────────
export function pnlColor(value: number): string {
  if (value > 0) return "text-neon-green";
  if (value < 0) return "text-neon-red";
  return "text-text-secondary";
}

export function pnlBgColor(value: number): string {
  if (value > 0) return "border-neon-green shadow-neon-green";
  if (value < 0) return "border-neon-red shadow-neon-red";
  return "border-border";
}

// ── Clamp (Borner une valeur) ─────────────────────────────────────────────
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}