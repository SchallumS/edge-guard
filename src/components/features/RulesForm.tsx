// ─── FORMULAIRE RÈGLES DE TRADING ────────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Save, RotateCcw, X } from "lucide-react";
import { TradingRules, ChecklistItem } from "@/lib/types";
import { generateId } from "@/lib/utils";
import api from "@/lib/api"; // 💡 Import du client API
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface RulesFormProps {
  onSave?: () => void;
}

// 💡 Modèle par défaut en cas de réinitialisation
const DEFAULT_RULES: Partial<TradingRules> = {
  maxTradesPerDay: 3,
  maxRiskPerTrade: 1,
  maxDailyDrawdown: 3,
  initialCapital: 10000,
  checklistItems: [],
  customAssets: [],
};

export const RulesForm: React.FC<RulesFormProps> = ({ onSave }) => {
  const [rules, setRules] = useState<TradingRules | null>(null);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [newAsset, setNewAsset] = useState("");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 💡 Charger les règles depuis le backend
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await api.get("/rules");
        setRules(res.data.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des règles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRules();
  }, []);

  // ── Mise à jour des champs numériques ─────────────────────────────────
  const handleNumericChange = (
    field: keyof Omit<TradingRules, "checklistItems" | "customAssets" | "userId" | "_id" | "createdAt">,
    value: string
  ) => {
    if (!rules) return;
    const num = parseFloat(value) || 0;
    setRules((prev) => prev ? ({ ...prev, [field]: num }) : prev);
  };

  // ── Gestion des Actifs personnalisés ───────────────────────────────────
  const addAsset = () => {
    if (!rules) return;
    const asset = newAsset.trim().toUpperCase();
    if (!asset) return;
    
    const currentAssets = rules.customAssets || [];
    if (!currentAssets.includes(asset)) {
      setRules((prev) => prev ? ({
        ...prev,
        customAssets: [...(prev.customAssets || []), asset],
      }) : prev);
    }
    setNewAsset("");
  };

  const removeAsset = (assetToRemove: string) => {
    if (!rules) return;
    setRules((prev) => prev ? ({
      ...prev,
      customAssets: (prev.customAssets || []).filter((a) => a !== assetToRemove),
    }) : prev);
  };

  // ── Gestion de la checklist ────────────────────────────────────────────
  const addCheckItem = () => {
    if (!rules || !newCheckItem.trim()) return;
    const item: ChecklistItem = {
      id: generateId(),
      label: newCheckItem.trim(),
      isRequired: true,
    };
    setRules((prev) => prev ? ({
      ...prev,
      checklistItems: [...prev.checklistItems, item],
    }) : prev);
    setNewCheckItem("");
  };

  const removeCheckItem = (id: string) => {
    if (!rules) return;
    setRules((prev) => prev ? ({
      ...prev,
      checklistItems: prev.checklistItems.filter((item) => item.id !== id),
    }) : prev);
  };

  const toggleRequired = (id: string) => {
    if (!rules) return;
    setRules((prev) => prev ? ({
      ...prev,
      checklistItems: prev.checklistItems.map((item) =>
        item.id === id ? { ...item, isRequired: !item.isRequired } : item
      ),
    }) : prev);
  };

  // ── Sauvegarde en base de données ─────────────────────────────────────
  const handleSave = async () => {
    if (!rules || isSaving) return;
    setIsSaving(true);
    
    try {
      await api.put("/rules", rules);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave?.();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des règles:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Reset aux valeurs par défaut (localement, avant sauvegarde) ───────
  const handleReset = () => {
    if (!rules) return;
    setRules((prev) => prev ? { ...prev, ...DEFAULT_RULES } as TradingRules : prev);
  };

  if (isLoading || !rules) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Règles quantitatives ────────────────────────────────────── */}
      <Card title="Règles de Discipline" subtitle="Limites quantitatives journalières">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Max trades / jour"
            type="number"
            min="1"
            max="20"
            value={rules.maxTradesPerDay || ""}
            onChange={(e) => handleNumericChange("maxTradesPerDay", e.target.value)}
            hint="Recommandé : 1 à 5 trades/jour"
            leftAddon={<span className="text-xs mono">#</span>}
          />
          <Input
            label="Risque max / trade (%)"
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={rules.maxRiskPerTrade || ""}
            onChange={(e) => handleNumericChange("maxRiskPerTrade", e.target.value)}
            hint="Règle des 1% recommandée"
            leftAddon={<span className="text-xs mono">%</span>}
          />
          <Input
            label="Drawdown journalier max (%)"
            type="number"
            min="0.5"
            max="20"
            step="0.5"
            value={rules.maxDailyDrawdown || ""}
            onChange={(e) => handleNumericChange("maxDailyDrawdown", e.target.value)}
            hint="Stop trading si ce seuil est atteint"
            leftAddon={<span className="text-xs mono">%</span>}
          />
          <Input
            label="Capital initial ($)"
            type="number"
            min="100"
            step="100"
            value={rules.initialCapital || ""}
            onChange={(e) => handleNumericChange("initialCapital", e.target.value)}
            hint="Base de calcul des risques"
            leftAddon={<span className="text-xs mono">$</span>}
          />
        </div>

        {/* ── Résumé visuel des limites ─────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Trades/j", value: `${rules.maxTradesPerDay}`, color: "text-neon-blue" },
            { label: "Risque max", value: `${rules.maxRiskPerTrade}%`, color: "text-neon-yellow" },
            { label: "Drawdown", value: `${rules.maxDailyDrawdown}%`, color: "text-neon-red" },
            { label: "Capital", value: `$${rules.initialCapital.toLocaleString()}`, color: "text-neon-green" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-bg-elevated border border-border rounded-lg p-3 text-center"
            >
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className={`text-lg font-bold mono ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Liste des Actifs ────────────────────────────────── */}
      <Card
        title="Paires de Trading & Actifs"
        subtitle="Définissez vos instruments favoris (Forex, Indices, Crypto...)"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {!(rules.customAssets?.length) && (
              <p className="text-sm text-text-muted italic py-2">
                Aucun actif enregistré. Ajoutez-en un ci-dessous.
              </p>
            )}
            {(rules.customAssets || []).map((asset) => (
              <div
                key={asset}
                className="flex items-center gap-2 bg-neon-blue/10 border border-neon-blue/30 rounded-lg pl-3 pr-1 py-1 group"
              >
                <span className="text-sm font-semibold text-neon-blue mono tracking-wide">
                  {asset}
                </span>
                <button
                  onClick={() => removeAsset(asset)}
                  className="text-neon-blue/50 hover:text-neon-red hover:bg-neon-red/10 p-1 rounded transition-colors"
                  aria-label={`Supprimer ${asset}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addAsset()}
              placeholder="Ex: V75, BOOM 1000, XAU/USD..."
              className="cyber-input flex-1 text-sm uppercase font-mono tracking-wider"
              maxLength={15}
            />
            <Button
              variant="secondary"
              onClick={addAsset}
              disabled={!newAsset.trim()}
              leftIcon={<Plus size={16} />}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Checklist stratégie ──────────────────────────────────────── */}
      <Card
        title="Checklist Stratégie"
        subtitle="Étapes obligatoires avant chaque trade"
        headerRight={
          <span className="mono text-xs text-text-muted">
            {rules.checklistItems.filter((i) => i.isRequired).length} requis
          </span>
        }
      >
        {/* Liste des items */}
        <div className="space-y-2 mb-4">
          {rules.checklistItems.length === 0 && (
            <p className="text-center text-text-muted text-sm py-6">
              Aucune étape définie — ajoutez vos règles de stratégie ci-dessous
            </p>
          )}
          {rules.checklistItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-bg-elevated border border-border rounded-lg px-4 py-3 group hover:border-border-active transition-colors"
            >
              <GripVertical size={14} className="text-text-muted flex-shrink-0 cursor-grab" />

              <span className="text-text-muted mono text-xs flex-shrink-0 w-5 text-center">
                {index + 1}
              </span>

              <span className="text-text-primary text-sm flex-1">{item.label}</span>

              <button
                onClick={() => toggleRequired(item.id)}
                className={`text-xs mono px-2 py-0.5 rounded border transition-colors ${
                  item.isRequired
                    ? "bg-neon-blue/10 text-neon-blue border-neon-blue/30"
                    : "text-text-muted border-border hover:border-border-active"
                }`.trim()}
                title={item.isRequired ? "Requis — cliquer pour optionnel" : "Optionnel — cliquer pour requis"}
              >
                {item.isRequired ? "Requis" : "Optionnel"}
              </button>

              <button
                onClick={() => removeCheckItem(item.id)}
                className="text-text-muted hover:text-neon-red transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                aria-label="Supprimer la règle"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Ajout d'un item */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCheckItem}
            onChange={(e) => setNewCheckItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCheckItem()}
            placeholder="Ex: Vérifier le niveau de RSI sur HTF..."
            className="cyber-input flex-1 text-sm"
            maxLength={120}
          />
          <Button
            variant="secondary"
            onClick={addCheckItem}
            disabled={!newCheckItem.trim()}
            leftIcon={<Plus size={16} />}
          >
            Ajouter
          </Button>
        </div>
      </Card>

      {/* ── Actions de sauvegarde ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handleReset}
          leftIcon={<RotateCcw size={14} />}
          disabled={isSaving}
        >
          Réinitialiser
        </Button>
        <Button
          variant={saved ? "neon-green" : "primary"}
          onClick={handleSave}
          leftIcon={isSaving ? undefined : <Save size={16} />}
          loading={isSaving}
        >
          {saved ? "✓ Sauvegardé !" : "Sauvegarder les règles"}
        </Button>
      </div>
    </div>
  );
};