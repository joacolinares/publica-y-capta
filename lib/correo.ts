// Correos con Resend (API REST, sin dependencias). Sin RESEND_API_KEY no se manda nada y la app sigue funcionando.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function enviarCorreo(para: string, asunto: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn("Correo sin enviar: falta RESEND_API_KEY"); return false; }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "User-Agent": "publica-y-capta/1.0" },
    body: JSON.stringify({
      from: process.env.CORREO_REMITENTE || "Publica y Capta <onboarding@resend.dev>", to: [para], subject: asunto, html,
      // Las respuestas de los clientes van a un buzón real (el remitente de Resend no recibe correos).
      ...(process.env.CORREO_RESPUESTAS ? { reply_to: process.env.CORREO_RESPUESTAS } : {}),
    }),
  }).catch((e) => { console.error("Resend", e); return null; });
  if (!r?.ok) { console.error("Resend", r?.status, await r?.text()); return false; }
  return true;
}

function plantilla(titulo: string, cuerpo: string, boton?: { texto: string; url: string }) {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#14201E;line-height:1.55">
<h1 style="font-size:22px;margin:0 0 12px">${esc(titulo)}</h1>${cuerpo}
${boton ? `<p style="margin:24px 0"><a href="${esc(boton.url)}" style="display:inline-block;background:#1F3A5F;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:10px">${esc(boton.texto)}</a></p>` : ""}
<p style="color:#55625F;font-size:13px;margin-top:28px">Publica y Capta · Si tienes dudas, responde este correo.</p></div>`;
}

/** Al aprobarse el pago: respaldo del correo de Impul con el link para entrar a la app. */
export function correoBienvenida(para: string) {
  const app = process.env.APP_URL;
  if (!app) return Promise.resolve(false);
  return enviarCorreo(para, "Tu acceso a Publica y Capta", plantilla("Gracias por tu compra",
    `<p>Ya puedes armar tus 90 días de contenido con tu logo, tus colores y tus datos.</p><p>Entra con este mismo correo (<b>${esc(para)}</b>), llena el formulario de 5 minutos y descarga todo.</p>`,
    { texto: "Entrar a armar mi pack", url: app }));
}

/** Después de generar: link de descarga del ZIP (vale 7 días; se puede volver a armar en la app). */
export function correoPack(para: string, nombre: string, url: string) {
  const app = process.env.APP_URL;
  return enviarCorreo(para, "Tu pack de 90 días ya está listo", plantilla(`${nombre}, tu contenido ya está listo`,
    `<p>Adentro van tus 90 publicaciones, el calendario, los diseños con tu marca, los guiones y los bonos.</p><p>Abre el archivo y empieza por <b>00 EMPIEZA AQUI</b>.</p><p style="color:#55625F;font-size:14px">El link vale 7 días. Si vence o cambias tus datos, vuelve a armarlo${app ? ` en <a href="${esc(app)}">la app</a>` : " en la app"}.</p>`,
    { texto: "Descargar mi pack", url }));
}
