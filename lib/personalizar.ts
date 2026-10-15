import type { Perfil } from "./perfil";
import textosBase from "@/content/textos.json";

export type Dia = (typeof textosBase)[number];
export const TEXTOS: Dia[] = textosBase;

const hashtag = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

/** Reemplaza los [corchetes] que salen del formulario. Los de cada propiedad ([precio], [X]...) quedan para el asesor. */
export function reemplazar(texto: string, p: Perfil): string {
  const col = p.colonias[0];
  const g = p.genero === "neutro" ? "o/a" : p.genero;
  const pares: [RegExp, string][] = [
    [/\[Tu nombre\]/gi, p.nombre],
    [/\[teléfono\]/gi, p.whatsapp],
    [/\[correo\]/gi, p.correo],
    [/\[Domicilio de tu oficina\]|\[domicilio\]/gi, p.domicilio],
    [/#\[tuciudad\]/gi, "#" + hashtag(p.ciudad)],
    [/ #\[tuzona\]/gi, hashtag(p.zona) === hashtag(p.ciudad) ? "" : " #" + hashtag(p.zona)],
    [/#\[tuzona\]/gi, "#" + hashtag(p.zona)],
    [/#\[colonia\]/gi, "#" + hashtag(col)],
    [/\[tuciudad\]/gi, hashtag(p.ciudad)],
    [/\[tu ciudad\]/gi, p.ciudad],
    [/\[colonia, ciudad\]/gi, `${col}, ${p.ciudad}`],
    [/\[colonia \/ tu zona\]/gi, col],
    [/\[tu zona\]/gi, p.zona],
    [/\[colonia\]/gi, col],
    [/\[X años\]/gi, anios(p.aniosExperiencia)],
    [/asesor\/a inmobiliario\/a/gi, g === "o/a" ? "asesor/a inmobiliario/a" : g === "a" ? "asesora inmobiliaria" : "asesor inmobiliario"],
    [/asesor\/a/gi, g === "o/a" ? "asesor/a" : g === "a" ? "asesora" : "asesor"],
  ];
  return pares.reduce((t, [re, v]) => t.replace(re, v), texto);
}

/** "8", "8 años" o "1" → "8 años" / "1 año"; vacío → "[X años]", para que el asesor lo complete (no se inventa experiencia). */
function anios(v: string) {
  const n = (v ?? "").trim().replace(/\s*años?\.?$/i, "");
  return !n ? "[X años]" : n === "1" ? "1 año" : `${n} años`;
}

/** Igual que reemplazar, pero deja [colonia] para completar: en propiedades, bump y kit es la colonia de la casa o del cliente. */
export const reemplazarSinColonia = (t: string, p: Perfil) =>
  reemplazar(t.replace(/\[colonia, ciudad\]/gi, "\u0000, [tu ciudad]").replace(/#\[colonia\]/gi, "#\u0001").replace(/\[colonia\]/gi, "\u0000"), p)
    .replace(/\u0001/g, "[colonia]").replace(/\u0000/g, "[colonia]");

/** Corchetes que siguen en el texto (los completa el asesor con cada propiedad). */
export const pendientes = (t: string) => [...new Set(t.match(/\[[^\]]+\]/g) ?? [])];

const PROHIBIDAS = [
  /\bel mejor\b/i, /\bla mejor\b/i, /\blos mejores\b/i, /\búnic[ao]s?\b/i, /\bgarantizad[ao]s?\b/i, /\bcertificad[ao]s?\b/i,
  /\boficial\b/i, /\bincreíble\b/i, /\bvos\b/i, /\btenés\b/i, /\bquerés\b/i, /\bpodés\b/i, /\balquil/i, /\bpiso\b/i,
];

/** Chequeo final de cada texto que sale de la app. Devuelve los problemas encontrados. */
export function revisar(t: string): string[] {
  return PROHIBIDAS.filter((re) => re.test(t)).map((re) => re.source);
}
