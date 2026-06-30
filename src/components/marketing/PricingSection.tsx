// ─── src/components/marketing/PricingSection.tsx ──────────────────────────
"use client";

import React from "react";
import Link from "next/link";
import { Check, Shield, Zap, TrendingUp, Image as ImageIcon } from "lucide-react";

export const PricingSection = () => {
  return (
    <section className="py-20 bg-bg-primary relative overflow-hidden">
      {/* Effet de lueur en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
            Votre stratégie fonctionne.<br />
            <span className="text-neon-red">C'est votre discipline qui coûte cher.</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Arrêtez de rendre vos gains au marché à cause d'un trade impulsif. 
            EdgeGuard verrouille votre gestion du risque.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* ── CARTE MENSUELLE ───────────────────────────────────────── */}
          <div className="bg-bg-elevated border border-border rounded-2xl p-8 flex flex-col transition-all duration-300 hover:border-border-active">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">Mensuel</h3>
              <p className="text-text-muted text-sm">L'essentiel pour verrouiller votre discipline mois après mois.</p>
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

            <Link 
              href="/login?plan=monthly"
              className="w-full py-4 rounded-xl font-bold text-text-primary bg-bg-primary border border-border hover:bg-bg-elevated hover:border-border-active transition-all flex items-center justify-center"
            >
              Démarrer mon essai gratuit
            </Link>
          </div>

          {/* ── CARTE ANNUELLE (Mise en avant) ────────────────────────── */}
          <div className="bg-bg-card border-2 border-neon-green/50 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_-15px_rgba(0,255,128,0.3)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neon-green text-bg-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} />
              Recommandé
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-neon-green mb-2">Annuel</h3>
              <p className="text-text-muted text-sm">L'arsenal complet pour les traders qui veulent des analyses poussées.</p>
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
              {[
                "Toutes les fonctionnalités du Mensuel",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={18} className="text-neon-green flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
              
              {/* 💡 LA NOUVELLE FONCTIONNALITÉ MISE EN AVANT AVEC LE BADGE "BIENTÔT" */}
              <li className="flex items-start gap-3 text-sm text-text-secondary bg-neon-green/10 p-3 rounded-lg border border-neon-green/20">
                <ImageIcon size={18} className="text-neon-green flex-shrink-0 mt-0.5" />
                <span className="font-bold text-neon-green">
                  Journal Visuel PRO <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neon-green/20 text-neon-green uppercase tracking-wider border border-neon-green/30">Bientôt</span><br/>
                  <span className="text-text-secondary font-normal text-xs">Uploadez jusqu'à 2 captures d'écran de vos graphiques par trade. (En cours de développement)</span>
                </span>
              </li>
              
              <li className="flex items-start gap-3 text-sm text-text-secondary">
                <Check size={18} className="text-neon-green flex-shrink-0 mt-0.5" />
                <span className="font-medium">Pas de coupure d'accès (oubli de paiement)</span>
              </li>
            </ul>

            <Link 
              href="/login?plan=annual"
              className="w-full py-4 rounded-xl font-bold text-bg-primary bg-neon-green hover:bg-[#00e673] transition-all shadow-neon-green flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} />
              Commencer avec l'Annuel
            </Link>
          </div>

        </div>

        {/* ── SECTION FAQ RAPIDE / ANCRAGE PSYCHOLOGIQUE ──────────── */}
        <div className="mt-20 max-w-3xl mx-auto bg-bg-elevated border border-border p-6 md:p-8 rounded-2xl">
          <h4 className="text-lg font-bold text-text-primary mb-3">Pourquoi EdgeGuard n'est pas gratuit ?</h4>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            Parce que la gratuité n'engage à rien. Si vous ne payez pas pour votre discipline, vous ne la respecterez pas au premier coup de stress ou de FOMO (Fear Of Missing Out). <strong className="text-text-primary">15 $, c'est le prix d'un seul mauvais trade pris sous le coup de l'émotion.</strong> Protégez votre capital dès aujourd'hui. L'outil se rentabilise dès le premier trade refusé par le Garde-Fou.
          </p>
        </div>
      </div>
    </section>
  );
};