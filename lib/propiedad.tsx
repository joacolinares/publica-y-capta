/* eslint-disable @next/next/no-img-element */
// Generador de posts para cada propiedad nueva, en post (4:5) e historia (9:16), con el estilo de la guía visual.
// En venta lleva el bloque de datos que pide la NOM-247-SE-2021: nombre, domicilio, teléfono, correo y precio en pesos.
import React from "react";
import { z } from "zod";
import { NUM, SANS, SERIF } from "./estilo";
import { fotoPropia } from "./fotos";
import { ancho as medirAncho, lineas } from "./medir";
import { Abs, Boton, Cap, Firma, Img, Lienzo, Monograma, TituloPortada, contexto, type Ctx, type Marca } from "./piezas";

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

const precioDe = (x: Propiedad) => `$${fmt(x.precio)} MXN${x.operacion === "renta" ? " al mes" : ""}`;
const datosDe = (x: Propiedad) => [x.recamaras && `${x.recamaras} ${x.recamaras === "1" ? "recámara" : "recámaras"}`, x.banos && `${x.banos} ${x.banos === "1" ? "baño" : "baños"}`, x.m2 && `${x.m2} m²`].filter(Boolean) as string[];
const corto = (tipo: Propiedad["tipo"]) => (tipo === "Departamento" ? "Depa" : tipo);
const cerrada = (x: Propiedad) => x.etiqueta === "Vendida" || x.etiqueta === "Rentada";
/** "Vendida" o "Vendido" según el tipo (casa, departamento, terreno, local). */
const palabraCierre = (x: Propiedad) => {
  const fem = x.tipo === "Casa";
  return x.etiqueta === "Vendida" ? (fem ? "Vendida" : "Vendido") : fem ? "Rentada" : "Rentado";
};

/** Foto de la propiedad recortada al hueco. Sin foto no se usa una de stock: sería mostrar otra casa. */
async function fotoDe(c: Ctx, x: Propiedad, w: number, h: number, oscurecer = 0) {
  if (!x.foto) return null;
  c.usaFoto = true;
  try { return await fotoPropia(x.foto, w, h, { oscurecer }); } catch { return null; }
}

/** `arriba`: espacio que se deja abajo, para que el monograma no quede detrás del título. */
function SinFoto({ c, w, h, arriba = 0 }: { c: Ctx; w: number; h: number; arriba?: number }) {
  return (
    <div style={{ display: "flex", width: w, height: h, background: c.m.e.arena, alignItems: "center", justifyContent: "center", ...(arriba ? { paddingBottom: arriba } : {}) }}>
      <Monograma m={c.m} size={180} color={c.m.e.topo} />
    </div>
  );
}

const rolDe = (g: string) => (g === "a" ? "Asesora inmobiliaria" : g === "o" ? "Asesor inmobiliario" : "Asesoría inmobiliaria");
const domicilioNom = (c: Ctx, x: Propiedad) => `${c.m.perfil.domicilio}${x.operacion === "venta" && !cerrada(x) ? " · Precio en pesos mexicanos" : ""}`;
const cabeJunto = (nombre: string, resto: string) => medirAncho(nombre, "sansNegrita", 21, 0.6) + 8 + medirAncho(`· ${resto}`, "sans", 21, 0.6) <= 920 - 1;

/** Renglones del bloque NOM, medidos como los corta satori. El nombre comercial va solo si el primer renglón sigue entrando en una línea. */
function armarNom(c: Ctx, x: Propiedad) {
  const P = c.m.perfil;
  const contacto = `${rolDe(P.genero)} · Tel. ${P.whatsapp} · ${P.correo}`;
  const conComercial = P.nombreComercial ? `${P.nombreComercial} · ${contacto}` : "";
  const resto = conComercial && cabeJunto(P.nombre, conComercial) ? conComercial : contacto;
  const juntos = cabeJunto(P.nombre, resto);
  const l1 = juntos ? 1 : 1 + lineas(resto, "sans", 21, 920, 0.6).length;
  const l2 = lineas(domicilioNom(c, x), "sans", 21, 920, 0.6).length;
  return { resto, juntos, alto: 48 + 31.5 * (l1 + l2) };
}
const altoNom = (c: Ctx, x: Propiedad) => armarNom(c, x).alto;

