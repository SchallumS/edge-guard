// ─── PAGE CALENDRIER DE PERFORMANCE ──────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, X, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CalendarGrid } from "@/components/features/CalendarGrid";
import { tradesStorage } from "@/lib/storage";
import { TradeSession } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CalendarPage() {
  const [trades, setTrades] = useState<TradeSession[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    trades: TradeSession[];
  } | null>(null);

  useEffect(() => {
    setTrades(tradesStorage.getAll());
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (date: string, dayTrades: TradeSession[]) => {
    setSelectedDay({ date, trades: dayTrades });
  };

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    win: { label: "Gain", color: "green" },
    loss: { label: "Perte", color: "red" },
    breakeven: { label: "Flat", color: "yellow" },
    open: { label: "En cours", color: "blue" },
    pending: { label: "Annulé", color: "gray" },
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── En-tête ──────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Calendrier de Performance
          </h2>
          <p className="text-text-secondary text-sm">
            Visualisation mensuelle — chaque jour raconte une histoire
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Grille du calendrier (2/3) ─────────────────────────── */}
          <div className="lg:col-span-2">
            <Card noPadding>
              <div className="p-6">
                <CalendarGrid
                  trades={trades}
                  currentDate={currentDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onDayClick={handleDayClick}
                />
              </div>
            </Card>
          </div>

          {/* ── Panneau détail du jour sélectionné (1/3) ────────────── */}
          <div className="lg:col-span-1 space-y-4">
            {selectedDay ? (
              <Card
                title={formatDate(selectedDay.date)}
                subtitle={`${selectedDay.trades.length} trade(s)`}
                headerRight={
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Fermer les détails"
                  >
                    <X size={16} />
                  </button>
                }
              >
                <div className="space-y-3">
                  {selectedDay.trades.map((trade) => {
                    const config = STATUS_CONFIG[trade.status] || STATUS_CONFIG.pending;
                    return (
                      <div
                        key={trade.id}
                        className="bg-bg-elevated border border-border rounded-lg p-4 space-y-2"
                      >
                        {/* En-tête trade */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {trade.direction === "LONG" ? (
                              <TrendingUp size={14} className="text-neon-green" />
                            ) : (
                              <TrendingDown size={14} className="text-neon-red" />
                            )}
                            <span className="text-sm font-bold mono text-text-primary">
                              {trade.asset}
                            </span>
                          </div>
                          <Badge variant={config.color as "green" | "red" | "yellow" | "blue" | "gray"}>
                            {config.label}
                          </Badge>
                        </div>

                        {/* P&L */}
                        {trade.pnl !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-text-muted">P&L</span>
                            <span
                              className={`text-sm font-bold mono ${
                                trade.pnl >= 0 ? "text-neon-green" : "text-neon-red"
                              }`.trim()}
                            >
                              {trade.pnl > 0 ? "+" : ""}
                              {formatCurrency(trade.pnl)}
                            </span>
                          </div>
                        )}

                        {/* Risque */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-muted">Risque</span>
                          <span className="text-xs mono text-text-secondary">
                            {trade.riskPercent.toFixed(2)}%
                          </span>
                        </div>

                        {/* Checklist */}
                        <div className="flex items-center gap-1.5">
                          {trade.allChecklistPassed ? (
                            <>
                              <CheckCircle2 size={12} className="text-neon-green" />
                              <span className="text-xs text-neon-green">
                                Checklist 100%
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="text-text-muted" />
                              <span className="text-xs text-text-muted">
                                {trade.checklistCompleted.length} items cochés
                              </span>
                            </>
                          )}
                        </div>

                        {/* Notes */}
                        {trade.notes && (
                          <p className="text-xs text-text-muted italic border-t border-border pt-2">
                            {trade.notes.slice(0, 100)}
                            {trade.notes.length > 100 ? "..." : ""}
                          </p>
                        )}

                        {/* Mise à jour du statut (clôturer le trade) */}
                        {(trade.status === "open" || trade.status === "pending") && (
                          <div className="flex gap-2 pt-1">
                            {(["win", "loss", "breakeven"] as const).map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  const pnl =
                                    s === "win"
                                      ? trade.riskAmount * 2 // Exemple simpliste d'un RR 1:2
                                      : s === "loss"
                                      ? -trade.riskAmount
                                      : 0;
                                  
                                  // ── LA MISE À JOUR EST ICI ──
                                  tradesStorage.update(trade.id, {
                                    status: s,
                                    pnl,
                                    pnlPercent: (pnl / trade.riskAmount) * 100, // Simplifié
                                    closeDate: new Date().toISOString(), // L'enregistrement de la date de clôture !
                                  });
                                  
                                  setTrades(tradesStorage.getAll());
                                  setSelectedDay({
                                    date: selectedDay.date,
                                    trades: tradesStorage.getByDate(selectedDay.date),
                                  });
                                }}
                                className={`flex-1 py-1.5 rounded text-xs font-medium border transition-all duration-200 ${
                                  s === "win"
                                    ? "border-neon-green text-neon-green hover:bg-neon-green hover:bg-opacity-10"
                                    : s === "loss"
                                    ? "border-neon-red text-neon-red hover:bg-neon-red hover:bg-opacity-10"
                                    : "border-border text-text-muted hover:border-border-active"
                                }`.trim()}
                              >
                                {s === "win" ? "Gain" : s === "loss" ? "Perte" : "Flat"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8 text-text-muted">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm">
                    Cliquez sur un jour tradé pour voir les détails
                  </p>
                  <p className="text-xs mono mt-2">
                    Seuls les jours avec des trades sont cliquables
                  </p>
                </div>
              </Card>
            )}

            {/* Stats rapides des 5 derniers trades */}
            <Card title="Derniers Trades" subtitle="5 trades récents">
              <div className="space-y-2">
                {trades
                  .filter((t) => t.status !== "pending" && t.status !== "open")
                  .slice(-5)
                  .reverse()
                  .map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                    >
                      <div
                        className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
                          trade.status === "win"
                            ? "bg-neon-green"
                            : trade.status === "loss"
                            ? "bg-neon-red"
                            : "bg-text-muted"
                        }`.trim()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary mono truncate">
                          {trade.asset}
                        </p>
                        <p className="text-xs text-text-muted">
                          {trade.date.split("T")[0]}
                        </p>
                      </div>
                      {trade.pnl !== undefined && (
                        <span
                          className={`text-xs font-bold mono ${
                            trade.pnl >= 0 ? "text-neon-green" : "text-neon-red"
                          }`.trim()}
                        >
                          {trade.pnl > 0 ? "+" : ""}
                          {formatCurrency(trade.pnl)}
                        </span>
                      )}
                    </div>
                  ))}
                {trades.filter(
                  (t) => t.status !== "pending" && t.status !== "open"
                ).length === 0 && (
                  <p className="text-center text-text-muted text-xs py-4">
                    Aucun trade clôturé
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}