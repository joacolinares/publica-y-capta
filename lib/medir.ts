// Mide texto con las mismas fuentes que usa satori, para elegir un tamaño que entre en el hueco sin cortarse.
import { readFileSync } from "node:fs";
import path from "node:path";
import opentype from "@shuding/opentype.js";

type Fuente = { getAdvanceWidth(t: string, size: number, o?: { kerning?: boolean }): number };
const ARCHIVOS = {
  serif: "CormorantGaramond-500.woff",
  serifItalica: "CormorantGaramond-500-italic.woff",
  script: "PinyonScript-400.woff",
  sans: "Montserrat-400.woff",
  sansNegrita: "Montserrat-600.woff",
  num: "PlayfairDisplay-700.woff",
} as const;
export type TipoLetra = keyof typeof ARCHIVOS;

const cargadas = new Map<TipoLetra, Fuente>();
function fuente(t: TipoLetra): Fuente {
  if (!cargadas.has(t)) {
    const b = readFileSync(path.join(process.cwd(), "fonts", ARCHIVOS[t]));
    cargadas.set(t, opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)) as Fuente);
  }
  return cargadas.get(t)!;
}

// Satori acomoda el texto sin kerning: medido igual, la línea parte donde la parte satori.
export const ancho = (texto: string, t: TipoLetra, size: number, espaciado = 0) =>
  fuente(t).getAdvanceWidth(texto, size, { kerning: false }) + espaciado * texto.length;
/** Satori redondea hacia arriba: un texto que entra justo se pasa a otro renglón. */
const cabe = (w: number, max: number) => w <= max - 1;

/** Corta en líneas por palabra, como satori (el espacio duro no parte). Devuelve las líneas. */
export function lineas(texto: string, t: TipoLetra, size: number, max: number, espaciado = 0) {
  const out: string[] = [];
  let actual = "";
  for (const p of texto.split(/[ \t\n]+/).filter(Boolean)) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (actual && !cabe(ancho(prueba, t, size, espaciado), max)) { out.push(actual); actual = p; } else actual = prueba;
  }
  if (actual) out.push(actual);
  return out;
}

/** El tamaño más grande entre `min` y `max` con el que el texto entra en `maxLineas` sin que ninguna palabra se salga. */
export function ajustar(texto: string, t: TipoLetra, anchoCaja: number, maxLineas: number, max: number, min: number, espaciado = 0) {
  for (let s = max; s > min; s = Math.floor(s * 0.96)) {
    const l = lineas(texto, t, s, anchoCaja, espaciado);
    if (l.length <= maxLineas && l.every((x) => cabe(ancho(x, t, s, espaciado), anchoCaja))) return s;
  }
  return min;
}