/** Bloque de la NOM-247: quién anuncia y cómo contactarlo. En venta agrega "Precio en pesos mexicanos". */
function Nom({ c, x, abajo = 0, alto }: { c: Ctx; x: Propiedad; abajo?: number; alto?: number }) {
  const P = c.m.perfil, e = c.m.e;
  const { resto, juntos } = armarNom(c, x);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: abajo, ...(alto ? { height: alto } : {}), display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 80px", background: e.carbon, color: e.arena, fontFamily: SANS, fontSize: 21, lineHeight: 1.5, letterSpacing: 0.6 }}>
      <div style={{ display: "flex", flexDirection: juntos ? "row" : "column" }}>
        <span style={{ color: e.blanco, fontWeight: 600, ...(juntos ? { marginRight: 8 } : {}) }}>{P.nombre}</span>
        <span>{juntos ? `· ${resto}` : resto}</span>
      </div>
      <span>{domicilioNom(c, x)}</span>
    </div>
  );
}

/** "En venta · colonia, ciudad" en una línea; si la colonia es muy larga (ya va en el título), solo la ciudad. */
const capUbicacion = (c: Ctx, x: Propiedad) => {
  const t = `En ${x.operacion} · ${ubicacion(c, x)}`;
  return medirAncho(t.toUpperCase(), "sansNegrita", 18, 18 * 0.3) <= 920 ? t : `En ${x.operacion} · ${c.m.perfil.ciudad}`;
};

function Datos({ c, x, color, size = 24 }: { c: Ctx; x: Propiedad; color: string; size?: number }) {
  const d = datosDe(x);
  if (!d.length) return null;
  return (
    <div style={{ display: "flex", gap: 40, fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: size * 0.18, textTransform: "uppercase", color }}>
      {d.map((t) => <span key={t}>{t}</span>)}
    </div>
  );
}

const ubicacion = (c: Ctx, x: Propiedad) => `${x.colonia}, ${c.m.perfil.ciudad}`;

// ---------- Post 1080x1350 ----------

/** Recién captada / Nueva en mi zona: foto arriba, datos abajo (como una ficha). */
async function PostFicha(c: Ctx, x: Propiedad) {
  const e = c.m.e;
  const foto = await fotoDe(c, x, 1080, 720);
  const an = altoNom(c, x);
  return (
    <Lienzo fondo={e.crema} color={e.carbon}>
      {foto ? <Img src={foto} w={1080} h={720} style={{ left: 0, top: 0 }} /> : <Abs style={{ left: 0, top: 0 }}><SinFoto c={c} w={1080} h={720} /></Abs>}
      <Abs style={{ left: 80, top: 80, background: e.crema, padding: "16px 26px" }}><Cap color={e.carbon} size={22}>{x.etiqueta}</Cap></Abs>
      <Abs style={{ right: 80, top: 70 }}><Firma m={c.m} tono="oscuro" alto={78} /></Abs>
      <Abs style={{ left: 80, right: 80, top: 740, bottom: an + 24, flexDirection: "column", justifyContent: "center" }}>
        <Cap color={e.topoTexto} size={22} max={920}>{capUbicacion(c, x)}</Cap>
        <div style={{ display: "flex", marginTop: 18 }}>
          <TituloPortada t={{ serif: `${corto(x.tipo)} en`, script: x.colonia }} ancho={920} color={e.carbon} colorScript={e.acento} serifMax={92} serifLineas={1} sangria={90} scriptMax={124} alto={1350 - 740 - an - 24 - 30 - 18 - 26 - 72 - 20 - 32} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
          <div style={{ display: "flex", fontFamily: NUM, fontWeight: 700, fontSize: 54, color: e.carbon }}>{precioDe(x)}</div>
        </div>
        <div style={{ display: "flex", marginTop: 20 }}><Datos c={c} x={x} color={e.topoTexto} /></div>
      </Abs>
      <Nom c={c} x={x} />
    </Lienzo>
  );
}

