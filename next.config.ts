import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Le Proxy magique pour éviter les blocages de cookies (CORS)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://edge-guard-backend.onrender.com/api/:path*', // Redirige vers ton Render
      },
    ];
  },

  // 2. Tes En-têtes pour les métadonnées PWA et sécurité (inchangés)
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;