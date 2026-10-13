/* eslint-disable @next/next/no-img-element */
// Las plantillas de los diseños. Sin IA: toman colores, logo y datos del formulario.
import React from "react";
import type { ReactNode } from "react";
import type { Perfil } from "./perfil";
import { paleta, contraste, type Paleta } from "./colores";
import { TEXTOS } from "./personalizar";

export type Formato = "feed" | "story";
export const MEDIDAS: Record<Formato, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export type Marca = { perfil: Perfil; pal: Paleta; logo?: string; foto?: string };

export function marca(perfil: Perfil, logo?: string, foto?: string): Marca {
  return { perfil, pal: paleta(perfil.colorPrincipal, perfil.colorAcento), logo, foto };
}

const SERIF = "Playfair";
const SANS = "Montserrat";

/** Acento sobre el color principal solo si se lee (texto grande, 3:1). */
const acentoSobre = (m: Marca) => (contraste(m.pal.acento, m.pal.principal) >= 3 ? m.pal.acento : m.pal.sobrePrincipal);

function Logo({ m, color, h = 90 }: { m: Marca; color: string; h?: number }) {
  if (m.logo) return <img src={m.logo} height={h} style={{ objectFit: "contain", maxWidth: 320 }} />;
  const n = m.perfil.nombreComercial || m.perfil.nombre;
  return (
    <div style={{ display: "flex", border: `3px solid ${color}`, borderRadius: 14, padding: "12px 22px", color, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 1, maxWidth: 420 }}>
      {n.toUpperCase()}
    </div>
  );
}

function Pie({ m, fondo, color }: { m: Marca; fondo: string; color: string }) {
  const p = m.perfil;
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 120, background: fondo, color, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", fontFamily: SANS, fontSize: 28, fontWeight: 600 }}>
      <span>{p.nombre}</span>
      <span>{p.usuarioRedes || `WhatsApp ${p.whatsapp}`}</span>
    </div>
  );
}

function Pill({ texto, fondo, color }: { texto: string; fondo: string; color: string }) {
  return (
    <div style={{ display: "flex", alignSelf: "flex-start", background: fondo, color, fontFamily: SANS, fontWeight: 800, fontSize: 30, padding: "12px 28px", borderRadius: 999, letterSpacing: 1 }}>
      {texto.toUpperCase()}
    </div>
  );
}

/** Parte el título: lo que va después de ":" (o las 2 últimas palabras) va resaltado. */
function partir(t: string): [string, string] {
  const i = t.indexOf(":");
  if (i > 0) return [t.slice(0, i + 1), t.slice(i + 1).trim()];
  const w = t.split(" ");
  return w.length > 3 ? [w.slice(0, -2).join(" "), w.slice(-2).join(" ")] : [t, ""];
}

const tamTitulo = (t: string, base: number) => (t.length > 60 ? base * 0.72 : t.length > 40 ? base * 0.85 : base);

type Datos = { titulo: string; etiqueta: string; sub?: string; dia: number };

// ---------- Layouts ----------

function Portada({ m, d }: { m: Marca; d: Datos }) {
  const [a, b] = partir(d.titulo);
  const fs = tamTitulo(d.titulo, 104);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: m.pal.principal, color: m.pal.sobrePrincipal, padding: "100px 80px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Pill texto={d.etiqueta} fondo={m.pal.acento} color={m.pal.sobreAcento} />
        <Logo m={m} color={m.pal.sobrePrincipal} h={80} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 90, fontFamily: SERIF, fontWeight: 700, fontSize: fs, lineHeight: 1.06 }}>
        <span>{a}</span>
        {b ? <span style={{ fontStyle: "italic", color: acentoSobre(m) }}>{b}</span> : null}
      </div>
      {d.sub ? <div style={{ display: "flex", marginTop: 50, fontFamily: SANS, fontSize: 38, fontWeight: 600, opacity: 0.9 }}>{d.sub}</div> : null}
      <div style={{ position: "absolute", right: 50, bottom: 40, display: "flex", fontFamily: SERIF, fontWeight: 700, fontSize: 460, lineHeight: 1, color: m.pal.sobrePrincipal, opacity: 0.08 }}>{String(d.dia).padStart(2, "0")}</div>
      <div style={{ position: "absolute", left: 80, bottom: 90, display: "flex", fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>Guárdalo para después</div>
      <div style={{ position: "absolute", right: 80, bottom: 90, display: "flex", fontFamily: SANS, fontWeight: 600, fontSize: 26, opacity: 0.85 }}>{m.perfil.nombre}</div>
    </div>
  );
}

