import satori from "satori";
import { renderAsync } from "@resvg/resvg-js";
import sharp from "sharp";
import type { ReactNode } from "react";
import { fuentes } from "./fuentes";

// satori ya convierte el texto en trazos, así que resvg no necesita buscar fuentes del sistema (es más rápido).
// renderAsync pinta en otro hilo: se pueden armar varios diseños a la vez.
async function pintar(el: ReactNode, width: number, height: number) {
  const svg = await satori(el as React.ReactElement, { width, height, fonts: fuentes(), embedFont: true });
  return renderAsync(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: false } });
}

export async function png(el: ReactNode, width: number, height: number): Promise<Buffer> {
  return (await pintar(el, width, height)).asPng();
}

/** Para diseños con foto: en PNG pesan 2 a 3 MB, en JPEG unos 250 KB y se ven igual en Instagram. */
export async function jpg(el: ReactNode, width: number, height: number): Promise<Buffer> {
  const r = await pintar(el, width, height);
  return sharp(Buffer.from(r.pixels), { raw: { width: r.width, height: r.height, channels: 4 } })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

/** PNG si el diseño es solo texto y color (pesa poco y queda nítido), JPEG si lleva foto. */
export async function imagen(el: ReactNode, width: number, height: number, conFoto: boolean) {
  return conFoto ? { buf: await jpg(el, width, height), ext: "jpg" as const, mime: "image/jpeg" } : { buf: await png(el, width, height), ext: "png" as const, mime: "image/png" };
}
