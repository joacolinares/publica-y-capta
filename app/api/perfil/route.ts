// Guarda el formulario del asesor (datos, logo y foto).
import { PerfilSchema } from "@/lib/perfil";
import { db, guardarImagen, responderError, sesion, ErrorHttp } from "@/lib/servidor";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  try {
    const s = await sesion(req);
    const { perfil, logo, foto } = (await req.json()) as { perfil: unknown; logo?: string; foto?: string };
    const p = PerfilSchema.safeParse(perfil);
    if (!p.success) throw new ErrorHttp(400, "Revisa el formulario: " + p.error.issues.map((i) => i.path.join(".")).join(", "));
    if (logo) await guardarImagen(s.uid, "logo", logo);
    if (foto) await guardarImagen(s.uid, "foto", foto);
    const ref = db().collection("perfiles").doc(s.uid);
    const previo = (await ref.get()).data() ?? {};
    await ref.set({ ...p.data, tieneLogo: Boolean(logo) || Boolean(previo.tieneLogo), tieneFoto: Boolean(foto) || Boolean(previo.tieneFoto), email: s.email, actualizado: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (e) { return responderError(e); }
}
