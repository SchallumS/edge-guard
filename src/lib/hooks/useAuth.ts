// ─── HOOK D'AUTHENTIFICATION ──────────────────────────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "../types";
import api from "../api"; // 💡 Ajuste le chemin vers ton fichier api.ts si nécessaire (ex: "@/lib/api")

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 💡 Vérifier la session dans le localStorage au montage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Erreur de parsing de l'utilisateur", e);
        }
      }
    }
    setLoading(false);
  }, []);

  // 💡 Les fonctions deviennent "async" pour attendre la réponse de l'API
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await api.post("/auth/login", { email, password });
        const { accessToken, refreshToken, user } = res.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        router.push("/dashboard");
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.message || "Email ou mot de passe incorrect." 
        };
      }
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await api.post("/auth/register", { name, email, password });
        const { accessToken, refreshToken, user } = res.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        router.push("/dashboard");
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.message || "Erreur lors de l'inscription." 
        };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      // 💡 On prévient le backend de révoquer le Refresh Token pour sécuriser le compte
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion API", error);
    } finally {
      // Quoi qu'il arrive, on nettoie le navigateur
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login"); 
    }
  }, [router]);

  return { user, loading, login, register, logout };
}