/* eslint-disable @next/next/no-img-element */
// Piezas comunes de los diseños (pack y propiedades), con el estilo de la guía visual (2026-10-14): base neutra,
// el color del asesor como acento, serif elegante con una palabra en manuscrita y datos chicos en mayúsculas espaciadas.
import React from "react";
import type { ReactNode } from "react";
import sharp from "sharp";
import type { Perfil } from "./perfil";
import { estilo, SANS, SCRIPT, SERIF, type Estilo } from "./estilo";
import { paleta, type Paleta } from "./colores";
import { ajustar, ancho as medirAncho, lineas } from "./medir";
import { fotoPropia, fotoStock, type Etiqueta, type Opciones } from "./fotos";

export type Formato = "feed" | "story";
export const MEDIDAS: Record<Formato, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

/** `e`: estilo de los diseños. `pal`: colores del asesor para las páginas HTML del pack. */
export type Marca = { perfil: Perfil; e: Estilo; pal: Paleta; logo?: string; foto?: string };

export function marca(perfil: Perfil, logo?: string, foto?: string): Marca {
  return { perfil, e: estilo(perfil.colorPrincipal, perfil.colorAcento), pal: paleta(perfil.colorPrincipal, perfil.colorAcento), logo, foto };
}

/** Achica el logo una sola vez (los diseños lo muestran a 70 px de alto): así cada diseño se arma más rápido. */
export async function prepararMarca(perfil: Perfil, logo?: string, foto?: string): Promise<Marca> {
  let chico = logo;
  const m = logo?.match(/^data:image\/(png|jpeg);base64,(.+)$/);
  if (m) {
    try {
      const out = await sharp(Buffer.from(m[2], "base64")).rotate().resize({ height: 180, width: 600, fit: "inside", withoutEnlargement: true }).png().toBuffer();
      chico = `data:image/png;base64,${out.toString("base64")}`;
    } catch { chico = undefined; }
  }
  return marca(perfil, chico, foto);
}

// ---------- Textos de content/disenos.json ----------

export type Titulo = { serif: string; script?: string; acento?: string };
/** `tipo` pone etiquetas arriba del título y del texto (mito/realidad, pregunta/respuesta…). `extra`: lámina de cierre fuera de la cuenta. */
export type Lamina = { titulo: Titulo; texto?: string; lista?: string[]; marca?: "si" | "no"; tipo?: "mito" | "pregunta" | "anuncio"; extra?: boolean };
export type DiaDiseno = {
  dia: number; tipo: "carrusel" | "post"; etiqueta: string; titulo: Titulo; bajada?: string; boton?: string; foto: Etiqueta;
  laminas?: Lamina[]; cierre?: { titulo: Titulo; texto: string; palabra: string };
};
export type Historia = { id: string; dia?: number; tipo: "encuesta" | "preguntas"; etiqueta: string; titulo: Titulo; bajada?: string; opciones?: string[]; foto: Etiqueta };
export type Contenido = { dias: DiaDiseno[]; historias: Historia[] };

/** Comillas tipográficas: "PRECIO" → “PRECIO”. */
export const comillas = (t: string) => t.replace(/"([^"]*)"/g, "“$1”");
export const iniciales = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
export const usuario = (p: Perfil) => (p.usuarioRedes ? (p.usuarioRedes.startsWith("@") ? p.usuarioRedes : `@${p.usuarioRedes}`) : `WhatsApp ${p.whatsapp}`);

// ---------- Piezas chicas ----------

export type Tono = "claro" | "oscuro";

/** El tamaño más grande (hasta `size`) con el que un texto en mayúsculas espaciadas entra en una línea de `max` px. */
function enUnaLinea(texto: string, size: number, max: number, espaciado: number, min: number) {
  let t = size;
  while (t > min && medirAncho(texto.toUpperCase(), "sansNegrita", t, t * espaciado) > max) t -= 1;
  return t;
}

/** Mayúsculas espaciadas. Con `max`, se achica para no partirse en dos líneas. */
export function Cap({ children, color, size = 24, style, max }: { children: ReactNode; color: string; size?: number; style?: React.CSSProperties; max?: number }) {
  const t = max && typeof children === "string" ? enUnaLinea(children, size, max, 0.3, 15) : size;
  return <div style={{ display: "flex", fontFamily: SANS, fontWeight: 600, fontSize: t, letterSpacing: t * 0.3, textTransform: "uppercase", color, ...(max ? { whiteSpace: "nowrap" as const } : {}), ...style }}>{children}</div>;
}

