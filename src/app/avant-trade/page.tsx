// ─── PAGE AVANT-TRADE (Le Garde-Fou) ─────────────────────────────────────────
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Send,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { TradeChecklist } from "@/components/features/TradeChecklist";
import api from "@/lib/api"; 
import {
  validateTrade,
  formatCurrency,
  formatPercent,
} from "@/lib/utils";
import { TradingRules, TradeSession, TradeAlert } from "@/lib/types";

type Direction = "LONG" | "SHORT";

export default function AvantTradePage() {
  const [rules, setRules] = useState<TradingRules | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [lastTrade, setLastTrade] = useState<TradeSession | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [todayPnl, setTodayPnl] = useState(0);

  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<Direction>("LONG");
  const [entryPrice, setEntryPrice] = useState(""); 
  const [riskInput, setRiskInput] = useState("");   
  const [rewardInput, setRewardInput] = useState(""); 
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [rulesRes, tradesRes] = await Promise.all([
          api.get("/rules"),
          api.get("/trades")
        ]);

        setRules(rulesRes.data.data);

        const trades = tradesRes.data.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let count = 0;
        let pnl = 0;

        trades.forEach((t: any) => {
          if (new Date(t.date) >= today) {
            count++;
            if (t.status === "win" || t.status === "loss" || t.status === "breakeven") {
              pnl += (t.pnl || 0);
            }
          }
        });

        setTodayCount(count);
        setTodayPnl(pnl);
      } catch (error) {
        console.error("Erreur lors du chargement des données Avant-Trade:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 💡 1. DÉPLACEMENT ICI : On fait les calculs ET le useMemo AVANT le "if (isLoading)"
  const riskAmount = parseFloat(riskInput) || 0;
  const rewardAmount = parseFloat(rewardInput) || 0;
  
  // On sécurise avec rules?.initialCapital pour éviter les erreurs pendant le chargement
  const riskPercent = rules?.initialCapital 
    ? (riskAmount / rules.initialCapital) * 100 
    : 0;

  const rrRatio = riskAmount > 0 ? rewardAmount / riskAmount : null;
  const dailyPnlPercent = rules?.initialCapital ? (todayPnl / rules.initialCapital) * 100 : 0;

  // Le hook useMemo est maintenant toujours appelé, respectant la règle de React
  const alerts: TradeAlert[] = useMemo(() => {
    if (!rules || !riskAmount) return [];
    return validateTrade(
      riskPercent,
      todayCount,
      dailyPnlPercent,
      rules
    );
  }, [riskPercent, todayCount, dailyPnlPercent, rules, riskAmount]);

  // 💡 2. L'écran de chargement est placé APRÈS tous les hooks
  if (isLoading || !rules) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // ── Condition de validation ────────────────────────────────────────
  const requiredItems = rules.checklistItems.filter((i) => i.isRequired);
  const allRequiredChecked = requiredItems.every((i) =>
    checkedItems.includes(i.id)
  );
  const hasDangerAlert = alerts.some((a) => a.severity === "danger");
  
  const isFormValid = asset && riskInput;
  const canSubmit = allRequiredChecked && isFormValid && !hasDangerAlert;

  // ── Soumission du trade ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        date: new Date().toISOString(),
        asset,
        direction,
        entryPrice: parseFloat(entryPrice) || 0,
        riskAmount: riskAmount,
        riskPercent: riskPercent,
        notes,
        checklistCompleted: checkedItems,
        allChecklistPassed: rules.checklistItems.every((i) =>
          checkedItems.includes(i.id)
        ),
        status: "open", 
      };

      const res = await api.post("/trades", payload);
      
      setLastTrade(res.data.data); 
      setSubmitted(true);
      setTodayCount(prev => prev + 1);

    } catch (error) {
      console.error("Erreur lors de la création du trade:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAsset("");
    setDirection("LONG");
    setEntryPrice("");
    setRiskInput("");
    setRewardInput("");
    setNotes("");
    setCheckedItems([]);
    setSubmitted(false);
    setLastTrade(null);
  };

  // ── Vue de confirmation ────────────────────────────────────────────
  if (submitted && lastTrade) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card glowColor="green" className="text-center py-12">
            <div className="w-20 h-20 bg-neon-green/10 border-2 border-neon-green/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={36} className="text-neon-green" />
            </div>
            <h2 className="text-2xl font-bold text-neon-green mb-2 animate-glow">
              Trade Validé !
            </h2>
            <p className="text-text-secondary mb-8">
              Setup enregistré — Bonne exécution, trader.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Actif", value: lastTrade.asset },
                { label: "Direction", value: lastTrade.direction },
                { label: "Risque", value: formatPercent(lastTrade.riskPercent) },
                { label: "R/R", value: rrRatio ? `${rrRatio.toFixed(2)}:1` : "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-bg-elevated border border-border rounded-lg p-3"
                >
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="text-sm font-bold text-text-primary mono mt-1">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={handleReset}
              leftIcon={<RefreshCw size={16} />}
            >
              Nouveau setup
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Avant-Trade</h2>
            <p className="text-text-secondary text-sm">
              Saisissez les montants de votre broker et validez vos règles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mono border ${
              todayCount < rules.maxTradesPerDay
                ? "bg-neon-green/10 text-neon-green border-neon-green/30"
                : "bg-neon-red/10 text-neon-red border-neon-red/30"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                todayCount < rules.maxTradesPerDay ? "bg-neon-green animate-pulse" : "bg-neon-red"
              }`} />
              {todayCount}/{rules.maxTradesPerDay} trades aujourd'hui
            </div>
          </div>
        </div>

        <AlertBanner alerts={alerts} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card title="Identification du Trade">
              <div className="space-y-4">
                <div>
                  <label className="field-label">Actif</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(!rules.customAssets || rules.customAssets.length === 0) && (
                      <p className="text-xs text-text-muted italic py-1">
                        Aucun actif rapide configuré.
                      </p>
                    )}
                    {(rules.customAssets || []).map((customAsset) => (
                      <button
                        key={customAsset}
                        onClick={() => setAsset(customAsset)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs mono border transition-all duration-200
                          ${
                            asset === customAsset
                              ? "bg-neon-blue/10 border-neon-blue/50 text-neon-blue"
                              : "border-border text-text-muted hover:border-border-active hover:text-text-secondary"
                          }
                        `.trim()}
                      >
                        {customAsset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    placeholder="Ou saisir manuellement (ex: V75, EURUSD)"
                    className="cyber-input text-sm uppercase font-mono tracking-wider"
                  />
                </div>

                <div>
                  <label className="field-label">Direction</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["LONG", "SHORT"] as Direction[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDirection(d)}
                        className={`
                          flex items-center justify-center gap-2 py-3 rounded-lg border
                          font-medium text-sm transition-all duration-200
                          ${
                            direction === d
                              ? d === "LONG"
                                ? "bg-neon-green/10 border-neon-green/50 text-neon-green"
                                : "bg-neon-red/10 border-neon-red/50 text-neon-red"
                              : "border-border text-text-secondary hover:border-border-active"
                          }
                        `.trim()}
                      >
                        {d === "LONG" ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Paramètres du Risque" subtitle="Montants indiqués par votre broker (MT4/MT5/XTB)">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Risque (Perte si SL touché)"
                    type="number"
                    step="any"
                    value={riskInput}
                    onChange={(e) => setRiskInput(e.target.value)}
                    placeholder="Ex: 50"
                    leftAddon={<span className="text-xs text-neon-red mono">SL $</span>}
                  />
                  <Input
                    label="Gain potentiel (Si TP touché)"
                    type="number"
                    step="any"
                    value={rewardInput}
                    onChange={(e) => setRewardInput(e.target.value)}
                    placeholder="Ex: 150"
                    leftAddon={<span className="text-xs text-neon-green mono">TP $</span>}
                  />
                </div>
                
                <div className="border-t border-border pt-4">
                  <Input
                    label="Prix d'entrée (Optionnel - pour journal)"
                    type="number"
                    step="any"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="Ex: 65400.50"
                    leftAddon={<span className="text-xs text-text-muted mono">#</span>}
                  />
                </div>
              </div>
            </Card>

            {(riskInput || rewardInput) && (
              <Card
                title="Bilan du Trade"
                glowColor={
                  riskPercent > rules.maxRiskPerTrade ? "red" : "none"
                }
              >
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Risque (%)",
                      value: `${riskPercent.toFixed(2)}%`,
                      color:
                        riskPercent > rules.maxRiskPerTrade
                          ? "text-neon-red"
                          : riskPercent > 0
                          ? "text-neon-yellow"
                          : "text-text-muted",
                    },
                    {
                      label: "R/R Ratio",
                      value: rrRatio ? `${rrRatio.toFixed(2)}:1` : "—",
                      color:
                        rrRatio && rrRatio >= 2
                          ? "text-neon-green"
                          : rrRatio
                          ? "text-neon-yellow"
                          : "text-text-muted",
                    },
                    {
                      label: "Gain net",
                      value: rewardAmount > 0 ? formatCurrency(rewardAmount) : "—",
                      color: "text-neon-green",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="bg-bg-elevated border border-border rounded-lg p-3 text-center"
                    >
                      <p className="text-xs text-text-muted mb-1">{label}</p>
                      <p className={`text-sm font-bold mono ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card title="Notes de Trading">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contexte du marché, raison du setup, confluences, remarques psychologiques..."
                rows={4}
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-glow transition-all duration-200 text-sm resize-none"
              />
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card
              title="Validation du Setup"
              subtitle="Toutes les conditions requises doivent être cochées"
            >
              <TradeChecklist
                items={rules.checklistItems}
                checkedIds={checkedItems}
                onChange={setCheckedItems}
              />
            </Card>

            <div className="space-y-3">
              {!canSubmit && !isSubmitting && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <ShieldAlert size={14} className={hasDangerAlert ? "text-neon-red" : "text-text-muted"} />
                  <span>
                    {hasDangerAlert
                      ? "Alertes de risque actives — trade bloqué"
                      : !allRequiredChecked
                      ? "Checklist incomplète — trade bloqué"
                      : !isFormValid
                      ? "Formulaire incomplet"
                      : ""}
                  </span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`
                  w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base
                  transition-all duration-300
                  ${
                    canSubmit && !isSubmitting
                      ? "bg-neon-green/10 border-2 border-neon-green/50 text-neon-green hover:bg-neon-green/20 shadow-neon-green animate-pulse-neon cursor-pointer"
                      : "bg-bg-elevated border-2 border-border text-text-muted cursor-not-allowed"
                  }
                `.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                    Validation en cours...
                  </>
                ) : canSubmit ? (
                  <>
                    <ShieldCheck size={20} />
                    Valider le Trade
                    <Send size={16} />
                  </>
                ) : (
                  <>
                    <ShieldAlert size={20} />
                    Trade Bloqué
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}