/* eslint-disable @next/next/no-img-element */
// Arma las imágenes de la página de venta y de /entrar con diseños reales del pack (marca de ejemplo).
// Uso: npx tsx scripts/imagenes-web.tsx   → public/web/*.webp, app/icon.png, app/apple-icon.png, app/opengraph-image.jpg
// Se vuelve a correr cuando cambian los diseños o las fotos, para que la página muestre lo que el pack trae de verdad.
import React from "react";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { catalogo, prepararMarca, MEDIDAS, type Pieza } from "../lib/disenos";
import { PERFIL_EJEMPLO } from "../lib/perfil";
import { reemplazar } from "../lib/personalizar";
import { historiaPropiedad, postPropiedad, PropiedadSchema } from "../lib/propiedad";
import { imagen, png } from "../lib/render";
import { stock } from "../lib/fotos";
import { NEUTROS } from "../lib/estilo";

const WEB = path.join(process.cwd(), "public/web");
const APP = path.join(process.cwd(), "app");
mkdirSync(WEB, { recursive: true });

const m = await prepararMarca(PERFIL_EJEMPLO);
const piezas = catalogo((t) => reemplazar(t, PERFIL_EJEMPLO));
const cache = new Map<string, Buffer>();

async function render(p: Pieza, n: number) {
  if (!cache.has(p.id)) {
    const { el, conFoto } = await p.armar(m, n);
    const { width, height } = MEDIDAS[p.formato];
    cache.set(p.id, (await imagen(el, width, height, conFoto)).buf);
  }
  return cache.get(p.id)!;
}
const pieza = (id: string) => {
  const i = piezas.findIndex((p) => p.id === id);
  if (i < 0) throw new Error(`No existe la pieza ${id}`);
  return render(piezas[i], i);
};

// Propiedad de ejemplo con una foto de fachada del banco de fotos.
const dirFotos = process.env.FOTOS_DIR || path.join(process.cwd(), "fotos");
const fachada = readFileSync(path.join(dirFotos, stock("fachada", 0).archivo));
const prop = PropiedadSchema.parse({
  operacion: "venta", etiqueta: "Recién captada", tipo: "Casa", colonia: "Ciudad Granja", recamaras: "3", banos: "2.5", m2: "180", precio: "4250000",
  caracteristicas: ["Cocina integral", "Jardín", "2 lugares de estacionamiento"], creditos: ["bancario", "Infonavit"],
  foto: `data:image/jpeg;base64,${(await sharp(fachada).resize(1400, 1400, { fit: "inside" }).jpeg({ quality: 86 }).toBuffer()).toString("base64")}`,
});
async function propiedad(tipo: "post" | "historia") {
  const { el, conFoto } = await (tipo === "post" ? postPropiedad : historiaPropiedad)(m, prop);
  const f = tipo === "post" ? MEDIDAS.feed : MEDIDAS.story;
  return (await imagen(el, f.width, f.height, conFoto)).buf;
}

const webp = (b: Buffer, w: number, out: string, q = 82) => sharp(b).resize({ width: w }).webp({ quality: q }).toFile(path.join(WEB, out));

