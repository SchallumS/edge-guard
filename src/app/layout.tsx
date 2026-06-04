// ─── LAYOUT RACINE — Enregistrement PWA + Polices ────────────────────────────
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ── Chargement des polices via next/font (optimisé, auto-hosted) ───────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

// ── Métadonnées PWA ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "EdgeGuard — Discipline & Psychologie",
  description:
    "Journal de trading personnel axé sur la discipline et la psychologie. Protégez votre capital.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EdgeGuard",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1117",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-bg-primary text-text-primary antialiased`}
      >
        {children}
        
        {/* Enregistrement du Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[PWA] SW enregistré:', reg.scope); })
                    .catch(function(err) { console.warn('[PWA] SW erreur:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}