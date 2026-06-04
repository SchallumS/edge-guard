// ─── COURBE DE CAPITAL (EQUITY CURVE) ────────────────────────────────────────
"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { EquityPoint, AssetStat } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

// ── Tooltip personnalisé pour l'equity curve ──────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const capital = payload[0]?.value;
  return (
    <div className="bg-bg-card border border-border rounded-lg px-4 py-3 shadow-card">
      <p className="text-text-muted text-xs mono mb-1">{label}</p>
      <p className="text-text-primary font-bold mono text-sm">
        {formatCurrency(capital || 0)}
      </p>
    </div>
  );
};

// ── Composant Equity Curve ────────────────────────────────────────────────
interface EquityCurveProps {
  data: EquityPoint[];
  initialCapital: number;
}

export const EquityCurveChart: React.FC<EquityCurveProps> = ({
  data,
  initialCapital,
}) => {
  const isEmpty = data.length <= 1;
  const lastCapital = data[data.length - 1]?.capital || initialCapital;
  const pnlTotal = lastCapital - initialCapital;
  const isPositive = pnlTotal >= 0;

  // Couleur dynamique selon la performance
  const lineColor = isPositive ? "#00E676" : "#FF5252";
  const gradientId = isPositive ? "gradientGreen" : "gradientRed";
  const gradientStart = isPositive ? "#00E67630" : "#FF525230";
  const gradientEnd = isPositive ? "#00E67605" : "#FF525205";

  if (isEmpty) {
    return (
      <div className="h-48 flex items-center justify-center text-text-muted text-sm">
        <div className="text-center">
          <p className="text-2xl mb-2">📈</p>
          <p>Aucun trade clôturé pour le moment</p>
          <p className="text-xs mono mt-1">Enregistrez vos trades pour voir la courbe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientStart} />
              <stop offset="95%" stopColor={gradientEnd} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="#21262D"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#8B949E", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#8B949E", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="capital"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 5, fill: lineColor, stroke: "#0D1117", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Win Rate (Pie Chart) ──────────────────────────────────────────────────
interface WinRateChartProps {
  wins: number;
  losses: number;
  breakevens: number;
}

const WIN_RATE_COLORS = ["#00E676", "#FF5252", "#F0C040"];

const WinRateLegend = (props: { payload?: Array<{ color: string; value: string }> }) => {
  if (!props.payload) return null;
  return (
    <div className="flex justify-center gap-4 mt-2">
      {props.payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-text-secondary mono">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const WinRateChart: React.FC<WinRateChartProps> = ({
  wins,
  losses,
  breakevens,
}) => {
  const total = wins + losses + breakevens;
  const data = [
    { name: `Gains (${wins})`, value: wins },
    { name: `Pertes (${losses})`, value: losses },
    ...(breakevens > 0 ? [{ name: `Flat (${breakevens})`, value: breakevens }] : []),
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-text-muted text-sm">
        Aucun trade clôturé
      </div>
    );
  }

  return (
    <div className="h-40 sm:h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={WIN_RATE_COLORS[index % WIN_RATE_COLORS.length]}
              />
            ))}
          </Pie>
          <Legend content={<WinRateLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Répartition par actif (Pie Chart) ────────────────────────────────────
interface AssetChartProps {
  data: AssetStat[];
}

const ASSET_COLORS = [
  "#388BFD", "#00E676", "#F0C040", "#FF5252",
  "#A371F7", "#3FB950", "#D29922", "#F85149",
];

export const AssetDistributionChart: React.FC<AssetChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="h-40 flex items-center justify-center text-text-muted text-sm">
        Aucune donnée
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.asset, value: d.count }));

  return (
    <div className="h-40 sm:h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={ASSET_COLORS[index % ASSET_COLORS.length]}
              />
            ))}
          </Pie>
          <Legend content={<WinRateLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};