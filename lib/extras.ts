// Bonos, guiones extra, bump y upsell: Markdown base + datos del asesor, a HTML con su color.
import extras from "@/content/extras.json";
import type { Perfil } from "./perfil";
import { mdAHtml } from "./md";
import { reemplazar, reemplazarSinColonia } from "./personalizar";
import { estilosPagina } from "./pagina";
import { NEUTROS, type Estilo } from "./estilo";

const marcar = (html: string) => html.replace(/\[([^\]<]{1,80})\]/g, "<mark>[$1]</mark>");
export const html = (md: string, p: Perfil) => marcar(mdAHtml(reemplazar(md, p)));

/** En el bump y el upsell, [colonia] es la del cliente o la propiedad, no la del asesor: se deja para completar. */
const conColonia = reemplazarSinColonia;
const htmlCliente = (md: string, p: Perfil) => marcar(mdAHtml(conColonia(md, p)));

const sinTitulo = (md: string) => md.replace(/^# .*\n/, "");

/** Separa el Markdown en bloques por título de nivel 1. */
function secciones(md: string) {
  return md.split(/\n(?=# )/).map((s) => ({ titulo: (s.match(/^# (.*)/)?.[1] ?? "").trim(), cuerpo: s.replace(/^# .*\n/, "") }));
}

/** Los guiones extra uno por uno. `texto` es el texto para publicar con el reel (sin las comillas de cita). */
export function guionesExtra(p: Perfil) {
  if (!extras.guionesExtra) return [];
  return reemplazar(extras.guionesExtra, p).split(/\n(?=## Extra )/).filter((s) => s.startsWith("## Extra ")).map((s) => {
    const [, n = "", tipo = "", titulo = ""] = s.match(/^## Extra (\d+) · ([^·\n]+) · (.*)/) ?? [];
    const duracion = s.match(/^_([^_\n]+)_\s*$/m)?.[1]?.trim() ?? tipo.trim();
    const [guion, texto = ""] = s.replace(/^## .*\n/, "").replace(/^\s*_[^_\n]+_\s*$/m, "").replace(/\n---\s*$/, "").split(/\n\*\*Texto del reel\*\*\s*\n/);
    const caption = texto.split("\n").filter((l) => l.startsWith(">")).map((l) => l.replace(/^> ?/, "")).join("\n").trim();
    return { n: Number(n), tipo: tipo.trim(), titulo: titulo.trim(), duracion, html: marcar(mdAHtml(guion)), texto: caption };
  });
}
export const bump = (p: Perfil) => (extras.bump ? htmlCliente(sinTitulo(extras.bump), p) : "");

export function bonos(p: Perfil) {
  return secciones(extras.bonos).filter((s) => s.titulo).map((s) => ({ titulo: s.titulo.replace(/^Bono \d+ · /, ""), html: html(s.cuerpo, p) }));
}

/** Upsell: la presentación de captación como diapositivas editables en el navegador + el resto del kit. */
export function upsell(p: Perfil, e: Estilo) {
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
  const contacto = esc([p.whatsapp, p.correo].filter(Boolean).join(" · "));
  const n = NEUTROS;
  // Mismo estilo que los diseños: base crema, serif, la portada en carbón y el color del asesor solo como acento.
  const presentacion = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Presentación de captación</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600&display=swap">
<style>${estilosPagina(e)}
@page{size:1280px 720px;margin:0}body{background:${n.arena}}
.barra-p{position:sticky;top:0;z-index:2;display:flex;gap:12px;align-items:center;justify-content:space-between;padding:12px 18px;background:${n.blanco};border-bottom:1px solid ${n.linea};font-size:14px}
.barra-p button{font:600 11px/1 Montserrat,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;border:0;border-radius:999px;padding:13px 20px;background:${n.carbon};color:${n.blanco};cursor:pointer;white-space:nowrap}
.d{width:1280px;height:720px;margin:24px auto;background:${n.crema};color:${n.carbon};position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:70px 110px;page-break-after:always;border:1px solid ${n.linea}}
.d::after{content:"";position:absolute;inset:26px;border:1px solid ${n.linea};pointer-events:none}
.d:first-of-type{background:${n.carbon};color:${n.blanco};border-color:${n.carbon}}.d:first-of-type::after{border-color:rgba(255,253,249,.25)}
.d:first-of-type h2{color:${n.blanco};font-size:76px}.d:first-of-type .k{color:${e.acentoOscuro}}
.d .k{font:600 15px/1 Montserrat,system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:${n.topo};margin-bottom:26px}
.d h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;font-size:60px;line-height:1.05;margin:0 0 34px;color:${n.carbon}}
.d ul{margin:0;padding:0;list-style:none;font-size:27px;line-height:1.45}.d li{margin:10px 0;padding-left:38px;position:relative}
.d li::before{content:"";position:absolute;left:0;top:.62em;width:18px;height:1px;background:${e.acento}}
.d:first-of-type li::before{background:${e.acentoOscuro}}
.d .f,.d .pg{position:absolute;bottom:52px;font:600 13px/1 Montserrat,system-ui,sans-serif;letter-spacing:.24em;text-transform:uppercase;opacity:.75}.d .f{left:110px}.d .pg{right:110px}
.nota-p{max-width:1280px;margin:-12px auto 0;padding:12px 18px;background:${n.blanco};border-left:2px solid ${e.acentoTexto};font-size:15px}
[contenteditable]:focus{outline:1px dashed ${e.acento};outline-offset:6px}
@media print{body{background:#fff}.barra-p,.nota-p{display:none}.d{margin:0;border:0}mark{background:none}}
@media (max-width:1300px){.d{zoom:.6}}@media (max-width:800px){.d{zoom:.27}}</style></head><body>
<div class="barra-p"><span>Toca cualquier texto para cambiarlo. Lo marcado en amarillo es lo que completas tú.</span><button onclick="print()">Guardar en PDF</button></div>
${diapositivas.map((d, i) => `<section class="d"><div class="k">${i === 0 ? firma : `${String(i + 1).padStart(2, "0")} · ${firma}`}</div><h2 contenteditable>${marcar(esc(d.titulo))}</h2><ul contenteditable>${d.bullets.map((b) => `<li>${marcar(esc(b))}</li>`).join("")}</ul><div class="f">${i === 0 ? contacto : firma}</div><div class="pg">${i + 1} / ${diapositivas.length}</div></section>${d.nota ? `<div class="nota-p"><b>Qué decir:</b> ${esc(d.nota)}</div>` : ""}`).join("\n")}
</body></html>`;
return { presentacion, resto: resto.map((s) => ({ titulo: s.titulo.replace(/^\d+\.\s*/, ""), html: htmlCliente(s.cuerpo, p) })), diapositivas: diapositivas.length };
}
