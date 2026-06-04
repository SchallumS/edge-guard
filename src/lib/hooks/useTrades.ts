// ─── HOOK DE GESTION DES TRADES ───────────────────────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import { TradeSession } from "../types";
import { tradesStorage } from "../storage";

// Helper pour sécuriser le fuseau horaire (comme dans storage.ts)
function getLocalDateString(): string {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

export function useTrades() {
  const [trades, setTrades] = useState<TradeSession[]>([]);

  // Charger les trades au montage
  useEffect(() => {
    setTrades(tradesStorage.getAll());
  }, []);

  const addTrade = useCallback((trade: TradeSession) => {
    tradesStorage.add(trade);
    setTrades(tradesStorage.getAll());
  }, []);

  const updateTrade = useCallback(
    (tradeId: string, updates: Partial<TradeSession>) => {
      tradesStorage.update(tradeId, updates);
      setTrades(tradesStorage.getAll());
    },
    []
  );

  const deleteTrade = useCallback((tradeId: string) => {
    tradesStorage.delete(tradeId);
    setTrades(tradesStorage.getAll());
  }, []);

  // Récupération de la date locale pour éviter les bugs de minuit
  const today = getLocalDateString();

  const todayCount = trades.filter((t) =>
    t.date.startsWith(today)
  ).length;

  const todayPnl = trades
    .filter(
      (t) =>
        t.date.startsWith(today) &&
        t.status !== "pending" &&
        t.status !== "open"
    )
    .reduce((sum, t) => sum + (t.pnl || 0), 0);

  return { trades, addTrade, updateTrade, deleteTrade, todayCount, todayPnl };
}