function Frase({ m, d }: { m: Marca; d: Datos }) {
  const fs = tamTitulo(d.titulo, 96);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: m.pal.fondo, color: m.pal.tinta, padding: "110px 80px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Pill texto={d.etiqueta} fondo={m.pal.principal} color={m.pal.sobrePrincipal} />
        <Logo m={m} color={m.pal.principal} h={80} />
      </div>
      <div style={{ display: "flex", width: 140, height: 14, background: m.pal.acento, marginTop: 120, borderRadius: 7 }} />
      <div style={{ display: "flex", marginTop: 50, fontFamily: SERIF, fontWeight: 700, fontSize: fs, lineHeight: 1.08 }}>{d.titulo}</div>
      {d.sub ? <div style={{ display: "flex", marginTop: 46, fontFamily: SANS, fontSize: 36, color: m.pal.gris, lineHeight: 1.4 }}>{d.sub}</div> : null}
      <Pie m={m} fondo={m.pal.principal} color={m.pal.sobrePrincipal} />
    </div>
  );
}

function Consejo({ m, d }: { m: Marca; d: Datos }) {
  const fs = tamTitulo(d.titulo, 84);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: m.pal.suave, color: m.pal.tinta, padding: "110px 80px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", width: 150, height: 150, borderRadius: 75, background: m.pal.acento, color: m.pal.sobreAcento, alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 64, fontWeight: 700 }}>
          {String(d.dia).padStart(2, "0")}
        </div>
        <Logo m={m} color={m.pal.principal} h={80} />
      </div>
      <div style={{ display: "flex", marginTop: 70, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: m.pal.acentoLegible, letterSpacing: 2 }}>{d.etiqueta.toUpperCase()}</div>
      <div style={{ display: "flex", marginTop: 24, fontFamily: SANS, fontWeight: 800, fontSize: fs, lineHeight: 1.1 }}>{d.titulo}</div>
      {d.sub ? <div style={{ display: "flex", marginTop: 46, fontFamily: SANS, fontSize: 36, lineHeight: 1.45, color: "#2E3B38" }}>{d.sub}</div> : null}
      <Pie m={m} fondo={m.pal.principal} color={m.pal.sobrePrincipal} />
    </div>
  );
}

function Encuesta({ m, d }: { m: Marca; d: Datos }) {
  const [a, b] = partir(d.titulo);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: m.pal.fondo, color: m.pal.tinta, padding: "230px 90px", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 30, background: m.pal.acento, display: "flex" }} />
      <Pill texto={d.etiqueta} fondo={m.pal.principal} color={m.pal.sobrePrincipal} />
      <div style={{ display: "flex", flexDirection: "column", marginTop: 80, fontFamily: SERIF, fontWeight: 700, fontSize: tamTitulo(d.titulo, 128), lineHeight: 1.03 }}>
        <span>{a}</span>
        {b ? <span style={{ fontStyle: "italic", color: m.pal.principal }}>{b}</span> : null}
      </div>
      {d.sub ? <div style={{ display: "flex", marginTop: 60, fontFamily: SANS, fontSize: 44, fontWeight: 600, lineHeight: 1.4 }}>{d.sub}</div> : null}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 100, background: "#FFFFFF", borderRadius: 36, padding: 50, boxShadow: "0 10px 40px rgba(0,0,0,.12)" }}>
        <div style={{ display: "flex", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40 }}>Responde aquí</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 200, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: SANS }}>
          <span style={{ fontSize: 36, fontWeight: 700 }}>{m.perfil.nombre}</span>
          <span style={{ fontSize: 30, color: m.pal.gris, marginTop: 8 }}>WhatsApp {m.perfil.whatsapp}</span>
        </div>
        <Logo m={m} color={m.pal.principal} h={90} />
      </div>
    </div>
  );
}

function PortadaReel({ m, d }: { m: Marca; d: Datos }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: m.pal.principal, color: m.pal.sobrePrincipal, padding: "0 90px", position: "relative" }}>
      <div style={{ position: "absolute", top: 160, left: 90, display: "flex" }}><Logo m={m} color={m.pal.sobrePrincipal} h={90} /></div>
      <Pill texto={d.etiqueta} fondo={m.pal.acento} color={m.pal.sobreAcento} />
      <div style={{ display: "flex", marginTop: 60, fontFamily: SERIF, fontWeight: 700, fontSize: tamTitulo(d.titulo, 120), lineHeight: 1.05 }}>{d.titulo}</div>
      <div style={{ display: "flex", marginTop: 70, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: acentoSobre(m) }}>Mira el video ›</div>
      <div style={{ position: "absolute", bottom: 200, left: 90, display: "flex", fontFamily: SANS, fontSize: 34, fontWeight: 600 }}>{m.perfil.nombre} · {m.perfil.zona}</div>
    </div>
  );
}

