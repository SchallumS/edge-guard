// ─── TYPES GLOBAUX — Trading Journal ─────────────────────────────────────────

// ── Utilisateur ────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// ── Règles de discipline ────────────────────────────────────────────────────
export interface TradingRules {
  maxTradesPerDay: number;       // Nb max de trades par jour
  maxRiskPerTrade: number;       // % de risque max par trade (ex: 1.5)
  maxDailyDrawdown: number;      // % de drawdown journalier max (ex: 3)
  initialCapital: number;        // Capital de départ en $
  checklistItems: ChecklistItem[]; // Étapes de la stratégie
}

// ── Étape de la check-list ─────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  label: string;
  isRequired: boolean;
}

// ── Session de trade (avant-trade) ────────────────────────────────────────
export interface TradeSession {
  id: string;
  date: string;                  // ISO string
  asset: string;                 // Ex: "BTC/USDT", "EUR/USD"
  direction: "LONG" | "SHORT";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;          // En % du capital ou en unités
  riskAmount: number;            // Risque calculé en $
  riskPercent: number;           // Risque calculé en %
  notes: string;
  checklistCompleted: string[];  // IDs des items cochés
  allChecklistPassed: boolean;   // true si 100% de la checklist cochée
  status: "pending" | "open" | "win" | "loss" | "breakeven";
  pnl?: number;                  // P&L en $ (après clôture)
  pnlPercent?: number;           // P&L en % (après clôture)
}

// ── Données du calendrier ──────────────────────────────────────────────────
export interface CalendarDay {
  date: string;                  // YYYY-MM-DD
  trades: TradeSession[];
  dailyPnl: number;
  isGreen: boolean;              // Jour positif
  isRed: boolean;                // Jour négatif
  hasNoTrade: boolean;           // Aucun trade
  checklistPerfect: boolean;     // 100% checklist sur tous les trades
}

// ── Stats globales ─────────────────────────────────────────────────────────
export interface TradingStats {
  totalTrades: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;               // %
  totalPnl: number;              // $
  totalPnlPercent: number;       // % vs capital initial
  averageWin: number;            // $ moyen sur les trades gagnants
  averageLoss: number;           // $ moyen sur les trades perdants
  profitFactor: number;
  currentCapital: number;        // Capital actuel
  equityCurve: EquityPoint[];    // Courbe de capital
  assetDistribution: AssetStat[]; // Répartition par actif
}

// ── Point de la courbe de capital ─────────────────────────────────────────
export interface EquityPoint {
  date: string;
  capital: number;
  pnl: number;
}

// ── Stats par actif ────────────────────────────────────────────────────────
export interface AssetStat {
  asset: string;
  count: number;
  pnl: number;
}

// ── Alertes de validation ─────────────────────────────────────────────────
export type AlertType = "risk_exceeded" | "trades_exceeded" | "drawdown_exceeded";

export interface TradeAlert {
  type: AlertType;
  message: string;
  severity: "warning" | "danger";
}