// ─── LAYOUT PRINCIPAL DE L'APP (avec sidebar) ─────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard"; // 💡 IMPORT DU GUARD

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 🗑️ SUPPRESSION DE LA VÉRIFICATION LOCALSTORAGE : 
    // La redirection vers /login est maintenant gérée intelligemment 
    // par l'intercepteur Axios (api.ts) grâce aux cookies HttpOnly.
  }, []);

  // Fermer la sidebar lors d'un changement de route (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 💡 On identifie si l'utilisateur est sur la page de paiement
  const isAbonnementPage = pathname === "/abonnement";

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Overlay mobile pour la sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 overflow-hidden relative">
        {/* Barre du haut */}
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 animate-fade-in relative">
          {/* 💡 INJECTION DU VERROUILLAGE D'ABONNEMENT */}
          {isAbonnementPage ? (
            children // On laisse l'accès libre à la page de paiement
          ) : (
            <SubscriptionGuard>
              {children}
            </SubscriptionGuard>
          )}
        </main>
      </div>
    </div>
  );
};