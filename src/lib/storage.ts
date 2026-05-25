// ─── COUCHE DE PERSISTANCE localStorage ─────────────────────────────────────
// Simule un backend — remplacer par des appels API (Supabase/Firebase) en production

import { User, TradingRules, TradeSession } from "./types";

// ── Clés de stockage ───────────────────────────────────────────────────────
const KEYS = {
  USER: "tj_user",
  RULES: "tj_rules",
  TRADES: "tj_trades",
  AUTH_TOKEN: "tj_auth",
} as const;

// ── Helpers génériques ─────────────────────────────────────────────────────
function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// Helper pour obtenir la date locale au format YYYY-MM-DD (évite les bugs UTC)
function getLocalDateString(): string {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

// ── Authentification ───────────────────────────────────────────────────────
export const authStorage = {
  // Enregistrer un utilisateur (simule un register)
  // ⚠️ Note: Stockage en clair = Uniquement pour le dev/MVP
  register(user: User, password: string): void {
    const users = getItem<Record<string, { user: User; password: string }>>(
      "tj_users_db"
    ) || {};
    users[user.email] = { user, password };
    setItem("tj_users_db", users);
  },

  // Connecter un utilisateur (simule un login)
  login(email: string, password: string): User | null {
    const users = getItem<Record<string, { user: User; password: string }>>(
      "tj_users_db"
    ) || {};
    const entry = users[email];
    if (!entry || entry.password !== password) return null;
    setItem(KEYS.USER, entry.user);
    setItem(KEYS.AUTH_TOKEN, `fake_token_${Date.now()}`);
    return entry.user;
  },

  // Récupérer l'utilisateur connecté
  getUser(): User | null {
    return getItem<User>(KEYS.USER);
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!getItem(KEYS.AUTH_TOKEN);
  },

  // Déconnexion
  logout(): void {
    removeItem(KEYS.USER);
    removeItem(KEYS.AUTH_TOKEN);
  },
};

// ── Règles de trading ──────────────────────────────────────────────────────
export const rulesStorage = {
  // Règles par défaut sécurisées
  getDefaults(): TradingRules {
    return {
      maxTradesPerDay: 3,
      maxRiskPerTrade: 1,
      maxDailyDrawdown: 3,
      initialCapital: 10000,
      checklistItems: [
        { id: "cl_1", label: "Tendance confirmée (HTF)", isRequired: true },
        { id: "cl_2", label: "Zone de support/résistance identifiée", isRequired: true },
        { id: "cl_3", label: "Ratio R/R ≥ 2:1", isRequired: true },
        { id: "cl_4", label: "Volume et liquidité vérifiés", isRequired: true },
        { id: "cl_5", label: "Pas de news majeure dans les 30min", isRequired: true },
      ],
    };
  },

  get(): TradingRules {
    return getItem<TradingRules>(KEYS.RULES) || rulesStorage.getDefaults();
  },

  save(rules: TradingRules): void {
    setItem(KEYS.RULES, rules);
  },
};

// ── Sessions de trades ─────────────────────────────────────────────────────
export const tradesStorage = {
  getAll(): TradeSession[] {
    return getItem<TradeSession[]>(KEYS.TRADES) || [];
  },

  getByDate(dateStr: string): TradeSession[] {
    return tradesStorage
      .getAll()
      .filter((t) => t.date.startsWith(dateStr));
  },

  add(trade: TradeSession): void {
    const trades = tradesStorage.getAll();
    trades.push(trade);
    setItem(KEYS.TRADES, trades);
  },

  update(tradeId: string, updates: Partial<TradeSession>): void {
    const trades = tradesStorage.getAll().map((t) =>
      t.id === tradeId ? { ...t, ...updates } : t
    );
    setItem(KEYS.TRADES, trades);
  },

  delete(tradeId: string): void {
    const trades = tradesStorage.getAll().filter((t) => t.id !== tradeId);
    setItem(KEYS.TRADES, trades);
  },

  // Compter les trades du jour (Correction Timezone appliquée)
  countToday(): number {
    const today = getLocalDateString();
    return tradesStorage.getByDate(today).length;
  },

  // Calculer le P&L du jour (Correction Timezone appliquée)
  getDailyPnl(dateStr?: string): number {
    const date = dateStr || getLocalDateString();
    return tradesStorage
      .getByDate(date)
      .filter((t) => t.status !== "pending" && t.status !== "open")
      .reduce((sum, t) => sum + (t.pnl || 0), 0);
  },
};