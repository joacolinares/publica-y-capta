// Link para entrar con la marca de Publica y Capta: lo genera Firebase y lo mandamos nosotros por Resend.
// Si el correo propio no está configurado (o falla), responde { modo: "firebase" } y la pantalla le pide a Firebase
// que mande su correo de siempre. Nunca revela en pantalla si un correo compró o no.
import { createHash } from "node:crypto";
import { correoAcceso, correoSinCompra } from "@/lib/correo";
import { asegurarUsuario, authAdmin, compraDe, db, leerCuerpo, normalizar } from "@/lib/servidor";

export const runtime = "nodejs";

const ok = (modo: "propio" | "firebase") => Response.json({ modo });

/** Hasta 1 correo por minuto y 6 por día para cada dirección: evita usar la página para llenarle el buzón a alguien. */
async function permitido(email: string) {
  const ref = db().collection("enlaces").doc(createHash("sha256").update(email).digest("hex"));
  const hoy = new Date().toISOString().slice(0, 10);
  return db().runTransaction(async (tx) => {
    const l = ((await tx.get(ref)).data() ?? {}) as { ultimo?: number; dia?: string; n?: number };
    const n = l.dia === hoy ? l.n ?? 0 : 0;
    if ((l.ultimo && Date.now() - l.ultimo < 60_000) || n >= 6) return false;
    tx.set(ref, { ultimo: Date.now(), dia: hoy, n: n + 1 });
    return true;
  });
}

function origen(req: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return host ? `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}` : new URL(req.url).origin;
}

export async function POST(req: Request) {
  let email = "";
  try {
    const cuerpo = JSON.parse(await leerCuerpo(req, 2048)) as { email?: unknown };
    email = typeof cuerpo.email === "string" ? normalizar(cuerpo.email) : "";
  } catch { return ok("firebase"); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return ok("firebase");

  try {
    const compra = await compraDe(email);
    // Sin correo propio: se deja la cuenta lista (si compró) y el link lo manda Firebase.
    if (!process.env.RESEND_API_KEY) {
      if (compra?.productos?.pack) await asegurarUsuario(email);
      return ok("firebase");
    }
    if (!(await permitido(email))) return ok("propio");
    if (!compra?.productos?.pack) {
      await correoSinCompra(email);
      return ok("propio");
    }
    await asegurarUsuario(email);
    const link = await authAdmin().generateSignInWithEmailLink(email, { url: `${origen(req)}/entrar`, handleCodeInApp: true });
    return ok((await correoAcceso(email, link)) ? "propio" : "firebase");
  } catch (e) {
    console.error("enlace", e);
    return ok("firebase");
  }
}
