// ─── PAGE RACINE — Redirection intelligente ───────────────────────────────────
// Redirige vers /dashboard si connecté, sinon vers /login (ou /auth)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/storage"; // Assure-toi que l'alias @ est bien configuré !

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login"); // J'ai mis /login car on en avait parlé plus tôt, ajuste si c'est /auth !
    }
  }, [router]);

  // Écran de chargement pendant la redirection
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm mono">Initialisation...</p>
      </div>
    </div>
  );
}