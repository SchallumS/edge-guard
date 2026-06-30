// ─── CLIENT API FRONTEND (Axios avec Cookies HttpOnly) ────────────────────────
import axios from "axios";

// 1. Création de l'instance de base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // 💡 LA MAGIE EST ICI : Le navigateur envoie auto les cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// 🗑️ PLUS D'INTERCEPTEUR DE REQUÊTE ! 
// Axios n'a plus besoin d'ajouter manuellement "Authorization: Bearer..." 
// Le cookie est attaché nativement par le navigateur.

// 2. Intercepteur de RÉPONSE : Gérer l'expiration et le Refresh Token
api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // Si le token est expiré et qu'on n'a pas encore réessayé
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
          {}, // 💡 Plus besoin d'envoyer le refreshToken dans le body !
          { withCredentials: true } // 💡 Important : autorise l'envoi du cookie pour ce post
        );

        // 💡 Plus besoin de setItem dans le localStorage ! 
        // Le backend a renvoyé les nouveaux cookies, le navigateur a mis à jour son coffre.
        
        // On relance la requête originale (qui utilisera le nouveau cookie auto)
        return api(originalRequest);
        
      } catch (refreshError) {
        // Si le refresh token est mort/révoqué, déconnexion forcée
        if (typeof window !== "undefined") {
          window.location.href = "/login"; 
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;