/** Precio actualizado: fondo carbón y la foto a la derecha. */
async function PostPrecio(c: Ctx, x: Propiedad) {
  const e = c.m.e;
  const foto = await fotoDe(c, x, 540, 1230);
  const an = altoNom(c, x);
  return (
    <Lienzo fondo={e.carbon} color={e.blanco}>
      {foto ? <Img src={foto} w={540} h={1230} style={{ right: 0, top: 0 }} /> : <Abs style={{ right: 0, top: 0 }}><SinFoto c={c} w={540} h={1230} /></Abs>}
      <Abs style={{ left: 80, top: 96, width: 400, flexDirection: "column", gap: 12 }}>
        <Cap color={e.arena} size={22}>{corto(x.tipo)}</Cap>
        <Cap color={e.arena} size={22}>{x.colonia}</Cap>
      </Abs>
      <Abs style={{ left: 80, top: 260, width: 420, height: Math.min(800, 1350 - 260 - an - 30 - 64 - 24), flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", fontFamily: "Pinyon", fontSize: 140, lineHeight: 1.1, color: e.acentoOscuro }}>Nuevo</div>
        <div style={{ display: "flex", fontFamily: SERIF, fontWeight: 500, fontSize: 150, lineHeight: 1, marginTop: -24 }}>precio</div>
        <div style={{ display: "flex", width: 120, height: 2, background: e.arena, margin: "44px 0", opacity: 0.6 }} />
        <div style={{ display: "flex", fontFamily: NUM, fontWeight: 700, fontSize: precioDe(x).length > 16 ? 44 : 52, color: e.blanco }}>{precioDe(x)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
          {datosDe(x).map((t) => <span key={t} style={{ fontFamily: SANS, fontSize: 26, color: e.arena }}>{t}</span>)}
        </div>
      </Abs>
      <Abs style={{ left: 80, bottom: an + 30 }}><Firma m={c.m} tono="oscuro" alto={64} /></Abs>
      <Nom c={c} x={x} />
    </Lienzo>
  );
}

/** Vendida / Rentada: foto completa con velo oscuro, marco fino y la palabra en manuscrita. */
async function PostCierre(c: Ctx, x: Propiedad) {
  const e = c.m.e;
  const foto = await fotoDe(c, x, 1080, 1230, 0.35);
  const an = altoNom(c, x);
  return (
    <Lienzo fondo={e.carbon} color={e.blanco}>
      {foto ? <Img src={foto} w={1080} h={1230} style={{ left: 0, top: 0 }} /> : null}
      <Abs style={{ left: 70, top: 70, right: 70, bottom: an + 79, border: "2px solid rgba(255,253,249,0.7)" }} />
      <Abs style={{ left: 120, right: 120, top: 120, bottom: an + 129, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Cap color={e.blanco} size={24}>{x.etiqueta === "Vendida" ? "Otra familia con llaves nuevas" : "Un hogar nuevo para alguien"}</Cap>
        <div style={{ display: "flex", fontFamily: "Pinyon", fontSize: 230, lineHeight: 1.15, marginTop: 20, color: e.blanco }}>{palabraCierre(x)}</div>
        <div style={{ display: "flex", fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 48, marginTop: 6, color: e.arena }}>{`${corto(x.tipo)} en ${x.colonia}`}</div>
        <div style={{ display: "flex", fontFamily: SANS, fontSize: 30, marginTop: 30, color: e.blanco, opacity: 0.92 }}>Gracias por la confianza. ¿La siguiente es la tuya?</div>
        <div style={{ display: "flex", marginTop: 40 }}><Firma m={c.m} tono="oscuro" alto={72} /></div>
      </Abs>
      <Nom c={c} x={x} />
    </Lienzo>
  );
}

/** El diseño del post (1080x1350). */
export async function postPropiedad(m: Marca, x: Propiedad) {
  const c = contexto(m, 0);
  const el = cerrada(x) ? await PostCierre(c, x) : x.etiqueta === "Precio actualizado" ? await PostPrecio(c, x) : await PostFicha(c, x);
  return { el, conFoto: c.usaFoto };
}

// ---------- Historia 1080x1920 ----------

/** La misma propiedad en historia: foto completa, título y datos en la zona segura, y el bloque NOM arriba de la barra de respuesta. */
export async function historiaPropiedad(m: Marca, x: Propiedad) {
  const c = contexto(m, 0);
  const e = m.e;
  const foto = await fotoDe(c, x, 1080, 1920, cerrada(x) ? 0.3 : 0);
  const titulo = cerrada(x) ? { serif: `${corto(x.tipo)} en ${x.colonia}`, script: palabraCierre(x) } : { serif: `${corto(x.tipo)} en`, script: x.colonia };
  const an = altoNom(c, x);
  // El bloque va pegado arriba del NOM; el título se achica para no subir a la parte clara de la foto.
  const libre = 1920 - 230 - an - 30 - 760 - (cerrada(x) ? 0 : 48 + 26 + 74 + 20 + 30 + 30 + 70);
  const el = (
    <Lienzo fondo={e.carbon} color={e.blanco}>
      {foto ? <Img src={foto} w={1080} h={1920} style={{ left: 0, top: 0 }} /> : <Abs style={{ left: 0, top: 0 }}><SinFoto c={c} w={1080} h={1920} arriba={900} /></Abs>}
      <Abs style={{ left: 0, top: 0, width: 1080, height: 1920, backgroundImage: "linear-gradient(180deg, rgba(43,42,40,0.6) 0%, rgba(43,42,40,0.35) 14%, rgba(43,42,40,0) 24%, rgba(43,42,40,0) 35%, rgba(43,42,40,0.75) 52%, rgba(43,42,40,0.95) 75%)" }} />
      <Abs style={{ left: 80, right: 80, top: 230, justifyContent: "space-between", alignItems: "center" }}>
        {/* Con fondo, como en el post: sobre un cielo claro el texto blanco solo no se lee. */}
        <div style={{ display: "flex", background: e.crema, padding: "14px 24px" }}><Cap color={e.carbon} size={22}>{x.etiqueta}</Cap></div>
        <Firma m={m} tono="oscuro" alto={72} />
      </Abs>
      <Abs style={{ left: 80, right: 80, bottom: 230 + an + 30, flexDirection: "column" }}>
        {!cerrada(x) ? <Cap color={e.arena} size={22} max={920} style={{ marginBottom: 18 }}>{`En ${x.operacion} · ${m.perfil.ciudad}`}</Cap> : null}
        <TituloPortada t={titulo} ancho={920} color={e.blanco} colorScript={e.acentoOscuro} serifMax={cerrada(x) ? 70 : 120} serifLineas={cerrada(x) ? 2 : 1} sangria={cerrada(x) ? 0 : 90} scriptMax={cerrada(x) ? 200 : 160} alto={cerrada(x) ? libre : Math.min(300, libre)} />
        {!cerrada(x) ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 26 }}>
            <div style={{ display: "flex", fontFamily: NUM, fontWeight: 700, fontSize: 56 }}>{precioDe(x)}</div>
            <Datos c={c} x={x} color={e.arena} size={24} />
          </div>
        ) : null}
        {!cerrada(x) ? <div style={{ display: "flex", marginTop: 30 }}><Boton texto='Escríbeme "INFO"' color={e.blanco} /></div> : null}
      </Abs>
      <Nom c={c} x={x} abajo={230} />
    </Lienzo>
  );
  return { el, conFoto: c.usaFoto };
}

/** Texto del post que acompaña al diseño. */
export function textoPropiedad(m: Marca, x: Propiedad) {
  const P = m.perfil;
  const tag = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const quien = `${P.nombre}${P.nombreComercial ? ` (${P.nombreComercial})` : ""}`;
  if (cerrada(x)) {
    return [
      `🔑 ¡${palabraCierre(x)}! ${x.tipo} en ${x.colonia}, ${P.ciudad}`,
      "",
      "Gracias a los dueños por su confianza.",
      "",
      `¿Quieres ${x.etiqueta === "Vendida" ? "vender" : "rentar"} tu propiedad en ${P.zona}? Escríbeme: ${quien} · ${P.whatsapp}`,
      "",
      `#${tag(x.colonia)} #${tag(P.ciudad)} #bienesraices`,
    ].join("\n");
  }
  const precio = precioDe(x);
  const feats = datosDe(x).join(", ");
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
    lineas.push("Si compras con crédito, el precio total depende de los montos del crédito y de los gastos notariales; consúltalos con nosotros.");
  }
  lineas.push("", `Agenda tu visita: ${quien} · ${P.whatsapp} · ${P.correo}`, P.domicilio);
  lineas.push("", `#${x.tipo === "Departamento" ? "depa" : tag(x.tipo)}en${x.operacion} #${tag(x.colonia)} #${tag(P.ciudad)} #bienesraices`);
  return lineas.join("\n");
}
