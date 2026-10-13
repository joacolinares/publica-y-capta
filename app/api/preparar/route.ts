// Antes de mandar el link de acceso: si el correo tiene una compra, deja lista su cuenta.
// Siempre responde lo mismo, para no revelar quién compró.
import { asegurarUsuario, compraDe, leerCuerpo } from "@/lib/servidor";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = JSON.parse(await leerCuerpo(req, 2048)) as { email?: string };
    if (typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      const compra = await compraDe(email);
      if (compra?.productos?.pack) await asegurarUsuario(email);
    }
  } catch (e) { console.error("preparar", e); }
  return Response.json({ ok: true });
}
