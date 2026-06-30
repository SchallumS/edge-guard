// ─── PAGE CALENDRIER DE PERFORMANCE ──────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, X, TrendingUp, TrendingDown, Clock, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CalendarGrid } from "@/components/features/CalendarGrid";
import api from "@/lib/api"; 
import { TradeSession } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CalendarPage() {
  const [trades, setTrades] = useState<TradeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    trades: TradeSession[];
  } | null>(null);

  // 💡 NOUVEAUX ÉTATS POUR GÉRER L'INPUT DU BREAK-EVEN
  const [editingBEId, setEditingBEId] = useState<string | null>(null);
  const [beAmount, setBeAmount] = useState<string>("");

  const fetchTrades = async () => {
    try {
      const res = await api.get("/trades");
      setTrades(res.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des trades :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleDayClick = (date: string, dayTrades: TradeSession[]) => {
    setSelectedDay({ date, trades: dayTrades });
    // On ferme un éventuel input BE ouvert si on change de jour
    setEditingBEId(null); 
  };

  const getTradesByDateStr = (dateStr: string, allTrades: TradeSession[]) => {
    const targetDate = new Date(dateStr).toDateString();
    return allTrades.filter((t) => new Date(t.date).toDateString() === targetDate);
  };

  // 💡 Remplacement de "Flat" par "BE"
  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    win: { label: "Gain", color: "green" },
    loss: { label: "Perte", color: "red" },
    breakeven: { label: "BE", color: "yellow" },
    open: { label: "En cours", color: "blue" },
    pending: { label: "Annulé", color: "gray" },
  };

  // 💡 FONCTION CENTRALISÉE POUR METTRE À JOUR LE TRADE
  const updateTradeStatus = async (trade: any, status: string, specificPnl?: number) => {
    let pnl = 0;
    
    if (status === "win") pnl = trade.riskAmount * 2;
    else if (status === "loss") pnl = -trade.riskAmount;
    else if (status === "breakeven" && specificPnl !== undefined) pnl = specificPnl;

    try {
      const tradeId = trade._id || trade.id;
      await api.put(`/trades/${tradeId}`, {
        status,
        pnl,
        pnlPercent: trade.riskAmount > 0 ? (pnl / trade.riskAmount) * 100 : 0,
        closeDate: new Date().toISOString(),
        // On envoie les infos BE au backend si applicable
        isBreakEven: status === "breakeven",
        breakEvenPnL: status === "breakeven" ? pnl : null,
      });

      const res = await api.get("/trades");
      const freshTrades = res.data.data;
      setTrades(freshTrades);

      if (selectedDay) {
        setSelectedDay({
          date: selectedDay.date,
          trades: getTradesByDateStr(selectedDay.date, freshTrades),
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Calendrier de Performance</h2>
          <p className="text-text-secondary text-sm">Visualisation mensuelle — chaque jour raconte une histoire</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          <div className="lg:col-span-1 space-y-4">
            {selectedDay ? (
              <Card
                title={formatDate(selectedDay.date)}
                subtitle={`${selectedDay.trades.length} trade(s)`}
                headerRight={
                  <button
                    onClick={() => {
                      setSelectedDay(null);
                      setEditingBEId(null);
                    }}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                }
              >
                <div className="space-y-3">
                  {selectedDay.trades.map((trade) => {
                    const config = STATUS_CONFIG[trade.status] || STATUS_CONFIG.pending;
                    const tradeId = (trade as any)._id || trade.id;

                    return (
                      <div key={tradeId} className="bg-bg-elevated border border-border rounded-lg p-4 space-y-2">
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
                                trade.pnl > 0 ? "text-neon-green" : trade.pnl < 0 ? "text-neon-red" : "text-neon-yellow"
                              }`.trim()}
                            >
                              {trade.pnl > 0 ? "+" : ""}
                              {formatCurrency(trade.pnl)}
                            </span>
                          </div>
                        )}

                        {/* Risque & Checklist */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-muted">Risque</span>
                          <span className="text-xs mono text-text-secondary">{trade.riskPercent.toFixed(2)}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {trade.allChecklistPassed ? (
                            <>
                              <CheckCircle2 size={12} className="text-neon-green" />
                              <span className="text-xs text-neon-green">Checklist 100%</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} className="text-text-muted" />
                              <span className="text-xs text-text-muted">{trade.checklistCompleted.length} items cochés</span>
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

                        {/* 💡 ACTIONS DE CLÔTURE */}
                        {(trade.status === "open" || trade.status === "pending") && (
                          <div className="pt-2">
                            {editingBEId === tradeId ? (
                              /* FORMULAIRE BREAK-EVEN */
                              <div className="bg-bg-primary border border-neon-yellow/30 p-3 rounded-lg animate-fade-in space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-text-secondary mb-1 block">PnL du Break-even ($)</label>
                                  <input
                                    type="number"
                                    step="any"
                                    value={beAmount}
                                    onChange={(e) => setBeAmount(e.target.value)}
                                    placeholder="Ex: 3 ou -1.5"
                                    className="w-full bg-bg-elevated border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-neon-yellow mono"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      updateTradeStatus(trade, "breakeven", parseFloat(beAmount) || 0);
                                      setEditingBEId(null);
                                      setBeAmount("");
                                    }}
                                    className="flex-1 bg-neon-yellow/20 hover:bg-neon-yellow/30 text-neon-yellow text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
                                  >
                                    <Check size={14} /> Valider
                                  </button>
                                  <button
                                    onClick={() => setEditingBEId(null)}
                                    className="flex-1 bg-bg-elevated hover:bg-border text-text-muted text-xs font-medium py-1.5 rounded transition-colors"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* BOUTONS STANDARDS */
                              <div className="flex gap-2">
                                {(["win", "loss", "breakeven"] as const).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      if (s === "breakeven") {
                                        setEditingBEId(tradeId);
                                        setBeAmount(""); 
                                      } else {
                                        updateTradeStatus(trade, s);
                                      }
                                    }}
                                    className={`flex-1 py-1.5 rounded text-xs font-medium border transition-all duration-200 ${
                                      s === "win"
                                        ? "border-neon-green text-neon-green hover:bg-neon-green hover:bg-opacity-10"
                                        : s === "loss"
                                        ? "border-neon-red text-neon-red hover:bg-neon-red hover:bg-opacity-10"
                                        : "border-neon-yellow text-neon-yellow hover:bg-neon-yellow hover:bg-opacity-10"
                                    }`.trim()}
                                  >
                                    {/* 💡 Remplacement de "Flat (BE)" par "BE" sur le bouton */}
                                    {s === "win" ? "Gain" : s === "loss" ? "Perte" : "BE"}
                                  </button>
                                ))}
                              </div>
                            )}
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
                  <p className="text-sm">Cliquez sur un jour tradé pour voir les détails</p>
                  <p className="text-xs mono mt-2">Seuls les jours avec des trades sont cliquables</p>
                </div>
              </Card>
            )}

            {/* Stats rapides des 5 derniers trades */}
            <Card title="Derniers Trades" subtitle="5 trades récents">
              <div className="space-y-2">
                {trades
                  .filter((t) => t.status !== "pending" && t.status !== "open")
                  .slice(0, 5)
                  .map((trade) => {
                    const tradeId = (trade as any)._id || trade.id;
                    return (
                      <div key={tradeId} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div
                          className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
                            trade.status === "win"
                              ? "bg-neon-green"
                              : trade.status === "loss"
                              ? "bg-neon-red"
                              : "bg-neon-yellow"
                          }`.trim()}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary mono truncate">{trade.asset}</p>
                          <p className="text-xs text-text-muted">{trade.date.split("T")[0]}</p>
                        </div>
                        {trade.pnl !== undefined && (
                          <span
                            className={`text-xs font-bold mono ${
                              trade.pnl > 0 ? "text-neon-green" : trade.pnl < 0 ? "text-neon-red" : "text-neon-yellow"
                            }`.trim()}
                          >
                            {trade.pnl > 0 ? "+" : ""}
                            {formatCurrency(trade.pnl)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                {trades.filter((t) => t.status !== "pending" && t.status !== "open").length === 0 && (
                  <p className="text-center text-text-muted text-xs py-4">Aucun trade clôturé</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}