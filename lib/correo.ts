// Correos con Resend (API REST, sin dependencias). Sin RESEND_API_KEY no se manda nada y la app sigue funcionando.
// Diseño: el mismo de la marca (crema, serif con una palabra en cursiva, botón carbón). HTML con tablas y estilos en línea,
// que es lo que leen bien Gmail, Outlook y el correo del celular.
import { appUrl } from "./sitio";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function enviarCorreo(para: string, asunto: string, html: string, texto?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn("Correo sin enviar: falta RESEND_API_KEY"); return false; }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "User-Agent": "publica-y-capta/1.0" },
    body: JSON.stringify({
      from: process.env.CORREO_REMITENTE || "Publica y Capta <onboarding@resend.dev>", to: [para], subject: asunto, html,
      ...(texto ? { text: texto } : {}),
      // Las respuestas de los clientes van a un buzón real (el remitente de Resend no recibe correos).
      ...(process.env.CORREO_RESPUESTAS ? { reply_to: process.env.CORREO_RESPUESTAS } : {}),
    }),
  }).catch((e) => { console.error("Resend", e); return null; });
  if (!r?.ok) { console.error("Resend", r?.status, await r?.text()); return false; }
  return true;
}

const C = { crema: "#F4EFE8", arena: "#E4DACC", linea: "#D9CFC1", topo: "#6E6458", carbon: "#2B2A28", blanco: "#FFFDF9", salvia: "#56624A" };
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
const SANS = "Montserrat,'Helvetica Neue',Arial,sans-serif";

type Plantilla = {
  /** Texto chico arriba del título, en mayúsculas. */
  etiqueta: string;
  /** Título: la parte entre *asteriscos* sale en cursiva con el color de acento. */
  titulo: string;
  /** Párrafos (HTML ya escapado). */
  parrafos: string[];
  boton?: { texto: string; url: string };
  /** Texto chico debajo del botón. */
  nota?: string;
  /** Texto que algunos clientes de correo muestran junto al asunto. */
  previa: string;
};

/** Cómo contestar: respondiendo (si hay buzón para las respuestas) o al correo de soporte. Sin ninguno, no se promete. */
function contacto() {
  if (process.env.CORREO_RESPUESTAS) return { corto: "¿Dudas? Responde este correo.", garantia: "responde este correo" };
  const soporte = process.env.NEXT_PUBLIC_CORREO_SOPORTE;
  if (soporte) return { corto: `¿Dudas? Escríbenos a ${esc(soporte)}.`, garantia: `escríbenos a ${esc(soporte)}` };
  return null;
}

const titulo = (t: string) => esc(t).replace(/\*([^*]+)\*/g, `<em style="font-style:italic;color:${C.salvia}">$1</em>`);

export function plantilla(p: Plantilla) {
  const app = appUrl();
  const marca = app ? `<a href="${esc(app)}" style="color:${C.topo}">Publica y Capta</a>` : "Publica y Capta";
  const pie = contacto()?.corto;
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(p.titulo.replace(/\*/g, ""))}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Montserrat:wght@400;600&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:${C.crema};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.crema}">${esc(p.previa)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.crema}"><tr><td align="center" style="padding:32px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.blanco};border:1px solid ${C.linea}">
<tr><td align="center" style="padding:34px 32px 0">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" width="46" height="46" style="width:46px;height:46px;border:1px solid ${C.carbon};border-radius:23px;font-family:${SERIF};font-size:17px;color:${C.carbon};line-height:46px">P<i style="color:${C.salvia}">y</i>C</td></tr></table>
  <div style="font-family:${SANS};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.carbon};margin-top:12px">Publica y Capta</div>
</td></tr>
<tr><td align="center" style="padding:30px 32px 0"><div style="height:1px;width:60px;background:${C.linea};line-height:1px;font-size:1px">&nbsp;</div></td></tr>
<tr><td align="center" style="padding:26px 32px 6px">
  <div style="font-family:${SANS};font-size:10.5px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.topo}">${esc(p.etiqueta)}</div>
  <h1 style="margin:14px 0 0;font-family:${SERIF};font-weight:500;font-size:36px;line-height:1.1;color:${C.carbon}">${titulo(p.titulo)}</h1>
</td></tr>
<tr><td style="padding:18px 40px 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.carbon};text-align:center">
  ${p.parrafos.map((x) => `<p style="margin:0 0 14px">${x}</p>`).join("")}
