import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { appUrl } from "@/lib/sitio";

// Con o sin https:// (Railway muestra el dominio sin esquema): new URL() truena si falta y tumba el build.
const sitio = appUrl() || "https://publica-y-capta-production.up.railway.app";

export const metadata: Metadata = {
  metadataBase: new URL(sitio),
  title: { default: "Publica y Capta", template: "%s · Publica y Capta" },
  description: "90 días de contenido para asesores inmobiliarios, con tu logo, tus colores y tus datos.",
  openGraph: { type: "website", locale: "es_MX", siteName: "Publica y Capta", title: "Publica y Capta · 90 días de contenido con tu marca", description: "90 publicaciones, 40 diseños y 30 guiones de reels para Instagram, Facebook y WhatsApp." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F4EFE8" };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
