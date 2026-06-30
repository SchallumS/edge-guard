// ─── src/app/page.tsx ─────────────────────────────────────────────────────────
import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PricingSection } from "@/components/marketing/PricingSection"; 

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-neon-green/30">
      
      {/* ── Navbar minimaliste pour la Landing Page ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <ShieldCheck className="text-neon-green" size={24} />
          EdgeGuard
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Se connecter
          </Link>
          <Link href="/login?plan=monthly" className="text-sm font-bold bg-bg-elevated border border-border px-4 py-2 rounded-lg hover:border-border-active transition-all">
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* ── Hero Section (Le gros titre et les boutons) ── */}
      <section className="relative text-center py-32 px-4 flex flex-col items-center">
        {/* Effet de lueur en arrière-plan */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-neon-green/10 rounded-full blur-[100px] pointer-events-none" />

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 max-w-4xl leading-tight relative z-10">
          Ne laissez plus vos émotions <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-red to-neon-yellow">
            détruire votre capital.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl relative z-10">
          EdgeGuard bloque vos trades impulsifs, analyse vos performances et force votre discipline. Devenez enfin rentable.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <Link 
            href="/login?plan=annual" 
            className="group relative px-8 py-4 bg-neon-green text-bg-primary font-bold rounded-xl text-lg flex items-center gap-2 hover:bg-[#00e673] transition-all shadow-neon-green hover:shadow-[0_0_30px_rgba(0,230,118,0.6)]"
          >
            Démarrer mon mois gratuit
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a 
            href="#pricing" 
            className="px-8 py-4 bg-bg-elevated text-text-primary font-bold rounded-xl text-lg border border-border hover:border-border-active transition-all"
          >
            Voir les offres
          </a>
        </div>
      </section>

      {/* ── Section Tarification ── */}
      <div id="pricing">
        <PricingSection />
      </div>

    </main>
  );
}