// "Nueva propiedad": arma el diseño y el texto de una propiedad con los datos del asesor.
import { marca, MEDIDAS } from "@/lib/disenos";
import { PerfilSchema } from "@/lib/perfil";
import { postPropiedad, PropiedadSchema, textoPropiedad } from "@/lib/propiedad";
import { png } from "@/lib/render";
import { db, leerImagen, responderError, sesion, ErrorHttp } from "@/lib/servidor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const s = await sesion(req);
    const datos = (await db().collection("perfiles").doc(s.uid).get()).data();
    if (!datos) throw new ErrorHttp(400, "Primero llena y guarda el formulario.");
    const x = PropiedadSchema.safeParse(await req.json());
    if (!x.success) throw new ErrorHttp(400, "Revisa los datos de la propiedad: " + x.error.issues.map((i) => i.path.join(".")).join(", "));
    if (x.data.foto && x.data.foto.length > 6_000_000) throw new ErrorHttp(400, "La foto pesa demasiado. Usa una más chica.");
    const m = marca(PerfilSchema.parse(datos), await leerImagen(s.uid, "logo"));
    const { width, height } = MEDIDAS.feed;
    const imagen = await png(postPropiedad(m, x.data), width, height);
    return Response.json({ imagen: `data:image/png;base64,${imagen.toString("base64")}`, texto: textoPropiedad(m, x.data) });
  } catch (e) { return responderError(e); }
}
