import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "Publica y Capta", description: "Tu contenido de 90 días con tu marca" };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-MX">
      <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body>{children}</body>
    </html>
  );
}
