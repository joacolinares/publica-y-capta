// Páginas HTML del pack (calendario, publicaciones, guiones, bonos) con el mismo estilo de los diseños:
// fondo crema, títulos en serif con una palabra en cursiva del color del asesor y datos chicos en mayúsculas.
import { NEUTROS, type Estilo } from "./estilo";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FUENTES = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600&family=Pinyon+Script&display=swap";

export function estilosPagina(e: Estilo) {
  const n = NEUTROS;
  return `:root{--crema:${n.crema};--arena:${n.arena};--linea:${n.linea};--topo:${n.topo};--carbon:${n.carbon};--blanco:${n.blanco};--acento:${e.acentoTexto};--acento-suave:${e.acento}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--crema);color:var(--carbon);font:16px/1.65 Montserrat,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.hoja{max-width:780px;margin:0 auto;padding:22px 18px 80px}
.barra{display:flex;justify-content:space-between;gap:12px;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--linea);margin-bottom:34px}
.barra a{text-decoration:none}
.cap,.barra{font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--topo)}
h1,h2,h3{font-family:"Cormorant Garamond",Georgia,"Times New Roman",serif;font-weight:500;line-height:1.08;color:var(--carbon);overflow-wrap:break-word}
h1{font-size:clamp(38px,9vw,56px);margin:10px 0 18px}
h1 em,h2 em,h3 em{font-style:italic;color:var(--acento)}
.script{font-family:"Pinyon Script","Snell Roundhand",cursive;font-weight:400;font-style:normal;color:var(--acento)}
h2{font-size:clamp(28px,6vw,34px);margin:6px 0 10px}
h3{font-size:25px;font-weight:600;margin:30px 0 8px}
h4{font-size:11.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--topo);margin:24px 0 8px}
p{margin:0 0 14px}a{color:var(--acento)}b,strong{font-weight:600}
.intro{font-size:17px;max-width:620px}
.tarjeta{background:var(--blanco);border:1px solid var(--linea);padding:26px 22px 20px;margin:22px 0;scroll-margin-top:16px}
.post{white-space:pre-wrap;background:var(--blanco);border:1px solid var(--linea);padding:16px 18px;margin:10px 0;font-size:15.5px}
.tarjeta .post{background:var(--crema);border-color:var(--crema)}
.wa{white-space:pre-wrap;background:var(--arena);padding:14px 18px;font-size:15px;margin:8px 0}
.meta{color:var(--topo);font-size:13.5px}
.nota{border-left:2px solid var(--acento);padding:4px 0 4px 14px;margin:14px 0;font-size:14.5px}
mark{background:#F1DFA8;color:inherit;padding:0 2px}
hr{border:0;border-top:1px solid var(--linea);margin:34px 0}
ul,ol{padding-left:22px;margin:0 0 14px}li{margin:4px 0}
table{border-collapse:collapse;width:100%;font-size:14.5px;margin:14px 0;background:var(--blanco)}
th{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--topo);font-weight:600;text-align:left;padding:10px;border-bottom:1px solid var(--carbon);vertical-align:bottom}
td{padding:10px;border-bottom:1px solid var(--linea);vertical-align:top}
.paso{display:flex;gap:16px;margin:16px 0;align-items:flex-start}
.n{flex:0 0 42px;height:42px;border-radius:50%;border:1px solid var(--carbon);display:flex;align-items:center;justify-content:center;font:500 22px/1 "Cormorant Garamond",Georgia,serif}
.indice{columns:2;column-gap:28px;padding:0;list-style:none;font-size:14.5px}.indice li{break-inside:avoid;margin:0 0 6px}
.chip{display:inline-block;font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;border:1px solid var(--linea);padding:3px 9px;border-radius:999px;color:var(--topo);background:var(--blanco);white-space:nowrap}
.copiar{display:none;align-items:center;gap:8px;font:600 11px/1 Montserrat,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;border:1px solid var(--carbon);background:transparent;color:var(--carbon);border-radius:999px;padding:10px 16px;cursor:pointer;margin:2px 0 10px}
.js .copiar{display:inline-flex}.copiar.listo{background:var(--carbon);color:var(--blanco)}
.pie{margin-top:60px;padding-top:16px;border-top:1px solid var(--linea);text-align:center;font-size:12px;color:var(--topo)}
@media (max-width:640px){
  .indice{columns:1}
  table.t,table.t tbody,table.t tr,table.t td{display:block;width:100%}
  table.t{background:transparent}
  table.t tr:first-child{display:none}
  table.t tr{border:1px solid var(--linea);background:var(--blanco);margin:0 0 10px;padding:8px 14px}
  table.t td{border:0;padding:5px 0}
  table.t td::before{content:attr(data-l);display:block;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--topo);font-weight:600}
  table.t td:first-child{font:500 21px/1.2 "Cormorant Garamond",Georgia,serif}
  table.t td:first-child::before{font-family:Montserrat,system-ui,sans-serif;line-height:1.65}
}
@media print{body{background:#fff}.copiar,.barra a{display:none!important}.tarjeta{break-inside:avoid}}`;
}

// Botón "Copiar texto": copia el texto de la caja que nombra data-c. Si el navegador no corre JavaScript, no aparece.
const SCRIPT = `<script>document.documentElement.classList.add("js");document.addEventListener("click",function(ev){var b=ev.target.closest&&ev.target.closest("[data-c]");if(!b)return;var el=document.getElementById(b.getAttribute("data-c"));if(!el)return;var t=el.innerText;function ok(){var o=b.textContent;b.textContent="Copiado";b.classList.add("listo");setTimeout(function(){b.textContent=o;b.classList.remove("listo")},1600)}function viejo(){var a=document.createElement("textarea");a.value=t;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();try{document.execCommand("copy");ok()}catch(e){}document.body.removeChild(a)}if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(ok,viejo)}else viejo()});</script>`;

export const copiar = (id: string, texto = "Copiar texto") => `<button class="copiar" type="button" data-c="${id}">${texto}</button>`;

/** Página completa. `firma`: el nombre del asesor arriba. `raiz`: "../" si la página está dentro de una carpeta. */
export function pagina(titulo: string, cuerpo: string, e: Estilo, firma: string, raiz = "") {
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${FUENTES}">
<style>${estilosPagina(e)}</style></head><body><div class="hoja">
<div class="barra"><span>${esc(firma)}</span><a href="${raiz}00 EMPIEZA AQUI.html">Empieza aquí</a></div>
${cuerpo}
<div class="pie">Tu contenido de 90 días · Publica y Capta</div></div>${SCRIPT}</body></html>`;
}
