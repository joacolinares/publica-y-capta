"use client";
// Píxel de Meta, solo en la página de venta: PageView y ViewContent al entrar, y "ClicComprar" al tocar un botón de compra.
// La compra (Purchase) y los pagos iniciados los manda el píxel que se configura en Impul (Configuraciones > Meta),
// con el mismo ID; por eso aquí el clic va como evento propio y no como InitiateCheckout, para no contarlo dos veces.
// Sin NEXT_PUBLIC_META_PIXEL_ID no carga nada. Está declarado en el aviso de privacidad.
import Script from "next/script";
import { PIXEL_META, PRECIO_MXN } from "@/lib/oferta";

type Fbq = (...args: unknown[]) => void;

export function eventoMeta(nombre: string, datos?: Record<string, unknown>) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (PIXEL_META && fbq) fbq("trackCustom", nombre, datos);
}

export function PixelMeta() {
  if (!/^\d{5,20}$/.test(PIXEL_META)) return null;
  const contenido = { content_name: "Publica y Capta", content_type: "product", value: Number(PRECIO_MXN), currency: "MXN" };
  return (
    <Script id="pixel-meta" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_META}');fbq('track','PageView');fbq('track','ViewContent',${JSON.stringify(contenido)});
`}</Script>
  );
}
