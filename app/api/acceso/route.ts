// Dice qué compró el usuario. La pantalla lo usa al entrar.
import { db, responderError, sesion } from "@/lib/servidor";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const s = await sesion(req);
    const perfil = (await db().collection("perfiles").doc(s.uid).get()).data() ?? null;
    return Response.json({ email: s.email, productos: s.compra.productos, perfil });
  } catch (e) { return responderError(e); }
}