function MarcaPersonal({ m, d }: { m: Marca; d: Datos }) {
  const ini = m.perfil.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: m.pal.principal, color: m.pal.sobrePrincipal, position: "relative" }}>
      <div style={{ display: "flex", width: "100%", height: 760, background: m.pal.suave, alignItems: "center", justifyContent: "center" }}>
        {m.foto ? (
          <img src={m.foto} width={1080} height={760} style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", width: 380, height: 380, borderRadius: 190, background: m.pal.principal, color: m.pal.sobrePrincipal, alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 170, fontWeight: 700 }}>{ini}</div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "60px 80px" }}>
        <Pill texto={d.etiqueta} fondo={m.pal.acento} color={m.pal.sobreAcento} />
        <div style={{ display: "flex", marginTop: 36, fontFamily: SERIF, fontWeight: 700, fontSize: tamTitulo(d.titulo, 76), lineHeight: 1.08 }}>{d.titulo}</div>
        <div style={{ display: "flex", marginTop: 30, fontFamily: SANS, fontSize: 30, fontWeight: 600, opacity: 0.9 }}>{m.perfil.nombre} · {m.perfil.zona}</div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 60, display: "flex", background: m.pal.principal, borderRadius: 16, padding: 14 }}><Logo m={m} color={m.pal.sobrePrincipal} h={70} /></div>
    </div>
  );
}

const LAYOUTS = { portada: Portada, frase: Frase, consejo: Consejo, encuesta: Encuesta, reel: PortadaReel, marca: MarcaPersonal };
type Layout = keyof typeof LAYOUTS;
const FORMATO_DE: Record<Layout, Formato> = { portada: "feed", frase: "feed", consejo: "feed", encuesta: "story", reel: "story", marca: "feed" };

export type Pieza = { id: string; dia: number; layout: Layout; formato: Formato; datos: Datos };

/** Primera frase del post como subtítulo, si es corta y no tiene datos por completar. */
function gancho(post: string) {
  const l = post.split("\n")[0].replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();
  return l.length > 15 && l.length < 120 && !l.includes("[") ? l : undefined;
}

const ETIQUETA: Record<string, string> = { Compradores: "Compradores", Vendedores: "Vendedores", Rentas: "Rentas", "Tu marca": "Conóceme" };

/** Las 40 piezas del pack: 34 posts del calendario + 6 stories de interacción. */
/** Título de diseño: sin paréntesis ni datos por completar. */
/** Títulos que en el calendario son una instrucción para el asesor y en el diseño hablan a sus seguidores. */
const TITULO: Record<number, string> = { 1: "Hola, soy [Tu nombre]" };

const limpiar = (t: string) => t.replace(/\s*\([^)]*\)/g, "").replace(/\s*(de\s+)?\$?\[[^\]]*\]/g, "").trim();

export function catalogo(datos: (t: string) => string = (t) => t): Pieza[] {
  const piezas: Pieza[] = [];
  let alterna = 0;
  for (const d of TEXTOS) {
    if (d.publico === "Propiedad") continue; // las arma el generador de propiedades
    const f = d.formato.toLowerCase();
    let layout: Layout;
    if (f.includes("story")) layout = "encuesta";
    else if (f.includes("reel")) layout = "reel";
    else if (d.publico === "Tu marca") layout = "marca";
    else if (f.includes("carrusel")) layout = alterna++ % 2 ? "consejo" : "portada";
    else layout = alterna++ % 2 ? "consejo" : "frase";
    piezas.push({ id: `dia-${String(d.dia).padStart(2, "0")}`, dia: d.dia, layout, formato: FORMATO_DE[layout], datos: { titulo: limpiar(datos(TITULO[d.dia] ?? d.tema)), etiqueta: ETIQUETA[d.publico] ?? d.publico, dia: d.dia, sub: gancho(d.post) } });
  }
  // Se priorizan carruseles, consejos y marca; los reels con portada quedan si sobra lugar.
  const orden: Layout[] = ["portada", "marca", "encuesta", "frase", "consejo", "reel"];
  const elegidas = [...piezas].sort((a, b) => orden.indexOf(a.layout) - orden.indexOf(b.layout)).slice(0, 34);
  const stories: Pieza[] = [
    ["¿Compras o rentas?", "Cuéntame qué buscas y te ayudo"],
    ["¿Sabes cuánto vale tu casa hoy?", "Te hago una opinión de valor sin compromiso"],
    ["Pregúntame lo que quieras", "Crédito, papeles, zonas: aquí respondo"],
    ["¿Primera casa este año?", "Te explico por dónde empezar"],
    ["¿Qué te frena para mudarte?", "Enganche, crédito o encontrar la zona"],
    ["¿Rentas tu depa?", "Te ayudo a encontrar a tu inquilino"],
  ].map(([titulo, sub], i) => ({ id: `story-${i + 1}`, dia: 0, layout: "encuesta" as Layout, formato: "story" as Formato, datos: { titulo, sub, etiqueta: "Story", dia: 0 } }));
  return [...elegidas.sort((a, b) => a.dia - b.dia), ...stories];
}

export function elemento(p: Pieza, m: Marca): ReactNode {
  const L = LAYOUTS[p.layout];
  return <L m={m} d={p.datos} />;
}
