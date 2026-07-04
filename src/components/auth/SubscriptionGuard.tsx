"use client";

import React from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Lock, CreditCard } from "lucide-react";
import Link from "next/link";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Si le profil n'est pas encore chargé, on laisse passer (le squelette de chargement principal gère le reste)
  if (!user) return <>{children}</>;

  const userFields = user as any;
  const currentPlan = userFields.plan || "trial";
  const tradesUsed = userFields.trialTradesCount || 0;
  
  // 1. Vérification de l'expiration de l'essai (Date)
  let isTrialExpired = false;
  if (userFields.trialEndDate) {
    isTrialExpired = new Date() > new Date(userFields.trialEndDate);
  }

  // 2. Vérification de la limite de trades (10 max)
  const isTradesLimitReached = tradesUsed >= 10;

  // 3. Condition de blocage global (Essai expiré OR Quota atteint OR Abonnement payant expiré)
  const isBlocked = 
    (currentPlan === "trial" && (isTrialExpired || isTradesLimitReached)) || 
    currentPlan === "expired"; // Statut à appliquer si un abonnement mensuel/annuel prend fin

  return (
    <div className="relative min-h-screen">
      {/* 💡 EFFET FLOU ET INACCESSIBLE EN UN CLIN D'ŒIL */}
      <div 
        className={`transition-all duration-500 ${
          isBlocked 
            ? "blur-md pointer-events-none select-none filter brightness-[0.4]" 
            : ""
        }`}
      >
        {children}
      </div>

      {/* 🔒 LE PAYWALL OVERLAY INDÉBOULONNABLE */}
      {isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/20 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-elevated border border-border max-w-md w-full rounded-2xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="w-16 h-16 bg-neon-red/10 border border-neon-red/30 rounded-full flex items-center justify-center mx-auto text-neon-red shadow-[0_0_15px_rgba(255,0,0,0.1)]">
              <Lock size={28} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary">
                {currentPlan === "expired" ? "Abonnement Terminé" : "Période d'essai terminée"}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {isTradesLimitReached && currentPlan === "trial"
                  ? "Vous avez utilisé vos 10 trades gratuits disponibles durant la période d'essai."
                  : "Votre accès est suspendu. Activez un plan définitif pour déverrouiller votre Garde-Fou et reprendre le contrôle de votre capital."}
              </p>
            </div>

            {/* Récapitulatif rapide */}
            <div className="bg-bg-primary/50 border border-border rounded-xl p-3 text-xs mono text-text-muted flex justify-around">
              <div>Plan : <span className="text-text-primary uppercase font-bold">{currentPlan}</span></div>
              <div>Trades : <span className="text-text-primary font-bold">{tradesUsed}/10</span></div>
            </div>

            <Link
              href="/abonnement"
              className="w-full py-4 bg-neon-blue hover:bg-neon-blue/90 text-bg-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 group pointer-events-auto"
            >
              <CreditCard size={18} />
              Voir les offres d'abonnement
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}