export function Flecha({ color, w = 34 }: { color: string; w?: number }) {
  return (
    <svg width={w} height={16} viewBox={`0 0 ${w} 16`}>
      <path d={`M0 8 H${w - 3} M${w - 10} 1 L${w - 2} 8 L${w - 10} 15`} stroke={color} strokeWidth={2} fill="none" />
    </svg>
  );
}

/** Botón de píldora. `max`: ancho disponible; si el texto no entra en una línea, se achica la letra. */
export function Boton({ texto, color, fondo, flecha, max = 920 }: { texto: string; color: string; fondo?: string; flecha?: boolean; max?: number }) {
  const t = enUnaLinea(comillas(texto), 22, max - 80 - (flecha ? 50 : 0), 0.236, 15);
  const pad = t < 22 ? 30 : 38;
  return (
    <div style={{ display: "flex", alignSelf: "flex-start", alignItems: "center", gap: 16, border: `2px solid ${color}`, background: fondo ?? "transparent", borderRadius: 999, padding: `18px ${pad}px`, fontFamily: SANS, fontWeight: 600, fontSize: t, letterSpacing: t * 0.236, textTransform: "uppercase", color, whiteSpace: "nowrap", flexShrink: 0 }}>
      <span>{comillas(texto)}</span>
      {flecha ? <Flecha color={color} /> : null}
    </div>
  );
}

export function Monograma({ m, size, color }: { m: Marca; size: number; color: string }) {
  return (
    <div style={{ display: "flex", width: size, height: size, borderRadius: size / 2, border: `2px solid ${color}`, alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 600, fontSize: size * 0.4, color, letterSpacing: 1 }}>
      {iniciales(m.perfil.nombre)}
    </div>
  );
}

/** Logo del asesor; sobre fondo oscuro o foto va en una pastilla crema para que se lea. Sin logo, el monograma. */
export function Firma({ m, tono, alto = 70 }: { m: Marca; tono: Tono; alto?: number }) {
  if (!m.logo) return <Monograma m={m} size={alto} color={tono === "claro" ? m.e.carbon : m.e.arena} />;
  const img = <img src={m.logo} height={alto - (tono === "claro" ? 0 : 16)} style={{ objectFit: "contain", maxWidth: 240 }} />;
  return tono === "claro" ? img : <div style={{ display: "flex", background: m.e.crema, borderRadius: 14, padding: "8px 14px" }}>{img}</div>;
}

export function Pie({ m, tono, abajo = 62, izq = 80, der = 80 }: { m: Marca; tono: Tono; abajo?: number; izq?: number; der?: number }) {
  const color = tono === "claro" ? m.e.carbon : m.e.arena;
  const u = usuario(m.perfil).toUpperCase(), n = m.perfil.nombre.toUpperCase();
  // Nombres o usuarios largos: se achica la letra y, si no alcanza, queda solo el usuario con el logo o monograma.
  const libre = 1080 - izq - der - 70 - 70;
  let size = 21;
  const mide = (s: number, conNombre: boolean) => medirAncho(u, "sansNegrita", s, s * 0.22) + (conNombre ? medirAncho(n, "sansNegrita", s, s * 0.22) : 0);
  while (size > 16 && mide(size, true) > libre) size--;
  const conNombre = mide(size, true) <= libre;
  return (
    <div style={{ position: "absolute", left: izq, right: der, bottom: abajo, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: size * 0.22, textTransform: "uppercase", color }}>
      <span>{u}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {conNombre ? <span>{n}</span> : null}
        <Firma m={m} tono={tono} />
      </div>
    </div>
  );
}

