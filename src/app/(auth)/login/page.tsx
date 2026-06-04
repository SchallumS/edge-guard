// ─── PAGE D'AUTHENTIFICATION ─────────────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, TrendingUp, ArrowRight, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const router = useRouter();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (authStorage.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = login(email, password);
        if (!result.success) setError("L'email ou le mot de passe est incorrect.");
      } else {
        if (password !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas.");
          return;
        }
        if (password.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caractères.");
          return;
        }
        const result = register(name, email, password);
        if (!result.success) setError(result.error || "Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* ── Panneau gauche décoratif (masqué sur mobile) ──────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-card border-r border-border relative overflow-hidden flex-col justify-between p-12">
        {/* Grille cyber en fond */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#00E676 1px, transparent 1px), linear-gradient(90deg, #00E676 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-neon-blue/20 border border-neon-blue/40 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-neon-blue" />
          </div>
          <span className="text-text-primary font-bold text-lg tracking-wider">EdgeGuard</span>
        </div>

        {/* Citation centrale */}
        <div className="relative space-y-6">
          <div className="w-12 h-0.5 bg-neon-green" />
          <blockquote className="text-2xl font-light text-text-primary leading-relaxed">
            "La discipline est la partie du trading que le marché ne peut pas vous enlever."
          </blockquote>
          <p className="text-text-muted text-sm mono">— Mark Douglas</p>
        </div>

        {/* Stats fictives d'accroche */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: "Win Rate cible", value: ">55%", color: "text-neon-green" },
            { label: "Risque max", value: "1%/trade", color: "text-neon-yellow" },
            { label: "R/R min", value: "2:1", color: "text-neon-blue" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-bg-elevated border border-border rounded-lg p-4 text-center"
            >
              <p className={`text-xl font-bold mono ${color}`}>{value}</p>
              <p className="text-xs text-text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit — Formulaire ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* En-tête mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-neon-blue/20 border border-neon-blue/40 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-neon-blue" />
            </div>
            <span className="text-text-primary font-bold tracking-wider">EdgeGuard</span>
          </div>

          {/* Titre */}
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {mode === "login" ? "Bienvenue" : "Créer un compte"}
            </h2>
            <p className="text-text-secondary mt-2 text-sm">
              {mode === "login"
                ? "Connectez-vous pour accéder au terminal"
                : "Démarrez votre défi 30 jours de discipline"}
            </p>
          </div>

          {/* Switch Login / Register */}
          <div className="flex bg-bg-elevated border border-border rounded-xl p-1">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${mode === m
                    ? "bg-bg-card text-text-primary shadow-card border border-border"
                    : "text-text-secondary hover:text-text-primary"}
                `.trim()}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Input
                label="Nom"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: John Doe"
                required
                leftAddon={<User size={14} />}
                autoComplete="name"
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@edgeguard.io"
              required
              leftAddon={<Mail size={14} />}
              autoComplete="email"
            />
            <Input
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Minimum 6 caractères" : "••••••••"}
              required
              leftAddon={<Lock size={14} />}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {mode === "register" && (
              <Input
                label="Confirmer le mot de passe"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répéter le mot de passe"
                required
                leftAddon={<Lock size={14} />}
                autoComplete="new-password"
              />
            )}

            {/* Bouton submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              rightIcon={<ArrowRight size={16} />}
              className="mt-2"
            >
              {mode === "login" ? "Accéder au Terminal" : "Initialiser le compte"}
            </Button>
            
            {/* Message d'erreur discret sous le bouton */}
            {error && (
              <p className="text-neon-red text-xs font-medium text-center mt-2 animate-fade-in">
                {error}
              </p>
            )}
          </form>

          {/* Lien de basculement */}
          <div className="pt-2">
            <p className="text-center text-text-primary text-sm">
              {mode === "login" ? "Pas encore configuré ?" : "Déjà un accès ?"}{" "}
              <button
                onClick={switchMode}
                className="text-neon-blue hover:text-white hover:underline font-semibold focus:outline-none transition-colors"
              >
                {mode === "login" ? "Créer un profil" : "Se connecter"}
              </button>
            </p>
          </div>

          {/* Badge d'information Premium & Ultra-Lisible */}
          <div className="p-4 bg-bg-elevated border border-border/60 rounded-xl flex items-start gap-3 shadow-inner animate-fade-in">
            <div className="live-dot mt-1 flex-shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              <span className="text-text-primary font-semibold">Mode Local Chiffré</span> — 
              Pour garantir votre confidentialité, toutes vos données de trading sont exclusivement conservées dans ce navigateur. Aucun serveur externe requis.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}