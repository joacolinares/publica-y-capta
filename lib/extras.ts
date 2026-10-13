// Bonos, guiones extra, bump y upsell: Markdown base + datos del asesor, a HTML con su color.
import extras from "@/content/extras.json";
import type { Perfil } from "./perfil";
import { mdAHtml } from "./md";
import { reemplazar } from "./personalizar";
import type { Paleta } from "./colores";

const marcar = (html: string) => html.replace(/\[([^\]<]{1,80})\]/g, "<mark>[$1]</mark>");
export const html = (md: string, p: Perfil) => marcar(mdAHtml(reemplazar(md, p)));

/** En el bump y el upsell, [colonia] es la del cliente o la propiedad, no la del asesor: se deja para completar. */
const conColonia = (md: string, p: Perfil) => reemplazar(md.replace(/\[colonia\]/g, "\u0000"), p).replace(/\u0000/g, "[colonia]");
const htmlCliente = (md: string, p: Perfil) => marcar(mdAHtml(conColonia(md, p)));

const sinTitulo = (md: string) => md.replace(/^# .*\n/, "");

/** Separa el Markdown en bloques por título de nivel 1. */
function secciones(md: string) {
  return md.split(/\n(?=# )/).map((s) => ({ titulo: (s.match(/^# (.*)/)?.[1] ?? "").trim(), cuerpo: s.replace(/^# .*\n/, "") }));
}

export const guionesExtra = (p: Perfil) => (extras.guionesExtra ? html(sinTitulo(extras.guionesExtra), p) : "");
export const bump = (p: Perfil) => (extras.bump ? htmlCliente(sinTitulo(extras.bump), p) : "");

export function bonos(p: Perfil) {
  return secciones(extras.bonos).filter((s) => s.titulo).map((s) => ({ titulo: s.titulo.replace(/^Bono \d+ · /, ""), html: html(s.cuerpo, p) }));
}

/** Upsell: la presentación de captación como diapositivas editables en el navegador + el resto del kit. */
export function upsell(p: Perfil, pal: Paleta) {
  if (!extras.upsell) return null;
  const partes = secciones(extras.upsell).filter((s) => /^\d+\./.test(s.titulo));
  const [pres, ...resto] = partes;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const diapositivas = conColonia(pres.cuerpo, p).split(/\n(?=## )/).filter((d) => d.startsWith("## ")).map((d) => {
    const titulo = d.match(/^## Diapositiva \d+ · (.*)/)?.[1] ?? "";
    const bullets = [...d.matchAll(/^- (.*)$/gm)].map((m) => m[1]);
    const nota = d.match(/^Nota: (.*)$/m)?.[1] ?? "";
    return { titulo, bullets, nota };
  });
  const firma = esc(p.nombreComercial || p.nombre);
  const presentacion = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Presentación de captación</title>
<style>@page{size:1280px 720px;margin:0}*{box-sizing:border-box}body{margin:0;background:#E9ECEB;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${pal.tinta}}
.barra{position:sticky;top:0;z-index:2;display:flex;gap:12px;align-items:center;justify-content:space-between;padding:12px 18px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.1);font-size:15px}
.barra button{font:inherit;font-weight:700;border:0;border-radius:10px;padding:10px 16px;background:${pal.principal};color:${pal.sobrePrincipal};cursor:pointer}
.d{width:1280px;height:720px;margin:24px auto;background:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:70px 90px;page-break-after:always;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.d:first-of-type{background:${pal.principal};color:${pal.sobrePrincipal}}
.d .n{position:absolute;right:60px;bottom:40px;font-size:15px;opacity:.6}.d .f{position:absolute;left:90px;bottom:40px;font-size:15px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.8}
.d .r{width:90px;height:8px;background:${pal.acento};border-radius:4px;margin-bottom:28px}
.d h2{font-family:Georgia,serif;font-size:54px;line-height:1.1;margin:0 0 34px}.d ul{margin:0;padding-left:28px;font-size:30px;line-height:1.5}.d li{margin:6px 0}
.nota{max-width:1280px;margin:-12px auto 0;padding:12px 18px;background:#FFF8E1;border-radius:10px;font-size:15px}
[contenteditable]:focus{outline:2px dashed ${pal.acento};outline-offset:4px}mark{background:#FFF3C4;color:inherit}
@media print{body{background:#fff}.barra,.nota{display:none}.d{margin:0;box-shadow:none}mark{background:none}}
@media (max-width:1300px){.d{zoom:.6}}@media (max-width:800px){.d{zoom:.28}}</style></head><body>
<div class="barra"><span>Toca cualquier texto para cambiarlo. Lo marcado en amarillo es lo que completas tú.</span><button onclick="print()">Guardar en PDF</button></div>
${diapositivas.map((d, i) => `<section class="d"><div class="r"></div><h2 contenteditable>${marcar(esc(d.titulo))}</h2><ul contenteditable>${d.bullets.map((b) => `<li>${marcar(esc(b))}</li>`).join("")}</ul><div class="f">${firma}</div><div class="n">${i + 1} / ${diapositivas.length}</div></section>${d.nota ? `<div class="nota"><b>Qué decir:</b> ${esc(d.nota)}</div>` : ""}`).join("\n")}
</body></html>`;
  return { presentacion, resto: resto.map((s) => ({ titulo: s.titulo.replace(/^\d+\.\s*/, ""), html: htmlCliente(s.cuerpo, p) })), diapositivas: diapositivas.length };
}
