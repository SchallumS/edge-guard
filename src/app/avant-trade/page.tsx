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
import { rulesStorage, tradesStorage } from "@/lib/storage";
import {
  validateTrade,
  generateId,
  formatCurrency,
  formatPercent,
} from "@/lib/utils";
import { TradingRules, TradeSession, TradeAlert } from "@/lib/types";

type Direction = "LONG" | "SHORT";

export default function AvantTradePage() {
  const [rules, setRules] = useState<TradingRules>(rulesStorage.getDefaults());
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [lastTrade, setLastTrade] = useState<TradeSession | null>(null);

  // ── Nouveaux champs simplifiés ──
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<Direction>("LONG");
  const [entryPrice, setEntryPrice] = useState(""); // Gardé juste pour l'historique (optionnel)
  const [riskInput, setRiskInput] = useState("");   // Somme perdue si SL ($)
  const [rewardInput, setRewardInput] = useState(""); // Somme gagnée si TP ($)
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setRules(rulesStorage.get());
  }, []);

  // ── Calculs en temps réel basés sur les montants du broker ────────
  const riskAmount = parseFloat(riskInput) || 0;
  const rewardAmount = parseFloat(rewardInput) || 0;
  
  const riskPercent = rules.initialCapital > 0 
    ? (riskAmount / rules.initialCapital) * 100 
    : 0;

  const rrRatio = riskAmount > 0 ? rewardAmount / riskAmount : null;

  // Alertes de validation
  const todayCount = tradesStorage.countToday();
  const todayPnl = tradesStorage.getDailyPnl();
  const dailyPnlPercent = (todayPnl / rules.initialCapital) * 100;

  const alerts: TradeAlert[] = useMemo(() => {
    if (!riskAmount) return [];
    return validateTrade(
      riskPercent,
      todayCount,
      dailyPnlPercent,
      rules
    );
  }, [riskPercent, todayCount, dailyPnlPercent, rules]);

  // ── Condition de validation ────────────────────────────────────────
  const requiredItems = rules.checklistItems.filter((i) => i.isRequired);
  const allRequiredChecked = requiredItems.every((i) =>
    checkedItems.includes(i.id)
  );
  const hasDangerAlert = alerts.some((a) => a.severity === "danger");
  
  // On valide si l'actif et le risque sont renseignés
  const isFormValid = asset && riskInput;
  const canSubmit = allRequiredChecked && isFormValid && !hasDangerAlert;

  // ── Soumission du trade ────────────────────────────────────────────
  const handleSubmit = () => {
    if (!canSubmit) return;

    const newTrade: TradeSession = {
      id: generateId(),
      date: new Date().toISOString(),
      asset,
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      stopLoss: 0, // Inutilisé dans la nouvelle logique
      takeProfit: 0, // Inutilisé dans la nouvelle logique
      positionSize: 0, // Inutilisé
      riskAmount: riskAmount,
      riskPercent: riskPercent,
      notes,
      checklistCompleted: checkedItems,
      allChecklistPassed: rules.checklistItems.every((i) =>
        checkedItems.includes(i.id)
      ),
      status: "open",
    };

    tradesStorage.add(newTrade);
    setLastTrade(newTrade);
    setSubmitted(true);
  };

  // ── Reset du formulaire ────────────────────────────────────────────
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
        {/* ── En-tête ────────────────────────────────────────────────── */}
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

        {/* ── Alertes globales ──────────────────────────────────────── */}
        <AlertBanner alerts={alerts} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Colonne gauche : Formulaire du trade (3/5) ────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Actif & Direction */}
            <Card title="Identification du Trade">
              <div className="space-y-4">
                
                {/* Presets d'actifs */}
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

                {/* Direction */}
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

            {/* ── NOUVEAU : Paramètres monétaires ── */}
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

            {/* Récapitulatif dynamique */}
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

            {/* Notes */}
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

          {/* ── Colonne droite : Checklist (2/5) ──────────────────────── */}
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

            {/* Bouton de validation ─────────────────────────────────── */}
            <div className="space-y-3">
              {/* Indicateur de blocage */}
              {!canSubmit && (
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
                disabled={!canSubmit}
                className={`
                  w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base
                  transition-all duration-300
                  ${
                    canSubmit
                      ? "bg-neon-green/10 border-2 border-neon-green/50 text-neon-green hover:bg-neon-green/20 shadow-neon-green animate-pulse-neon cursor-pointer"
                      : "bg-bg-elevated border-2 border-border text-text-muted cursor-not-allowed"
                  }
                `.trim()}
              >
                {canSubmit ? (
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