/** Pie apilado a la izquierda, para diseños con la foto a la derecha. */
export function PieColumna({ m, tono, ancho = 440 }: { m: Marca; tono: Tono; ancho?: number }) {
  const color = tono === "claro" ? m.e.carbon : m.e.arena;
  // Un usuario no tiene espacios y no se parte: si es largo, se achica para no encimarse en la foto.
  const u = usuario(m.perfil);
  let s = 20;
  while (s > 12 && medirAncho(u.toUpperCase(), "sansNegrita", s, s * 0.22) > ancho) s--;
  return (
    <div style={{ position: "absolute", left: 80, bottom: 62, width: ancho, display: "flex", flexDirection: "column", gap: 16, fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: 4.4, textTransform: "uppercase", color }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Firma m={m} tono={tono} alto={64} /><span>{m.perfil.nombre}</span></div>
      <span style={{ fontSize: s, letterSpacing: s * 0.22, whiteSpace: "nowrap" }}>{u}</span>
    </div>
  );
}

/** Título de portada: la frase en serif y la palabra clave en manuscrita debajo, un poco encimada. */
type MedidaTitulo = { t: Titulo; ancho: number; serifMax?: number; serifLineas?: number; sangria?: number; scriptMax?: number; centrado?: boolean };

/** Tamaños del título (serif + manuscrita) y cuánto mide de alto. */
export function medirTitulo({ t, ancho, serifMax = 100, serifLineas = 3, sangria = 0, scriptMax, centrado = false }: MedidaTitulo) {
  const anchoScript = centrado ? ancho : ancho - sangria;
  const ss = ajustar(t.serif, "serif", ancho, serifLineas, serifMax, Math.round(serifMax * 0.5));
  const sc = t.script ? ajustar(t.script, "script", anchoScript, 2, scriptMax ?? Math.round(ss * 1.35), Math.round(ss * 0.6)) : 0;
  const ls = lineas(t.serif, "serif", ss, ancho);
  const nScript = t.script ? lineas(t.script, "script", sc, anchoScript).length : 0;
  // La manuscrita se encima un poco en el serif; si el serif tiene letras que bajan (g, p, y…), se separa para que no choquen.
  const encime = /[gjpqy]/.test(ls[ls.length - 1] ?? "") ? -Math.round(sc * 0.02) : Math.round(sc * 0.08);
  return { ss, sc, encime, alto: ls.length * ss + nScript * sc * 1.12 - encime };
}

/** Párrafo listo para pintar: comillas tipográficas y las dos últimas palabras juntas (espacio duro) para que no quede una sola abajo. */
const parrafo = (t: string) => comillas(t).trim().replace(/ (\S+)$/, "\u00a0$1");
/** Alto de un párrafo en Montserrat. */
export const altoTexto = (texto: string, size: number, ancho: number, interlineado = 1.5) =>
  lineas(parrafo(texto), "sans", size, ancho).length * size * interlineado;
/** Alto del botón de píldora. */
export const ALTO_BOTON = 70;

/** Título de portada. Con `alto`, la letra se achica hasta que el título entre en ese alto (para que nada se encime). */
export function TituloPortada({ t, ancho, color, colorScript, serifMax = 100, serifLineas = 3, centrado = false, sangria = 0, scriptMax, alto }: {
  t: Titulo; ancho: number; color: string; colorScript: string; serifMax?: number; serifLineas?: number; centrado?: boolean; sangria?: number; scriptMax?: number; alto?: number;
}) {
  let max = serifMax, sMax = scriptMax;
  let m = medirTitulo({ t, ancho, serifMax: max, serifLineas, sangria, scriptMax: sMax, centrado });
  // Una palabra corta sola en un renglón ("un", "el", "tu"; con frases de tres palabras o más, también "para" o "¿Casa")
  // se ve como error: también se achica hasta que suba al renglón de arriba. Una palabra larga sola sí se ve bien.
  const corta = t.serif.trim().split(/\s+/).length >= 3 ? 6 : 3;
  const sola = (s: number) => lineas(t.serif, "serif", s, ancho).some((l) => !/\s/.test(l.trim()) && l.trim().length <= corta);
  const huerfana = () => sola(m.ss) && max > serifMax * 0.78 && !sola(Math.floor(serifMax * 0.78));
  while (max > 44 && ((alto && m.alto > alto) || huerfana())) {
    max = Math.floor(max * 0.94);
    sMax = sMax ? Math.floor(sMax * 0.94) : undefined;
    m = medirTitulo({ t, ancho, serifMax: max, serifLineas: serifLineas + (max < serifMax * 0.8 ? 1 : 0), sangria, scriptMax: sMax, centrado });
  }
  const { ss, sc, encime } = m;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: ancho, alignItems: centrado ? "center" : "flex-start", flexShrink: 0 }}>
      <div style={{ display: "flex", fontFamily: SERIF, fontWeight: 500, fontSize: ss, lineHeight: 1, color, textAlign: centrado ? "center" : "left" }}>{t.serif}</div>
      {t.script ? (
        <div style={{ display: "flex", fontFamily: SCRIPT, fontSize: sc, lineHeight: 1.12, color: colorScript, marginTop: -encime, marginLeft: centrado ? 0 : sangria, textAlign: centrado ? "center" : "left" }}>{t.script}</div>
      ) : null}
    </div>
  );
}

