// ─── CLIENT API FRONTEND (Axios avec Cookies HttpOnly) ────────────────────────
import axios from "axios";

// 1. Création de l'instance de base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // 💡 Indispensable pour envoyer automatiquement les cookies HttpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Intercepteur de RÉPONSE : Gérer l'expiration, le Refresh Token et les boucles 401
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // CAS A : Le token est expiré, on tente un REFRESH AUTOMATIQUE
    if (
      error.response?.status === 401 && 
      error.response?.data?.code === "TOKEN_EXPIRED" && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Appel direct à axios (sans l'instance 'api') pour rafraîchir
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {}, 
          { withCredentials: true } 
        );

        // Si le refresh fonctionne, on relance la requête originale avec les nouveaux cookies
        return api(originalRequest);
        
      } catch (refreshError) {
        // Si le refresh token est mort ou révoqué, déconnexion forcée et nettoyage global
        if (typeof window !== "undefined") {
          localStorage.clear(); // Supprime le cache local ("user", etc.) qui trompe le frontend
          window.location.href = "/login"; 
        }
        return Promise.reject(refreshError);
      }
    }

    // 💡 CAS B : SÉCURITÉ ANTI-BOUCLE
    if (
      error.response?.status === 401 && 
      typeof window !== "undefined" && 
      window.location.pathname !== "/login"
    ) {
      console.warn("Session invalide ou expirée détectée. Nettoyage et redirection...");
      localStorage.clear(); // Élimine l'illusion de connexion côté client
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;