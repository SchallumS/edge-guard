// ─── HOOK DE GESTION DES TRADES ───────────────────────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import { TradeSession } from "../types";
import api from "../api"; // 💡 Import de l'API Axios (ajuste le chemin si nécessaire)

// Helper pour sécuriser le fuseau horaire
function getLocalDateString(): string {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

export function useTrades() {
  const [trades, setTrades] = useState<TradeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 Charger les trades depuis la base de données au montage
  const fetchTrades = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/trades");
      setTrades(res.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des trades :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // 💡 Ajouter un trade via l'API
  const addTrade = useCallback(async (trade: Omit<TradeSession, "id" | "_id">) => {
    try {
      const res = await api.post("/trades", trade);
      // On met à jour l'état local avec le trade renvoyé par le backend (qui contient le vrai _id)
      setTrades((prev) => [...prev, res.data.data]);
      return res.data.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du trade :", error);
      throw error;
    }
  }, []);

  // 💡 Mettre à jour un trade via l'API
  const updateTrade = useCallback(
    async (tradeId: string, updates: Partial<TradeSession>) => {
      try {
        const res = await api.put(`/trades/${tradeId}`, updates);
        setTrades((prev) =>
          prev.map((t) =>
            // On gère la compatibilité _id (MongoDB) et id (Local)
            (t as any)._id === tradeId || t.id === tradeId ? res.data.data : t
          )
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour du trade :", error);
        throw error;
      }
    },
    []
  );

  // 💡 Supprimer un trade via l'API
  const deleteTrade = useCallback(async (tradeId: string) => {
    try {
      await api.delete(`/trades/${tradeId}`);
      setTrades((prev) =>
        prev.filter((t) => (t as any)._id !== tradeId && t.id !== tradeId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du trade :", error);
      throw error;
    }
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

  return { 
    trades, 
    isLoading, 
    addTrade, 
    updateTrade, 
    deleteTrade, 
    todayCount, 
    todayPnl,
    refreshTrades: fetchTrades // Exposé si besoin de forcer un rafraîchissement
  };
}