/** Título de lámina: frase en serif con la(s) palabra(s) de acento en cursiva y color, en la misma línea. */
export function TituloLamina({ t, ancho, color, colorAcento, max = 100, lineasMax = 3, italica = false }: { t: Titulo; ancho: number; color: string; colorAcento: string; max?: number; lineasMax?: number; italica?: boolean }) {
  const acento = t.acento ?? t.script ?? "";
  const todo = comillas([t.serif, acento].filter(Boolean).join(" "));
  const s = ajustar(todo, italica ? "serifItalica" : "serif", ancho, lineasMax, max, Math.round(max * 0.5));
  const nSerif = comillas(t.serif).split(/\s+/).filter(Boolean).length;
  const palabras = todo.split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: ancho, fontFamily: SERIF, fontWeight: 500, fontSize: s, lineHeight: 1.08, color }}>
      {palabras.map((w, i) => (
        <span key={i} style={{ marginRight: Math.round(s * 0.24), fontStyle: italica || i >= nSerif ? "italic" : "normal", color: i >= nSerif ? colorAcento : color }}>{w}</span>
      ))}
    </div>
  );
}

export function Texto({ children, color, size = 34, ancho, style }: { children: string; color: string; size?: number; ancho?: number; style?: React.CSSProperties }) {
  return <div style={{ display: "flex", fontFamily: SANS, fontSize: size, lineHeight: 1.5, color, flexShrink: 0, ...(ancho ? { width: ancho } : {}), ...style }}>{parrafo(children)}</div>;
}

export function Icono({ tipo, color, size = 46 }: { tipo: "si" | "no" | "punto"; color: string; size?: number }) {
  const d = tipo === "si" ? "M13 24 L20 31 L34 16" : tipo === "no" ? "M16 16 L31 31 M31 16 L16 31" : "M23.5 23.5 L23.6 23.6";
  return (
    <div style={{ display: "flex", width: size, height: size, borderRadius: size / 2, border: `2px solid ${color}`, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 47 47">
        <path d={d} stroke={color} strokeWidth={tipo === "punto" ? 9 : 3} strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

// ---------- Contexto de cada diseño ----------

/** Lo que un diseño necesita además del texto: fotos ya recortadas al hueco y el número para no repetir fotos. */
export type Ctx = { m: Marca; n: number; usaFoto: boolean; foto: (e: Etiqueta, w: number, h: number, o?: Opciones) => Promise<string>; propia: (w: number, h: number, o?: Opciones) => Promise<string | null> };

export function contexto(m: Marca, n: number, archivo?: string): Ctx {
  const c: Ctx = {
    m, n, usaFoto: false,
    foto: (e, w, h, o) => { c.usaFoto = true; return fotoStock(e, n, w, h, o, archivo); },
    propia: async (w, h, o) => { if (!m.foto) return null; c.usaFoto = true; try { return await fotoPropia(m.foto, w, h, o); } catch { return null; } },
  };
  return c;
}

export const Lienzo = ({ fondo, children, color }: { fondo: string; children: ReactNode; color?: string }) => (
  <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: fondo, color, fontFamily: SANS, overflow: "hidden" }}>{children}</div>
);
export const Abs = ({ style, children }: { style: React.CSSProperties; children?: ReactNode }) => <div style={{ position: "absolute", display: "flex", ...style }}>{children}</div>;
export const Img = ({ src, w, h, style }: { src: string; w: number; h: number; style: React.CSSProperties }) => <img src={src} width={w} height={h} style={{ position: "absolute", ...style }} />;