/** Diseño girado con sombra suave, listo para encimar en un collage. */
async function tarjeta(buf: Buffer, ancho: number, grados: number) {
  const img = await sharp(buf).resize({ width: ancho }).png().toBuffer();
  const { width = ancho, height = ancho } = await sharp(img).metadata();
  const pad = 60;
  // sharp aplica el blur antes del composite: la sombra se arma en un paso y se desenfoca en otro.
  const base = await sharp({ create: { width: width + pad * 2, height: height + pad * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: { create: { width, height, channels: 4, background: { r: 43, g: 42, b: 40, alpha: 0.2 } } }, left: pad, top: pad + 16 }])
    .png().toBuffer();
  const sombra = await sharp(base).blur(20).png().toBuffer();
  const junto = await sharp(sombra).composite([{ input: img, left: pad, top: pad }]).png().toBuffer();
  return sharp(junto).rotate(grados, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

async function lienzo(w: number, h: number, fondo: string, capas: { input: Buffer; left: number; top: number }[]) {
  return sharp({ create: { width: w, height: h, channels: 4, background: fondo } }).composite(capas).png().toBuffer();
}

// 1. Portada de la landing: historia, carrusel y post encimados.
const historia = await pieza("story-1");
const portada = await pieza("dia-02-1");
const post = await pieza("dia-09");
const [tH, tC, tP] = await Promise.all([tarjeta(historia, 380, -6), tarjeta(portada, 560, 0), tarjeta(post, 420, 5)]);
const hero = await lienzo(1200, 990, NEUTROS.crema, [
  { input: tH, left: 0, top: 170 },
  { input: tP, left: 700, top: 300 },
  { input: tC, left: 270, top: 40 },
]);
await webp(hero, 1200, "hero.webp", 84);

// 2. Muestras para la tira de "Así se ve por dentro" (las 5 y 8 son verticales).
const muestras = [
  await pieza("dia-08-1"), await pieza("dia-08-2"), await pieza("dia-26-1"), await pieza("dia-02-5"),
  await pieza("story-2"), await pieza("dia-01"), await propiedad("post"), await propiedad("historia"),
];
for (const [i, b] of muestras.entries()) await webp(b, 540, `muestra-${i + 1}.webp`);
await webp(post, 540, "muestra-post.webp");

// 3. Perfil: grilla de 3x3 con diseños del feed.
const feed = ["dia-01", "dia-02-1", "dia-03", "dia-06", "dia-08-1", "dia-09", "dia-10-1", "dia-11", "dia-15-1"];
const T = { w: 356, h: 445, g: 6 };
const tiles = await Promise.all(feed.map(async (id) => sharp(await pieza(id)).resize(T.w, T.h).png().toBuffer()));
const perfil = await lienzo(T.w * 3 + T.g * 2, T.h * 3 + T.g * 2, NEUTROS.blanco, tiles.map((input, k) => ({ input, left: (k % 3) * (T.w + T.g), top: Math.floor(k / 3) * (T.h + T.g) })));
await webp(perfil, 1080, "perfil.webp");

// 4. Lado izquierdo de /entrar: dos columnas de diseños desfasadas sobre arena.
const col = ["dia-02-1", "dia-26-1", "story-1", "dia-10-1", "dia-08-2", "story-2", "dia-15-1", "dia-17"];
const ancho = 520;
const mini = await Promise.all(col.map(async (id) => sharp(await pieza(id)).resize({ width: ancho }).png().toBuffer()));
const capas: { input: Buffer; left: number; top: number }[] = [];
const alto = [-180, 60];
for (const [k, b] of mini.entries()) {
  const c = k % 2, { height = 650 } = await sharp(b).metadata();
  capas.push({ input: b, left: 60 + c * (ancho + 40), top: alto[c] });
  alto[c] += height + 40;
}
const entrar = await lienzo(1200, 1800, NEUTROS.arena, capas.filter((x) => x.top < 1800));
await webp(entrar, 1200, "entrar.webp", 80);

// 5. Ícono y vista para compartir.
const SERIF = "Cormorant";
function Monograma({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", width: size, height: size, background: NEUTROS.crema, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", width: size * 0.86, height: size * 0.86, borderRadius: size, border: `${Math.max(2, size / 90)}px solid ${NEUTROS.carbon}`, alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 600, fontSize: size * 0.36, color: NEUTROS.carbon }}>
        <span>P</span><span style={{ fontStyle: "italic", color: "#56624A" }}>y</span><span>C</span>
      </div>
    </div>
  );
}
writeFileSync(path.join(APP, "icon.png"), await png(<Monograma size={512} />, 512, 512));
writeFileSync(path.join(APP, "apple-icon.png"), await png(<Monograma size={180} />, 180, 180));

const og = await tarjeta(portada, 340, 3);
const ogH = await tarjeta(historia, 250, -7);
const texto = await png(
  <div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, background: NEUTROS.crema, padding: "70px 76px", fontFamily: SERIF }}>
    <div style={{ display: "flex", fontFamily: "Montserrat", fontWeight: 600, fontSize: 18, letterSpacing: 5.4, textTransform: "uppercase", color: NEUTROS.carbon }}>Publica y Capta</div>
    <div style={{ display: "flex", flexDirection: "column", marginTop: 54, fontSize: 76, lineHeight: 1.02, color: NEUTROS.carbon, width: 620 }}>
      <span>90 días de contenido</span><span style={{ fontStyle: "italic", color: "#56624A" }}>con tu marca</span>
    </div>
    <div style={{ display: "flex", marginTop: 34, fontFamily: "Montserrat", fontSize: 24, lineHeight: 1.5, color: "#3E3C38", width: 560 }}>90 publicaciones, 40 diseños y 30 guiones de reels para asesores inmobiliarios.</div>
  </div>, 1200, 630);
const ogFinal = await sharp(texto).composite([{ input: ogH, left: 640, top: 150 }, { input: og, left: 800, top: 20 }]).jpeg({ quality: 86 }).toBuffer();
writeFileSync(path.join(APP, "opengraph-image.jpg"), ogFinal);
writeFileSync(path.join(APP, "opengraph-image.alt.txt"), "Publica y Capta: 90 días de contenido con tu marca para asesores inmobiliarios");
console.log("Listo:", WEB);
