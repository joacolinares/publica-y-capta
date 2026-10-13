// "Nueva propiedad": arma el diseño y el texto de una propiedad con los datos del asesor.
import { marca, MEDIDAS } from "@/lib/disenos";
import { PerfilSchema } from "@/lib/perfil";
import { postPropiedad, PropiedadSchema, textoPropiedad } from "@/lib/propiedad";
import { png } from "@/lib/render";
import { db, leerCuerpo, leerImagen, responderError, sesion, ErrorHttp } from "@/lib/servidor";

export const runtime = "nodejs";

const CAMPOS: Record<string, string> = { colonia: "colonia", precio: "precio (solo números)", recamaras: "recámaras", banos: "baños", m2: "m²", caracteristicas: "cosas que destacan", tipo: "tipo", operacion: "operación" };

export async function POST(req: Request) {
  try {
    const s = await sesion(req);
    if (!s.compra.productos.pack) throw new ErrorHttp(403, "Tu compra no incluye el pack de 90 días.");
    const datos = (await db().collection("perfiles").doc(s.uid).get()).data();
    if (!datos) throw new ErrorHttp(400, "Primero llena y guarda el formulario.");
    const x = PropiedadSchema.safeParse(JSON.parse(await leerCuerpo(req, 8 * 1024 * 1024)));
    if (!x.success) {
      const foto = x.error.issues.find((i) => i.path[0] === "foto");
      throw new ErrorHttp(400, foto ? foto.message : "Revisa estos datos de la propiedad: " + [...new Set(x.error.issues.map((i) => CAMPOS[String(i.path[0])] ?? String(i.path[0])))].join(", ") + ".");
    }
    const m = marca(PerfilSchema.parse(datos), await leerImagen(s.uid, "logo"));
    const { width, height } = MEDIDAS.feed;
    const imagen = await png(postPropiedad(m, x.data), width, height);
    return Response.json({ imagen: `data:image/png;base64,${imagen.toString("base64")}`, texto: textoPropiedad(m, x.data) });
  } catch (e) { return responderError(e); }
}
