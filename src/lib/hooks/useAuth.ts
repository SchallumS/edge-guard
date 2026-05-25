// ─── HOOK D'AUTHENTIFICATION ──────────────────────────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "../types";
import { authStorage } from "../storage";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier la session au montage
    const storedUser = authStorage.getUser();
    const isAuth = authStorage.isAuthenticated();
    if (isAuth && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const loggedUser = authStorage.login(email, password);
      if (loggedUser) {
        setUser(loggedUser);
        router.push("/dashboard");
        return { success: true };
      }
      return { success: false, error: "Email ou mot de passe incorrect." };
    },
    [router]
  );

  const register = useCallback(
    (
      name: string,
      email: string,
      password: string
    ): { success: boolean; error?: string } => {
      // Sécurisation SSR pour éviter le crash côté serveur
      if (typeof window === "undefined") {
        return { success: false, error: "Erreur d'environnement." };
      }

      // Vérifier si l'email existe déjà dans la base locale
      const users = JSON.parse(
        localStorage.getItem("tj_users_db") || "{}"
      ) as Record<string, unknown>;
      
      if (users[email]) {
        return { success: false, error: "Cet email est déjà utilisé." };
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
      };
      
      authStorage.register(newUser, password);
      
      // Connecter directement après inscription
      authStorage.login(email, password);
      setUser(newUser);
      router.push("/dashboard");
      return { success: true };
    },
    [router]
  );

  const logout = useCallback(() => {
    authStorage.logout();
    setUser(null);
    // Assure-toi que la route correspond bien à ta page de login (ex: "/login" ou "/")
    router.push("/login"); 
  }, [router]);

  return { user, loading, login, register, logout };
}