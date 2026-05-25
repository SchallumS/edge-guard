// src/components/ui/Logo.tsx
import React from 'react';

// On définit une interface pour les props si tu veux changer la taille via className
interface LogoProps {
  className?: string; // Optionnel, pour la taille (ex: "w-12 h-12")
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className} // On applique la className pour gérer la taille
    >
      {/* 
        COTÉ GAUCHE : LE BOUCLIER (PROTECTION / GUARD)
        Couleur : Gris très clair/Blanc (#F0F6FC) - Épaisseur : 8 pour un look solide
      */}
      <path 
        d="M50 20 L25 35 V65 L50 85" 
        stroke="#F0F6FC" 
        strokeWidth="8" 
        strokeLinecap="square" // Angles droits pour le côté rigide
      />
      
      {/* 
        COTÉ DROIT : LE GRAPHIQUE BOURSIER (EDGE / AVANTAGE)
        Couleur : Vert Néon (#00E676) - Épaisseur : 8
        Le tracé remplace le bord du bouclier par un zig-zag ascendant.
      */}
      <path 
        d="M50 20 L65 20 L60 35 L75 35 L70 50 L85 50 L80 65 L95 65" 
        stroke="#00E676" 
        strokeWidth="8" 
        strokeLinecap="square"
      />
      
      {/* 
        DÉTAIL PREMIUM : LE POINT D'ENTRÉE (LE SOMMET DU TRADE)
        Un petit carré néon au bout du graphique pour symboliser la précision.
      */}
      <rect x="91" y="61" width="8" height="8" fill="#00E676" />
    </svg>
  );
};

export default Logo;