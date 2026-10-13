// Arma el pack con la marca del asesor, lo guarda en Storage y manda el link por correo.
import { correoPack } from "@/lib/correo";
import { armarPaquete } from "@/lib/paquete";
import { PerfilSchema } from "@/lib/perfil";
import { bucket, db, leerImagen, responderError, sesion, ErrorHttp } from "@/lib/servidor";

export const runtime = "nodejs";
export const maxDuration = 300;

const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const s = await sesion(req);
    if (!s.compra.productos.pack) throw new ErrorHttp(403, "Tu compra no incluye el pack de 90 días.");
    const datos = (await db().collection("perfiles").doc(s.uid).get()).data();
    if (!datos) throw new ErrorHttp(400, "Primero llena y guarda el formulario.");
    const perfil = PerfilSchema.parse(datos);
    const [logo, foto] = await Promise.all([leerImagen(s.uid, "logo"), leerImagen(s.uid, "foto")]);
    const { zip, resumen } = await armarPaquete(perfil, { usarIA: true, logo, foto, bump: s.compra.productos.bump, upsell: s.compra.productos.upsell });

    // Un solo ZIP por usuario: el nuevo reemplaza al anterior.
    const archivo = bucket().file(`usuarios/${s.uid}/pack.zip`);
    await archivo.save(zip, { contentType: "application/zip", resumable: false });
    const [url] = await archivo.getSignedUrl({ action: "read", expires: Date.now() + SIETE_DIAS, responseDisposition: 'attachment; filename="Publica y Capta.zip"' });

    const correo = await correoPack(s.email, perfil.nombre.split(" ")[0], url);
    await db().collection("generaciones").add({ uid: s.uid, email: s.email, fecha: new Date().toISOString(), ...resumen, alertas: resumen.alertas.length, correo });
    return Response.json({ url, correo, resumen: { ...resumen, alertas: resumen.alertas.length } });
  } catch (e) { return responderError(e); }
}
