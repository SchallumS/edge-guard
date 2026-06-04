// ─── PAGE DASHBOARD ───────────────────────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  ShieldCheck,
  BarChart3,
  Settings2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { RulesForm } from "@/components/features/RulesForm";
import { rulesStorage, tradesStorage } from "@/lib/storage";
import { computeStats, formatCurrency, formatPercent } from "@/lib/utils";
import { TradingRules, TradingStats } from "@/lib/types";

export default function DashboardPage() {
  const [rules, setRules] = useState<TradingRules>(rulesStorage.getDefaults());
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "config">("overview");

  useEffect(() => {
    const loadedRules = rulesStorage.get();
    setRules(loadedRules);
    const trades = tradesStorage.getAll();
    setStats(computeStats(trades, loadedRules.initialCapital));
  }, []);

  const handleRulesSave = () => {
    const newRules = rulesStorage.get();
    setRules(newRules);
    const trades = tradesStorage.getAll();
    setStats(computeStats(trades, newRules.initialCapital));
  };

  const todayCount = tradesStorage.countToday();

  // Cartes de statuts clés
  const statCards = stats
    ? [
        {
          title: "Capital Actuel",
          value: formatCurrency(stats.currentCapital),
          delta: formatPercent(stats.totalPnlPercent),
          icon: DollarSign,
          color: "text-neon-green",
        },
        {
          title: "Win Rate",
          value: `${stats.winRate.toFixed(1)}%`,
          delta: `${stats.wins}W / ${stats.losses}L`,
          icon: Target,
          color: "text-neon-blue",
        },
        {
          title: "P&L Total",
          value: formatCurrency(stats.totalPnl),
          delta: `${stats.totalTrades} trades clôturés`,
          icon: stats.totalPnl >= 0 ? TrendingUp : TrendingDown,
          color: stats.totalPnl >= 0 ? "text-neon-green" : "text-neon-red",
        },
        {
          title: "Profit Factor",
          value:
            stats.profitFactor === Infinity
              ? "∞"
              : stats.profitFactor.toFixed(2),
          delta: `Moy. gain: ${formatCurrency(stats.averageWin)}`,
          icon: BarChart3,
          color: stats.profitFactor >= 1.5 ? "text-neon-green" : "text-neon-yellow",
        },
      ]
    : [];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ── En-tête de page ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Vue d'ensemble
            </h2>
            <p className="text-text-secondary text-sm mono capitalize">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {/* Les badges redondants ont été supprimés d'ici pour épurer ! */}
        </div>

        {/* ── Cartes de stats ───────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ title, value, delta, icon: Icon, color }) => (
              <Card key={title} className="relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-text-muted uppercase tracking-wider">
                    {title}
                  </span>
                  <Icon size={16} className={color} />
                </div>
                <p className={`text-xl sm:text-2xl font-bold mono ${color}`}>
                  {value}
                </p>
                <p className="text-xs text-text-muted mono mt-1">{delta}</p>
              </Card>
            ))}
          </div>
        )}

        {/* ── Onglets Config / Overview ─────────────────────────────── */}
        <div className="flex gap-1 bg-bg-elevated border border-border rounded-xl p-1 w-fit">
          {(["overview", "config"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  activeTab === tab
                    ? "bg-bg-card text-text-primary border border-border shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }
              `.trim()}
            >
              {tab === "overview" ? (
                <>
                  <BarChart3 size={14} />
                  Aperçu
                </>
              ) : (
                <>
                  <Settings2 size={14} />
                  Configuration
                </>
              )}
            </button>
          ))}
        </div>

        {/* ── Contenu de l'onglet actif ─────────────────────────────── */}
        {activeTab === "config" ? (
          <RulesForm onSave={handleRulesSave} />
        ) : (
          <div className="space-y-4">
            
            {/* Raccourcis vers les modules (Correction Tailwind v4 appliquée) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  href: "/avant-trade",
                  icon: ShieldCheck,
                  title: "Avant-Trade",
                  desc: "Valider un nouveau setup",
                  color: "text-neon-blue",
                  borderColor: "border-neon-blue",
                  bg: "bg-neon-blue/10", // Syntaxe corrigée
                },
                {
                  href: "/calendar",
                  icon: Target,
                  title: "Calendrier",
                  desc: "Voir la performance",
                  color: "text-neon-green",
                  borderColor: "border-neon-green",
                  bg: "bg-neon-green/10", // Syntaxe corrigée
                },
                {
                  href: "/analytics",
                  icon: BarChart3,
                  title: "Analyses",
                  desc: "Graphiques & Stats",
                  color: "text-neon-yellow",
                  borderColor: "border-neon-yellow",
                  bg: "bg-neon-yellow/10", // Syntaxe corrigée
                },
              ].map(({ href, icon: Icon, title, desc, color, borderColor, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-4 p-5 bg-bg-card border rounded-xl
                    hover:border-opacity-60 transition-all duration-200 group
                    ${borderColor} border-opacity-30 hover:shadow-card-hover
                  `.trim()}
                >
                  <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-text-muted group-hover:text-text-secondary ml-auto flex-shrink-0 transition-transform group-hover:translate-x-1 duration-200"
                  />
                </Link>
              ))}
            </div>

            {/* Règles actives */}
            <Card
              title="Règles Actives"
              subtitle="Configuration en vigueur"
              headerRight={
                <button
                  onClick={() => setActiveTab("config")}
                  className="text-xs text-neon-blue hover:underline mono"
                >
                  Modifier
                </button>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { 
                    label: "Max trades/j", 
                    value: `${rules.maxTradesPerDay}`, 
                    style: todayCount < rules.maxTradesPerDay ? "bg-neon-green/10 text-neon-green border-neon-green/30" : "bg-neon-red/10 text-neon-red border-neon-red/30" 
                  },
                  { 
                    label: "Risque/trade", 
                    value: `${rules.maxRiskPerTrade}%`, 
                    style: "bg-neon-blue/10 text-neon-blue border-neon-blue/30" 
                  },
                  { 
                    label: "Drawdown max", 
                    value: `${rules.maxDailyDrawdown}%`, 
                    style: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30" 
                  },
                  { 
                    label: "Capital init.", 
                    value: formatCurrency(rules.initialCapital), 
                    style: "bg-bg-primary text-text-secondary border-border" 
                  },
                ].map(({ label, value, style }) => (
                  <div
                    key={label}
                    className="bg-bg-elevated border border-border rounded-lg p-3"
                  >
                    <p className="text-xs text-text-muted mb-1.5">{label}</p>
                    {/* Badge premium fait main */}
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold mono border ${style}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Checklist preview */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
                  Checklist ({rules.checklistItems.length} items)
                </p>
                <div className="space-y-1.5">
                  {rules.checklistItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <div className="w-1 h-1 rounded-full bg-neon-blue flex-shrink-0" />
                      {item.label}
                    </div>
                  ))}
                  {rules.checklistItems.length > 3 && (
                    <p className="text-xs text-text-muted mono mt-2">
                      +{rules.checklistItems.length - 3} autres étapes...
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}