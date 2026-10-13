import JSZip from "jszip";
import type { Perfil } from "./perfil";
import { TEXTOS, reemplazar, reemplazarSinColonia, pendientes, revisar } from "./personalizar";
import { mdAHtml } from "./md";
import { adaptarConIA } from "./ia";
import { catalogo, elemento, marca, MEDIDAS } from "./disenos";
import { png } from "./render";
import { bonos, bump, guionesExtra, upsell } from "./extras";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Nombre de archivo ASCII de hasta 50 caracteres, cortado en una palabra completa.
const slug = (s: string) => {
  const t = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  return t.length <= 50 ? t : t.slice(0, 51).replace(/\s+\S*$/, "");
};
const dd = (n: number) => String(n).padStart(2, "0");

export function pagina(titulo: string, cuerpo: string, color: string) {
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:0 auto;padding:24px 18px 60px;color:#14201E;line-height:1.55;background:#fff}
h1{color:${color};font-size:28px}h2{color:${color};margin-top:36px;font-size:21px}.post{white-space:pre-wrap;background:#F4F6F5;border-radius:12px;padding:16px;margin:10px 0}
mark{background:#FFF3C4;padding:0 2px;border-radius:3px}hr{border:0;border-top:1px solid #DDE3E1;margin:28px 0}h3,h4{margin:22px 0 6px}
.wa{white-space:pre-wrap;background:#E7F6EC;border-radius:12px;padding:12px 16px}.meta{color:#55625F;font-size:14px}table{border-collapse:collapse;width:100%;font-size:15px}td,th{border-bottom:1px solid #DDE3E1;padding:8px;text-align:left;vertical-align:top}
.paso{display:flex;gap:14px;margin:14px 0}.n{flex:0 0 38px;height:38px;border-radius:19px;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}</style></head><body>${cuerpo}</body></html>`;
}

export type Opciones = { usarIA?: boolean; logo?: string; foto?: string; bump?: boolean; upsell?: boolean };

export async function armarPaquete(perfil: Perfil, op: Opciones = {}) {
  const m = marca(perfil, op.logo, op.foto);
  const color = m.pal.principal;
  const zip = new JSZip();

  // 1. Textos: IA solo para los días no técnicos; después, los datos del formulario.
  const ia = op.usarIA ? await adaptarConIA(TEXTOS, perfil) : new Map();
  const dias = TEXTOS.map((d) => {
    const base = ia.get(d.dia) ?? { post: d.post, whatsapp: d.whatsapp };
    // En los días de propiedad, [colonia] es la de la casa: se deja para completar.
    const r = d.publico === "Propiedad" ? reemplazarSinColonia : reemplazar;
    const post = r(base.post, perfil);
    const whatsapp = r(base.whatsapp, perfil);
    const story = d.story ? r(d.story, perfil).replace(/^Story\s*(\(Diseño \d+\))?:\s*/i, "") : "";
    return { ...d, tema: r(d.tema, perfil), post, whatsapp, story, guion: r(d.guion, perfil), adaptado: ia.has(d.dia), faltan: pendientes(post + "\n" + whatsapp) };
  });
  const alertas = dias.flatMap((d) => revisar(d.post + d.whatsapp).map((r) => `Día ${d.dia}: ${r}`));

  // 2. Diseños
  const piezas = catalogo((t) => reemplazar(t, perfil));
  const disenoDe = new Map<number, string>();
  for (const p of piezas) {
    const { width, height } = MEDIDAS[p.formato];
    const nombre = `${p.dia ? `Dia ${dd(p.dia)}` : p.id} - ${slug(p.datos.titulo)}.png`;
    zip.file(`03 Disenos/${nombre}`, await png(elemento(p, m), width, height));
    if (p.dia) disenoDe.set(p.dia, nombre);
  }

  // 3. Publicaciones: un archivo por día (fácil de copiar en el celular) + todas juntas
  for (const d of dias) {
    const extra = d.faltan.length ? `\n\n— Completa antes de publicar: ${d.faltan.join(", ")}` : "";
    zip.file(`02 Publicaciones/Dia ${dd(d.dia)} - ${slug(d.tema)}.txt`, `${d.post}\n\n— Estado de WhatsApp —\n${d.whatsapp}${d.story ? `\n\n— Story —\n${d.story}` : ""}${extra}\n`);
  }
  zip.file("02 Publicaciones/Todas las publicaciones.html", pagina("90 publicaciones", `<h1>Tus 90 publicaciones</h1>` + dias.map((d) =>
    `<h2>Día ${d.dia} · ${esc(d.publico)} · ${esc(d.tema)}</h2><p class="meta">${esc(d.formato)}${disenoDe.has(d.dia) ? ` · Diseño: ${esc(disenoDe.get(d.dia)!)}` : d.publico === "Propiedad" ? " · Arma el diseño en la app con la opción Nueva propiedad" : ""}</p>
<div class="post">${esc(d.post)}</div><p class="meta">Estado de WhatsApp</p><div class="wa">${esc(d.whatsapp)}</div>${d.story ? `<p class="meta">Story</p><div class="wa">${esc(d.story)}</div>` : ""}${d.nota ? `<p class="meta">Nota: ${esc(d.nota)}</p>` : ""}`).join(""), color));

  // 4. Calendario
  const fila = (c: string[]) => c.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
  const csv = [fila(["Día", "Público", "Tema", "Formato", "Diseño", "¿Publicado?"]), ...dias.map((d) => fila([String(d.dia), d.publico, d.tema, d.formato, disenoDe.get(d.dia) ?? (d.publico === "Propiedad" ? "Nueva propiedad (app)" : "Tu foto o video"), ""]))].join("\r\n");
  zip.file("01 Calendario 90 dias.csv", "﻿" + csv);
  zip.file("01 Calendario 90 dias.html", pagina("Calendario", `<h1>Tu calendario de 90 días</h1><p>Empieza el Día 1 el día que quieras. Si un día no puedes, sigue con el siguiente: no hace falta ponerse al corriente.</p><table><tr><th>Día</th><th>Público</th><th>Tema</th><th>Formato</th></tr>${dias.map((d) => `<tr><td>${d.dia}</td><td>${esc(d.publico)}</td><td>${esc(d.tema)}</td><td>${esc(d.formato)}</td></tr>`).join("")}</table>`, color));

  // 5. Guiones
  const conGuion = dias.filter((d) => d.guion);
  const extra = guionesExtra(perfil);
  const nExtra = (extra.match(/<h3>Extra \d+/g) ?? []).length;
  zip.file("04 Guiones de reels.html", pagina("Guiones", `<h1>Guiones para reels</h1><p>Graba con el celular en vertical. Las tomas de 2 a 3 segundos funcionan mejor.</p>` + conGuion.map((d) => `<h2>Día ${d.dia} · ${esc(d.tema)}</h2>${mdAHtml(d.guion)}`).join("") + (extra ? `<h1 style="margin-top:48px">${nExtra} guiones extra</h1>${extra}` : ""), color));

  // 6. Bonos, bump y upsell
  const bs = bonos(perfil);
  bs.forEach((b, i) => zip.file(`05 Bonos/${i + 1} ${slug(b.titulo)}.html`, pagina(b.titulo, `<h1>${esc(b.titulo)}</h1>${b.html}`, color)));
  if (op.bump) zip.file("06 Del mensaje a la visita.html", pagina("Del mensaje a la visita", `<h1>Del mensaje a la visita: 50 respuestas de WhatsApp</h1>${bump(perfil)}`, color));
  const kit = op.upsell ? upsell(perfil, m.pal) : null;
  if (kit) {
    zip.file("07 Kit Captacion Exclusiva/1 Presentacion de captacion.html", kit.presentacion);
    kit.resto.forEach((s, i) => zip.file(`07 Kit Captacion Exclusiva/${i + 2} ${slug(s.titulo)}.html`, pagina(s.titulo, `<h1>${esc(s.titulo)}</h1>${s.html}`, color)));
  }

  // 7. Empieza aquí
  zip.file("00 EMPIEZA AQUI.html", pagina("Empieza aquí", `<h1>Hola, ${esc(perfil.nombre.split(" ")[0])}. Tu contenido ya está listo.</h1>
<p>Todo viene con tu nombre, tus colores y tus datos. Así lo usas en 10 minutos al día:</p>
<div class="paso"><div class="n">1</div><div>Abre <b>01 Calendario 90 dias</b> y busca el día que toca.</div></div>
<div class="paso"><div class="n">2</div><div>Abre ese día en <b>02 Publicaciones</b> y copia el texto. Si dice "Completa antes de publicar", cambia esos datos.</div></div>
<div class="paso"><div class="n">3</div><div>Sube el diseño de <b>03 Disenos</b> (o tu foto) y pega el texto. Listo.</div></div>
<p>En los diseños de story, pon el sticker de encuesta o de preguntas de Instagram encima del recuadro <b>Responde aquí</b>.</p>
<p>En <b>04 Guiones de reels</b> tienes los guiones para grabar, y en <b>05 Bonos</b> la guía para dejar tu perfil listo en 1 hora (hazla antes del Día 1) y 20 prompts para adaptar textos a tu colonia.</p>${op.bump ? "<p>En <b>06 Del mensaje a la visita</b> están tus 50 respuestas de WhatsApp.</p>" : ""}${kit ? "<p>En <b>07 Kit Captacion Exclusiva</b> está tu presentación para dueños (se edita en el navegador y se guarda en PDF), la opinión de valor, el guion de exclusiva, el checklist de documentos y 10 publicaciones de resultados.</p>" : ""}
<p>Para las propiedades que captes, entra a la app y usa <b>Nueva propiedad</b>: te arma el post con foto, precio y tus datos.</p>
<p class="meta">Los textos sobre créditos, escrituras e impuestos son información general. Cada caso puede cambiar según el estado y la institución.</p>`, color));

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return { zip: buf, resumen: { publicaciones: dias.length, adaptadasConIA: ia.size, disenos: piezas.length, guiones: conGuion.length + nExtra, bonos: bs.length, bump: Boolean(op.bump), upsell: Boolean(kit), alertas } };
}
