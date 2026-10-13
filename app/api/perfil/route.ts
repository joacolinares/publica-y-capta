// Guarda el formulario del asesor (datos, logo y foto).
import { PerfilSchema } from "@/lib/perfil";
import { db, guardarImagen, leerCuerpo, responderError, sesion, ErrorHttp } from "@/lib/servidor";

export const runtime = "nodejs";

const CAMPOS: Record<string, string> = {
  nombre: "tu nombre", nombreComercial: "nombre comercial", whatsapp: "WhatsApp (al menos 8 números)", correo: "correo", domicilio: "domicilio de tu oficina",
  ciudad: "ciudad", zona: "zona", colonias: "colonias", colorPrincipal: "color principal", colorAcento: "color de acento", especialidad: "qué haces más",
  cliente: "tu cliente principal", tono: "cómo le hablas a tus clientes", genero: "cómo te presentas", aniosExperiencia: "años de experiencia", usuarioRedes: "usuario de redes",
};

export async function PUT(req: Request) {
  try {
    const s = await sesion(req);
    const { perfil, logo, foto } = JSON.parse(await leerCuerpo(req, 10 * 1024 * 1024)) as { perfil: unknown; logo?: string; foto?: string };
    const p = PerfilSchema.safeParse(perfil);
    if (!p.success) throw new ErrorHttp(400, "Revisa estos datos: " + [...new Set(p.error.issues.map((i) => CAMPOS[String(i.path[0])] ?? String(i.path[0])))].join(", ") + ".");
    if (logo) await guardarImagen(s.uid, "logo", logo);
    if (foto) await guardarImagen(s.uid, "foto", foto);
    const ref = db().collection("perfiles").doc(s.uid);
    const previo = (await ref.get()).data() ?? {};
    await ref.set({ ...p.data, tieneLogo: Boolean(logo) || Boolean(previo.tieneLogo), tieneFoto: Boolean(foto) || Boolean(previo.tieneFoto), email: s.email, actualizado: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (e) { return responderError(e); }
}
