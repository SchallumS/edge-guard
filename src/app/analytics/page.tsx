// ─── PAGE ANALYSES & GRAPHIQUES ───────────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Target, Zap, Award } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import {
  EquityCurveChart,
  WinRateChart,
  AssetDistributionChart,
} from "@/components/features/EquityCurve";
import api from "@/lib/api"; // 💡 Import de notre client API
import { computeStats, formatCurrency, formatPercent } from "@/lib/utils";
import { TradingStats } from "@/lib/types";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<TradingStats | null>(null);

  // 💡 Récupération des données depuis le backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // On lance les deux requêtes en parallèle pour aller plus vite
        const [rulesRes, tradesRes] = await Promise.all([
          api.get("/rules"),
          api.get("/trades")
        ]);

        const rules = rulesRes.data.data;
        const trades = tradesRes.data.data;

        // On réutilise ta fonction utilitaire qui marche parfaitement
        setStats(computeStats(trades, rules.initialCapital));
      } catch (error) {
        console.error("Erreur lors du chargement des analyses:", error);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (!stats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Sécuriser l'espérance contre la division par zéro
  const completedTrades = stats.wins + stats.losses;
  const expectancy =
    completedTrades > 0 ? stats.totalPnl / completedTrades : 0;

  // Cartes de métriques avancées
  const metricsCards = [
    {
      title: "Capital Actuel",
      value: formatCurrency(stats.currentCapital),
      sub: formatPercent(stats.totalPnlPercent) + " vs. départ",
      icon: TrendingUp,
      color: stats.totalPnlPercent >= 0 ? "text-neon-green" : "text-neon-red",
    },
    {
      title: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      sub: `${stats.wins}G / ${stats.losses}P / ${stats.breakevens}F`,
      icon: Target,
      color:
        stats.winRate >= 55
          ? "text-neon-green"
          : stats.winRate >= 45
          ? "text-neon-yellow"
          : "text-neon-red",
    },
    {
      title: "Profit Factor",
      value:
        stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2),
      sub: `Gain moy: ${formatCurrency(stats.averageWin)}`,
      icon: Zap,
      color:
        stats.profitFactor >= 1.5
          ? "text-neon-green"
          : stats.profitFactor >= 1
          ? "text-neon-yellow"
          : "text-neon-red",
    },
    {
      title: "Espérance",
      value: formatCurrency(expectancy),
      sub: `Moy. P&L par trade clos`,
      icon: Award,
      color: expectancy >= 0 ? "text-neon-green" : "text-neon-red",
    },
  ] as const;

  const isEmpty = stats.totalTrades === 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── En-tête ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Analyses</h2>
            <p className="text-text-secondary text-sm">
              Performance globale — données calculées en temps réel
            </p>
          </div>
          {/* LE BADGE P&L A ETE SUPPRIME ICI POUR EVITER LE DOUBLON AVEC LA TOPBAR */}
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsCards.map(({ title, value, sub, icon: Icon, color }) => (
            <Card key={title} className="relative">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {title}
                </p>
                <Icon size={16} className={color} />
              </div>
              <p className={`text-2xl font-bold mono ${color}`}>{value}</p>
              <p className="text-xs text-text-muted mono mt-1">{sub}</p>
            </Card>
          ))}
        </div>

        {/* ── Equity Curve ─────────────────────────────────────────── */}
        <Card
          title="Courbe de Capital (Equity Curve)"
          subtitle="Évolution du capital au fil des trades"
          headerRight={
            <div className="flex items-center gap-2 text-xs mono text-text-muted">
              <span
                className={
                  stats.totalPnl >= 0 ? "text-neon-green" : "text-neon-red"
                }
              >
                {stats.totalPnl >= 0 ? "▲" : "▼"}{" "}
                {formatPercent(stats.totalPnlPercent)}
              </span>
            </div>
          }
        >
          <EquityCurveChart
            data={stats.equityCurve}
            initialCapital={stats.currentCapital - stats.totalPnl}
          />
        </Card>

        {/* ── Pie Charts ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Win Rate */}
          <Card
            title="Répartition Résultats"
            subtitle="Gains vs Pertes vs Flat"
          >
            <WinRateChart
              wins={stats.wins}
              losses={stats.losses}
              breakevens={stats.breakevens}
            />
            {!isEmpty && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Gains", value: stats.wins, color: "text-neon-green" },
                  { label: "Pertes", value: stats.losses, color: "text-neon-red" },
                  { label: "Flat", value: stats.breakevens, color: "text-neon-yellow" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-bg-elevated border border-border rounded-lg py-2"
                  >
                    <p className={`text-lg font-bold mono ${color}`}>{value}</p>
                    <p className="text-xs text-text-muted">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Répartition par actif */}
          <Card
            title="Répartition par Actif"
            subtitle="Nombre de trades par instrument"
          >
            <AssetDistributionChart data={stats.assetDistribution} />
            {stats.assetDistribution.length > 0 && (
              <div className="mt-4 space-y-2">
                {stats.assetDistribution
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 4)
                  .map((asset, i) => (
                    <div
                      key={asset.asset}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs mono text-text-muted w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm text-text-primary font-medium flex-1">
                        {asset.asset}
                      </span>
                      <span className="text-xs mono text-text-secondary">
                        {asset.count}t
                      </span>
                      <span
                        className={`text-xs mono font-bold ${
                          asset.pnl >= 0 ? "text-neon-green" : "text-neon-red"
                        }`.trim()}
                      >
                        {asset.pnl > 0 ? "+" : ""}
                        {formatCurrency(asset.pnl)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Tableau récapitulatif avancé ──────────────────────────── */}
        <Card title="Métriques Avancées" subtitle="Données détaillées de performance">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Total trades",
                value: String(stats.totalTrades),
                color: "text-text-primary",
              },
              {
                label: "Gain moyen",
                value: formatCurrency(stats.averageWin),
                color: "text-neon-green",
              },
              {
                label: "Perte moyenne",
                value: formatCurrency(stats.averageLoss),
                color: "text-neon-red",
              },
              {
                label: "Profit Factor",
                value:
                  stats.profitFactor === Infinity
                    ? "∞"
                    : stats.profitFactor.toFixed(2),
                color:
                  stats.profitFactor >= 1.5
                    ? "text-neon-green"
                    : "text-neon-yellow",
              },
              {
                label: "P&L total",
                value: formatCurrency(stats.totalPnl),
                color: stats.totalPnl >= 0 ? "text-neon-green" : "text-neon-red",
              },
              {
                label: "P&L %",
                value: formatPercent(stats.totalPnlPercent),
                color:
                  stats.totalPnlPercent >= 0
                    ? "text-neon-green"
                    : "text-neon-red",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-bg-elevated border border-border rounded-lg p-4 text-center"
              >
                <p className="text-xs text-text-muted mb-2">{label}</p>
                <p className={`text-base font-bold mono ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Message si aucun trade ─────────────────────────────────── */}
        {isEmpty && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-4xl mb-4">🚀</p>
            <p className="text-lg font-medium text-text-primary mb-2">
              Prêt à démarrer le défi ?
            </p>
            <p className="text-sm">
              Enregistrez votre premier trade via le module{" "}
              <span className="text-neon-blue font-medium">Avant-Trade</span> pour
              voir vos statistiques apparaître ici.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}