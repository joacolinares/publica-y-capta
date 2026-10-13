// Arma el pack con la marca del asesor y lo devuelve como ZIP.
import { armarPaquete } from "@/lib/paquete";
import { PerfilSchema } from "@/lib/perfil";
import { db, leerImagen, responderError, sesion, ErrorHttp } from "@/lib/servidor";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const s = await sesion(req);
    if (!s.compra.productos.pack) throw new ErrorHttp(403, "Tu compra no incluye el pack de 90 días.");
    const datos = (await db().collection("perfiles").doc(s.uid).get()).data();
    if (!datos) throw new ErrorHttp(400, "Primero llena y guarda el formulario.");
    const perfil = PerfilSchema.parse(datos);
    const [logo, foto] = await Promise.all([leerImagen(s.uid, "logo"), leerImagen(s.uid, "foto")]);
    const { zip, resumen } = await armarPaquete(perfil, { usarIA: true, logo, foto, bump: s.compra.productos.bump, upsell: s.compra.productos.upsell });
    await db().collection("generaciones").add({ uid: s.uid, email: s.email, fecha: new Date().toISOString(), ...resumen, alertas: resumen.alertas.length });
    return new Response(new Uint8Array(zip), {
      headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="Publica y Capta.zip"', "X-Resumen": encodeURIComponent(JSON.stringify({ ...resumen, alertas: resumen.alertas.length })) },
    });
  } catch (e) { return responderError(e); }
}
