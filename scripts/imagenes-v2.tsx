// Imágenes de /v2 con una segunda marca de ejemplo (otro color) para mostrar que todo sale con los colores del asesor.
// Uso: FOTOS_DIR=fotos npx tsx scripts/imagenes-v2.tsx   → public/web/v2/*.webp
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { catalogo, prepararMarca, MEDIDAS, type Pieza } from "../lib/disenos";
import type { Perfil } from "../lib/perfil";
import { reemplazar } from "../lib/personalizar";
import { imagen } from "../lib/render";
import { NEUTROS } from "../lib/estilo";

const SALIDA = path.join(process.cwd(), "public/web/v2");
mkdirSync(SALIDA, { recursive: true });

// Datos claramente ficticios: salen en imágenes públicas.
const PERFIL_V2: Perfil = {
  nombre: "Andrea Ruiz",
  nombreComercial: "Andrea Ruiz Inmobiliaria",
  whatsapp: "81 0000 0000",
  correo: "andrea@example.com",
  domicilio: "Av. Ejemplo 200, Monterrey, N.L.",
  ciudad: "Monterrey",
  zona: "Monterrey",
  colonias: ["Cumbres", "Contry", "Del Valle"],
  colorPrincipal: "#1F5E4F",
  colorAcento: "#A9D6C5",
  especialidad: "ambas",
  cliente: "mixto",
  tono: "cercano",
  genero: "a",
  aniosExperiencia: "6",
  historia: "",
  usuarioRedes: "@andrea.ejemplo",
};

const m = await prepararMarca(PERFIL_V2);
const piezas = catalogo((t) => reemplazar(t, PERFIL_V2));

async function pieza(id: string) {
  const i = piezas.findIndex((p) => p.id === id);
  if (i < 0) throw new Error(`No existe la pieza ${id}`);
  const p: Pieza = piezas[i];
  const { el, conFoto } = await p.armar(m, i);
  const { width, height } = MEDIDAS[p.formato];
  return (await imagen(el, width, height, conFoto)).buf;
}

const webp = (b: Buffer, w: number, out: string, q = 80) => sharp(b).resize({ width: w }).webp({ quality: q }).toFile(path.join(SALIDA, out));

// Perfil 3x3 con las mismas piezas que public/web/perfil.webp, para compararlos lado a lado.
const feed = ["dia-01", "dia-02-1", "dia-03", "dia-06", "dia-08-1", "dia-09", "dia-10-1", "dia-11", "dia-15-1"];
const T = { w: 356, h: 445, g: 6 };
const tiles = await Promise.all(feed.map(async (id) => sharp(await pieza(id)).resize(T.w, T.h).png().toBuffer()));
const perfil = await sharp({ create: { width: T.w * 3 + T.g * 2, height: T.h * 3 + T.g * 2, channels: 4, background: NEUTROS.blanco } })
  .composite(tiles.map((input, k) => ({ input, left: (k % 3) * (T.w + T.g), top: Math.floor(k / 3) * (T.h + T.g) })))
  .png().toBuffer();
await webp(perfil, 1080, "perfil.webp");

// Piezas sueltas para las galerías: portadas de carrusel, posts y una historia.
const sueltas: [string, string, number][] = [
  ["dia-20-1", "carrusel-1.webp", 540], ["dia-28-1", "carrusel-2.webp", 540], ["dia-42-1", "carrusel-3.webp", 540],
  ["dia-40", "post-1.webp", 540], ["dia-52", "post-2.webp", 540], ["story-6", "historia-1.webp", 540],
];
for (const [id, out, w] of sueltas) await webp(await pieza(id), w, out);
console.log("Listo:", SALIDA);
