/* eslint-disable @next/next/no-img-element */
// Generador de posts para cada propiedad nueva. En venta lleva el bloque de datos que pide la NOM-247-SE-2021.
import React from "react";
import { z } from "zod";
import type { Marca } from "./disenos";

export const PropiedadSchema = z.object({
  operacion: z.enum(["venta", "renta"]),
  etiqueta: z.enum(["Recién captada", "Nueva en mi zona", "Precio actualizado", "Vendida", "Rentada"]).default("Recién captada"),
  tipo: z.enum(["Casa", "Departamento", "Terreno", "Local"]),
  colonia: z.string().min(2).max(60),
  recamaras: z.string().max(4).optional().default(""),
  banos: z.string().max(4).optional().default(""),
  m2: z.string().max(8).optional().default(""),
  precio: z.string().regex(/^[\d.,]+$/, "Solo números").max(15),
  caracteristicas: z.array(z.string().max(60)).max(3).default([]),
  creditos: z.array(z.enum(["bancario", "Infonavit", "Fovissste"])).default([]),
  // Solo PNG o JPG en base64: nunca una URL (satori la descargaría desde el servidor).
  foto: z.string().max(6_000_000, "La foto pesa demasiado. Usa una más chica.").regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/, "La foto tiene que ser PNG o JPG.").optional(),
});
export type Propiedad = z.infer<typeof PropiedadSchema>;

const fmt = (p: string) => {
  const n = Number(p.replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
  return Number.isFinite(n) ? n.toLocaleString("es-MX") : p;
};

export function postPropiedad(m: Marca, x: Propiedad) {
  const P = m.perfil;
  const precio = `$${fmt(x.precio)} MXN${x.operacion === "renta" ? " al mes" : ""}`;
  const feats = [x.recamaras && `${x.recamaras} recámaras`, x.banos && `${x.banos} baños`, x.m2 && `${x.m2} m²`].filter(Boolean) as string[];
  const cerrada = x.etiqueta === "Vendida" || x.etiqueta === "Rentada";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#FFFFFF", color: m.pal.tinta, position: "relative", fontFamily: "Montserrat" }}>
      <div style={{ display: "flex", width: 1080, height: 760, background: m.pal.principal }}>
        {x.foto ? <img src={x.foto} width={1080} height={760} style={{ objectFit: "cover" }} /> : null}
      </div>
      <div style={{ position: "absolute", left: 60, top: 60, display: "flex", background: cerrada ? m.pal.principal : m.pal.acento, color: cerrada ? m.pal.sobrePrincipal : m.pal.sobreAcento, fontWeight: 800, fontSize: 34, padding: "16px 30px", borderRadius: 12 }}>
        {x.etiqueta.toUpperCase()}
      </div>
      <div style={{ position: "absolute", right: 60, top: 60, display: "flex", background: m.pal.principal, borderRadius: 14, padding: 14 }}>
        {m.logo ? <img src={m.logo} height={70} style={{ objectFit: "contain", maxWidth: 280 }} /> : <span style={{ color: m.pal.sobrePrincipal, fontWeight: 700, fontSize: 24 }}>{(P.nombreComercial || P.nombre).toUpperCase()}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "40px 70px 0" }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: m.pal.acentoLegible }}>{x.colonia.toUpperCase()} · {P.ciudad.toUpperCase()}</span>
        <span style={{ fontFamily: "Playfair", fontSize: 68, fontWeight: 700, marginTop: 6, lineHeight: 1.1 }}>{x.tipo} en {x.operacion}</span>
        {!cerrada ? <span style={{ fontSize: 50, fontWeight: 800, color: m.pal.principal, marginTop: 10 }}>{precio}</span> : null}
        <div style={{ display: "flex", gap: 22, marginTop: 24 }}>
          {feats.map((f) => (
            <div key={f} style={{ display: "flex", background: m.pal.suave, borderRadius: 14, padding: "14px 22px", fontSize: 30, fontWeight: 700 }}>{f}</div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", display: "flex", flexDirection: "column", background: m.pal.tinta, color: "#FFFFFF", padding: "26px 70px", fontSize: 25, lineHeight: 1.45 }}>
        <div style={{ display: "flex" }}><span style={{ color: m.pal.acento, fontWeight: 700, marginRight: 10 }}>{P.nombre}</span><span>{`· ${P.whatsapp} · ${P.correo}`}</span></div>
        <span>{P.domicilio}{x.operacion === "venta" ? " · Precio en pesos mexicanos" : ""}</span>
      </div>
    </div>
  );
}

/** Texto del post que acompaña al diseño. */
export function textoPropiedad(m: Marca, x: Propiedad) {
  const P = m.perfil;
  const precio = `$${fmt(x.precio)} MXN${x.operacion === "renta" ? " al mes" : ""}`;
  const feats = [x.recamaras && `${x.recamaras} recámaras`, x.banos && `${x.banos} baños`, x.m2 && `${x.m2} m²`].filter(Boolean).join(", ");
  const lineas = [
    `📍 ${x.etiqueta} en ${x.colonia}, ${P.ciudad}`,
    "",
    `${x.tipo} en ${x.operacion}${feats ? `: ${feats}` : ""}.`,
    ...(x.caracteristicas.length ? ["", ...x.caracteristicas.map((c) => `✔ ${c}`)] : []),
    "",
    `Precio: ${precio}`,
  ];
  if (x.operacion === "venta" && x.creditos.length) {
    const y = (l: string[]) => (l.length > 1 ? `${l.slice(0, -1).join(", ")} y ${l[l.length - 1]}` : l[0]);
    lineas.push(`Aceptamos crédito ${y(x.creditos)}.`);
    const pub = x.creditos.filter((c) => c !== "bancario");
    if (pub.length) lineas.push(`El trámite de tu crédito ${pub.join(" o ")} es gratuito.`);
  }
  lineas.push("", `Agenda tu visita: ${P.nombre} · ${P.whatsapp} · ${P.correo}`, P.domicilio);
  const tag = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  lineas.push("", `#${x.tipo === "Departamento" ? "depa" : tag(x.tipo)}en${x.operacion} #${tag(x.colonia)} #${tag(P.ciudad)} #bienesraices`);
  return lineas.join("\n");
}
