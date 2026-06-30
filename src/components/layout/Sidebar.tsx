// ─── SIDEBAR DE NAVIGATION ────────────────────────────────────────────────────
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  X,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    desc: "Dashboard",
  },
  {
    href: "/avant-trade",
    label: "Avant-Trade",
    icon: ShieldCheck,
    desc: "Garde-fou",
  },
  {
    href: "/calendar",
    label: "Calendrier",
    icon: CalendarDays,
    desc: "Performance",
  },
  {
    href: "/analytics",
    label: "Analyses",
    icon: BarChart3,
    desc: "Statistiques",
  },
  {
    href: "/abonnement",
    label: "Mon abonnement",
    icon: CreditCard,
    desc: "Facturation",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 bg-bg-card border-r border-border z-30
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `.trim()}
    >
      {/* ── Logo & fermeture mobile ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck size={28} className="text-neon-green" />
          <span className="text-text-primary font-bold text-lg tracking-wide">
            EdgeGuard
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-text-muted hover:text-text-primary p-1 rounded transition-colors"
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, desc }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-neon-blue text-white shadow-md"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }
                `.trim()}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 ${
                    isActive ? "text-white" : "text-text-muted group-hover:text-text-primary"
                  }`}
                />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : ""}`}>
                    {label}
                  </p>
                  <p className={`text-xs mono ${isActive ? "text-white/80" : "text-text-muted"}`}>
                    {desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Séparateur & Réglages ─────────────────────────────────── */}
        <div className="mt-4 pt-4 border-t border-border space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all duration-200 group"
          >
            <Settings
              size={18}
              className="text-text-muted group-hover:text-text-primary"
            />
            <span className="text-sm font-semibold">Configuration</span>
          </Link>
        </div>
      </nav>

      {/* ── Profil utilisateur ────────────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-border pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-neon-blue flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,112,243,0.3)]">
            <span className="text-white text-sm font-bold uppercase">
              {user?.name?.charAt(0) || "T"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate capitalize">
              {user?.name || "Trader"}
            </p>
            <p className="text-xs text-text-muted mono truncate">
              {user?.email || "—"}
            </p>
          </div>
        </div>
        
        {/* 💡 CORRECTION DU SURVOL ICI */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-text-secondary hover:text-neon-red hover:bg-bg-elevated transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};