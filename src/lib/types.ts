// ─── TYPES GLOBAUX — Trading Journal ─────────────────────────────────────────

// ── Utilisateur ────────────────────────────────────────────────────────────
export interface User {
  _id?: string;                  // 💡 ID généré par MongoDB
  id?: string;                   // Maintenu pour la compatibilité
  email: string;
  name: string;
  createdAt?: string;
}

// ── Règles de discipline ────────────────────────────────────────────────────
export interface TradingRules {
  _id?: string;                  // 💡 ID MongoDB
  userId?: string;               // Lien avec l'utilisateur
  maxTradesPerDay: number;       // Nb max de trades par jour
  maxRiskPerTrade: number;       // % de risque max par trade (ex: 1.5)
  maxDailyDrawdown: number;      // % de drawdown journalier max (ex: 3)
  initialCapital: number;        // Capital de départ en $
  checklistItems: ChecklistItem[]; // Étapes de la stratégie
  customAssets?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Étape de la check-list ─────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;                    // Gardé en 'id' normal car généré en local (generateId)
  label: string;
  isRequired: boolean;
}

// ── Session de trade (avant-trade) ────────────────────────────────────────
export interface TradeSession {
  _id?: string;                  // 💡 ID MongoDB
  id?: string;                   // Maintenu pour la compatibilité
  userId?: string;               // Lien avec le trader
  date: string;                  // ISO string
  closeDate?: string;
  asset: string;                 // Ex: "BTC/USDT", "EUR/USD"
  direction: "LONG" | "SHORT";
  entryPrice?: number;           // Optionnel depuis la simplification du formulaire
  stopLoss?: number;             // Optionnel
  takeProfit?: number;           // Optionnel
  positionSize?: number;         // Optionnel
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