</td></tr>
${p.boton ? `<tr><td align="center" style="padding:14px 32px 6px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="${C.carbon}" style="border-radius:999px">
    <a href="${esc(p.boton.url)}" style="display:inline-block;padding:18px 34px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:2.6px;text-transform:uppercase;color:${C.blanco};text-decoration:none;border-radius:999px">${esc(p.boton.texto)}</a>
  </td></tr></table>
</td></tr>` : ""}
${p.nota ? `<tr><td style="padding:18px 40px 0;font-family:${SANS};font-size:12.5px;line-height:1.6;color:${C.topo};text-align:center">${p.nota}</td></tr>` : ""}
<tr><td style="padding:34px 0 0"><div style="height:8px;background:${C.arena};line-height:8px;font-size:1px">&nbsp;</div></td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px"><tr><td align="center" style="padding:20px 20px 0;font-family:${SANS};font-size:11.5px;line-height:1.6;color:${C.topo}">
  ${marca} · 90 días de contenido para asesores inmobiliarios${pie ? `<br>${pie}` : ""}
</td></tr></table>
</td></tr></table></body></html>`;
}

/** HTML de un párrafo → texto: saltos en <br>, sin etiquetas y con los caracteres escapados de vuelta. */
const plano = (h: string) => h.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const textoPlano = (p: Plantilla) => [p.titulo.replace(/\*/g, ""), "", p.parrafos.map(plano).join("\n\n"), "", p.boton ? `${p.boton.texto}: ${p.boton.url}` : "", "", p.nota ? plano(p.nota) : "", "", "Publica y Capta · 90 días de contenido para asesores inmobiliarios"].join("\n").replace(/\n{3,}/g, "\n\n").trim();

const mandar = (para: string, asunto: string, p: Plantilla) => enviarCorreo(para, asunto, plantilla(p), textoPlano(p));

/** Link para entrar a la app (reemplaza el correo genérico de Firebase). */
export function correoAcceso(para: string, link: string) {
  return mandar(para, "Tu link para entrar a Publica y Capta", {
    previa: "Toca el botón para entrar. No necesitas contraseña.",
    etiqueta: "Tu acceso",
    titulo: "Tu link para *entrar*",
    parrafos: [`Toca el botón para entrar a tu pack con <b>${esc(para)}</b>. No necesitas contraseña.`],
    boton: { texto: "Entrar a mi pack", url: link },
    nota: `El link sirve una sola vez. Si no pediste entrar, ignora este correo: nadie puede entrar sin abrirlo.<br><br>¿El botón no funciona? Copia este link en tu navegador:<br><a href="${esc(link)}" style="color:${C.topo};word-break:break-all">${esc(link)}</a>`,
  });
}

/** Al aprobarse el pago: respaldo del correo de Impul con el link para entrar a la app. */
export function correoBienvenida(para: string) {
  const app = appUrl();
  if (!app) return Promise.resolve(false);
  const reembolso = contacto()?.garantia;
  return mandar(para, "Tu acceso a Publica y Capta", {
    previa: "Ya puedes armar tus 90 días de contenido con tu marca.",
    etiqueta: "Gracias por tu compra",
    titulo: "Tu contenido de 90 días te *espera*",
    parrafos: [
      "Ya puedes armar tus 90 días de contenido con tu logo, tus colores y tus datos.",
      `Entra con este mismo correo (<b>${esc(para)}</b>), llena el formulario de 5 minutos y descarga todo.`,
    ],
    boton: { texto: "Armar mi pack", url: `${app}/entrar` },
    nota: `Si el pack no te sirve, tienes 7 días naturales desde tu compra para pedir tu reembolso${reembolso ? `: ${reembolso}` : ""}. Al reembolsarte se desactiva tu acceso.`,
  });
}

/** Después de generar: link de descarga del ZIP (vale 7 días; se puede volver a armar en la app). */
export function correoPack(para: string, nombre: string, url: string) {
  const app = appUrl();
  return mandar(para, "Tu pack de 90 días ya está listo", {
    previa: "Abre el archivo y empieza por 00 EMPIEZA AQUI.",
    etiqueta: "Tu pack está listo",
    titulo: `${nombre}, tu contenido ya está *listo*`,
    parrafos: [
      "Adentro van tus 90 publicaciones, el calendario, los diseños con tu marca, los guiones de reels y los bonos.",
      "Abre el archivo y empieza por <b>00 EMPIEZA AQUI</b>.",
    ],
    boton: { texto: "Descargar mi pack", url },
    nota: `El link vale 7 días. Si vence o cambias tus datos, vuelve a armarlo${app ? ` en <a href="${esc(app)}/panel" style="color:${C.topo}">tu panel</a>` : " en tu panel"}.`,
  });
}
