// ─── src/app/abonnement/page.tsx ──────────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { CreditCard, Check, Shield, Zap, Clock, AlertTriangle, Activity, Image as ImageIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/hooks/useAuth";

declare global {
  interface Window {
    openKkiapayWidget: (config: any) => void;
  }
}

export default function AbonnementPage() {
  // 💡 CORRECTION ICI : On utilise "as any" pour forcer TypeScript à ignorer l'erreur
  // sur la fonction refreshProfile qui n'est pas encore déclarée dans ton interface.
  const { user, refreshProfile } = useAuth() as any;
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // ── ÉCOUTEUR D'ÉVÉNEMENT KKIAPAY (Rafraîchissement auto sans F5) ────────
  useEffect(() => {
    const handleKkiapayMessage = (event: MessageEvent) => {
      // Vérifier le message de succès envoyé par l'iframe KKiaPay
      if (event.data && event.data.name === "PAYMENT_SUCCESS") {
        console.log("Paiement détecté côté Frontend ! Mise à jour du profil...");
        
        // On donne 1.5s au webhook backend pour mettre à jour la base de données
        setTimeout(async () => {
          if (typeof refreshProfile === 'function') {
            await refreshProfile();
          }
          setLoadingPlan(null);
        }, 1500); 
      }
    };

    window.addEventListener("message", handleKkiapayMessage);
    return () => window.removeEventListener("message", handleKkiapayMessage);
  }, [refreshProfile]);


  // ── VALEURS DYNAMIQUES AVEC PROTECTION TYPES ──────────────────────────
  const userFields = (user || {}) as any;
  
  const currentPlan = userFields.plan || "trial";
  const totalTradesAllowed = 10;
  const tradesUsed = userFields.trialTradesCount || 0;
  const tradesLeft = Math.max(0, totalTradesAllowed - tradesUsed);

  // Calcul dynamique des jours restants
  let daysLeft = 0;
  if (userFields.trialEndDate) {
    const end = new Date(userFields.trialEndDate).getTime();
    const now = new Date().getTime();
    const diffTime = end - now;
    daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Conditions d'urgence
  const isUrgent = currentPlan === "trial" && (daysLeft <= 5 || tradesLeft <= 2);

  // ── LOGIQUE DE PAIEMENT KKIAPAY ─────────────────────────────────────────
  const handlePayment = (plan: "monthly" | "annual") => {
    setLoadingPlan(plan);
    
    // Montants en FCFA (Ex: 15.99$ = ~10000 FCFA, 159.99$ = ~100000 FCFA)
    const amount = plan === "monthly" ? 10000 : 100000; 

    if (typeof window !== "undefined" && window.openKkiapayWidget) {
      window.openKkiapayWidget({
        amount: amount,
        position: "center",
        callback: "", // Le webhook backend gère la validation
        data: `Abonnement EdgeGuard - ${plan}`,
        theme: "#00FF80",
        key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
        sandbox: true,
        email: user?.email || "",
        name: user?.name || "",
        partnerId: user?.id,
      });
      
      // On ne retire pas le loading tout de suite, l'écouteur s'en chargera au succès.
    } else {
      alert("Le widget de paiement est en cours de chargement, veuillez patienter.");
      setLoadingPlan(null);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Script 
        src="https://cdn.kkiapay.me/k.js" 
        strategy="lazyOnload"
      />

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 animate-fade-in">
        
        {/* ── En-tête ── */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <CreditCard className="text-neon-blue" size={32} />
            Mon Abonnement
          </h1>
          <p className="text-text-secondary mt-2">
            Gérez votre accès à EdgeGuard, consultez votre statut et protégez votre capital.
          </p>
        </div>

        {/* ── Statut Actuel ── */}
        <div className={`bg-bg-elevated border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${isUrgent ? 'border-neon-yellow/50 shadow-[0_0_15px_rgba(255,234,0,0.1)]' : 'border-border'}`}>
          <div className="flex items-center gap-4">
            {currentPlan === "trial" ? (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isUrgent ? 'bg-neon-yellow/20 border-neon-yellow/50' : 'bg-neon-blue/20 border-neon-blue/30'}`}>
                <Clock className={isUrgent ? "text-neon-yellow" : "text-neon-blue"} size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center border border-neon-green/30">
                <Shield className="text-neon-green" size={24} />
              </div>
            )}
            
            <div>
              <p className="text-sm text-text-muted mb-1">Plan actuel</p>
              <h2 className="text-xl font-bold text-text-primary capitalize">
                {currentPlan === "trial" && "Période d'essai gratuit"}
                {currentPlan === "monthly" && "Abonnement Mensuel"}
                {currentPlan === "annual" && "Abonnement Annuel Premium"}
              </h2>
            </div>
          </div>

          {currentPlan === "trial" && (
            <div className="flex items-center gap-6 md:border-l md:border-border md:pl-6">
              <div className="text-center">
                <p className={`text-2xl font-bold mono ${isUrgent && daysLeft <= 5 ? "text-neon-yellow" : "text-text-primary"}`}>
                  {daysLeft}
                </p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Jours restants</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold mono ${isUrgent && tradesLeft <= 2 ? "text-neon-yellow" : "text-text-primary"}`}>
                  {tradesLeft} <span className="text-sm text-text-muted">/ {totalTradesAllowed}</span>
                </p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Trades restants</p>
              </div>
            </div>
          )}

          {currentPlan !== "trial" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-full text-neon-green text-sm font-semibold">
              <Check size={14} /> Actif
            </span>
          )}
        </div>

        {/* ── Alerte Dynamique ── */}
        {currentPlan === "trial" && isUrgent && (
          <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-xl p-4 flex gap-3 text-sm text-text-primary animate-pulse-slow">
            <AlertTriangle className="text-neon-yellow flex-shrink-0" size={20} />
            <div>
              <strong className="text-neon-yellow block mb-1">Attention, votre essai touche à sa fin !</strong>
              <p className="text-text-secondary">
                {tradesLeft === 0 
                  ? "Vous avez atteint votre limite de 10 trades gratuits." 
                  : daysLeft === 0 
                    ? "Votre période d'essai de 28 jours est expirée."
                    : "Il ne vous reste que peu de temps ou de trades pour tester le Garde-Fou."
                } Mettez à niveau votre compte dès maintenant.
              </p>
            </div>
          </div>
        )}
        
        {currentPlan === "trial" && !isUrgent && (
           <div className="bg-bg-elevated border border-border rounded-xl p-4 flex gap-3 text-sm text-text-secondary">
             <Activity className="text-neon-blue flex-shrink-0" size={20} />
             <p>Explorez toutes les fonctionnalités d'EdgeGuard. Votre essai est limité à 28 jours ou 10 trades validés.</p>
           </div>
        )}

        {/* ── Grille des Offres ── */}
        <h3 className="text-xl font-bold text-text-primary mt-12 mb-6 border-b border-border pb-4">
          Choisir un plan définitif
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* CARTE MENSUELLE */}
          <div className={`bg-bg-elevated border rounded-2xl p-8 flex flex-col transition-all ${currentPlan === 'monthly' ? 'border-neon-blue shadow-[0_0_20px_rgba(0,112,243,0.1)]' : 'border-border hover:border-border-active'}`}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">Mensuel</h3>
            </div>
            
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-text-primary mono">15.99</span>
              <span className="text-xl font-bold text-text-primary mono">$</span>
              <span className="text-text-muted ml-1">/ mois</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Création de règles personnalisées",
                "Blocage des trades selon vos règles",
                "Calendrier de performance interactif",
                "Graphiques et courbes de progression",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={18} className="text-neon-blue flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePayment('monthly')}
              disabled={currentPlan === 'monthly' || loadingPlan === 'monthly'}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                currentPlan === 'monthly' 
                  ? 'bg-bg-elevated text-neon-blue border border-neon-blue/30 cursor-not-allowed'
                  : 'bg-bg-primary text-text-primary border border-border hover:bg-bg-elevated hover:border-border-active'
              }`}
            >
              {loadingPlan === 'monthly' ? (
                 <div className="w-5 h-5 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
              ) : currentPlan === 'monthly' ? (
                'Plan Actif'
              ) : (
                'Payer 15.99$ / mois'
              )}
            </button>
          </div>

          {/* CARTE ANNUELLE */}
          <div className={`bg-bg-card border-2 rounded-2xl p-8 flex flex-col relative ${currentPlan === 'annual' ? 'border-neon-green shadow-[0_0_30px_rgba(0,255,128,0.2)]' : 'border-neon-green/50 shadow-lg'}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neon-green text-bg-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} />
              Recommandé
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-neon-green mb-2">Annuel</h3>
            </div>
            
            <div className="mb-8 flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-text-primary mono">159.99</span>
                <span className="text-xl font-bold text-text-primary mono">$</span>
                <span className="text-text-muted ml-1">/ an</span>
              </div>
              <span className="text-neon-green text-sm font-medium mt-1 flex items-center gap-1">
                <Zap size={14} /> 2 mois offerts inclus
              </span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-text-secondary">
                <Check size={18} className="text-neon-green flex-shrink-0 mt-0.5" />
                <span className="font-medium">Toutes les fonctionnalités du Mensuel</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-secondary bg-neon-green/10 p-3 rounded-lg border border-neon-green/20">
                <ImageIcon size={18} className="text-neon-green flex-shrink-0 mt-0.5" />
                <span className="font-bold text-neon-green">
                  Journal Visuel PRO <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neon-green/20 text-neon-green uppercase tracking-wider border border-neon-green/30">Bientôt</span><br/>
                  <span className="text-text-secondary font-normal text-xs">Uploadez jusqu'à 2 captures d'écran de vos graphiques par trade.</span>
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-secondary">
                <Check size={18} className="text-neon-green flex-shrink-0 mt-0.5" />
                <span className="font-medium">Pas de coupure d'accès (oubli de paiement)</span>
              </li>
            </ul>

            <button 
              onClick={() => handlePayment('annual')}
              disabled={currentPlan === 'annual' || loadingPlan === 'annual'}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                currentPlan === 'annual' 
                  ? 'bg-bg-elevated text-neon-green border border-neon-green/30 cursor-not-allowed'
                  : 'bg-neon-green text-bg-primary hover:bg-[#00e673] shadow-neon-green'
              }`}
            >
              {loadingPlan === 'annual' ? (
                 <div className="w-5 h-5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              ) : currentPlan === 'annual' ? (
                'Plan Actif'
              ) : (
                'Payer 159.99$ / an'
              )}
            </button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}