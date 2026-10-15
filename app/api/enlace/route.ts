// Link para entrar: solo para correos con compra. Lo genera Firebase y lo mandamos nosotros por Resend con la marca;
// si el correo propio no está configurado (o falla), responde { modo: "firebase" } y la pantalla le pide a Firebase
// que mande su correo de siempre. A un correo sin compra no se le manda nada: la pantalla le pide el correo con el que pagó.
import { createHash } from "node:crypto";
import { correoAcceso } from "@/lib/correo";
import { asegurarUsuario, authAdmin, compraDe, db, leerCuerpo, normalizar } from "@/lib/servidor";
import { appUrl } from "@/lib/sitio";

export const runtime = "nodejs";

type Modo = "propio" | "firebase" | "espera" | "sin-compra" | "invalido" | "limite" | "error";
const ok = (modo: Modo) => Response.json({ modo });

/** Día en hora de Ciudad de México (AAAA-MM-DD). */
const hoyMx = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

/** El buzón real: sin +etiqueta y, en Gmail, sin puntos. Así las variantes de un correo comparten el mismo cupo. */
function buzon(email: string) {
  let [local, dom] = email.split("@");
  local = local.split("+")[0];
  if (dom === "googlemail.com") dom = "gmail.com";
  if (dom === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${dom}`;
}

/** Hasta 1 correo por minuto y 6 por día para cada buzón: evita usar la página para llenarle el buzón a alguien. */
async function permitido(email: string): Promise<"espera" | "tope" | "ok"> {
  const ref = db().collection("enlaces").doc(createHash("sha256").update(buzon(email)).digest("hex"));
  const hoy = hoyMx();
  return db().runTransaction(async (tx) => {
    const l = ((await tx.get(ref)).data() ?? {}) as { ultimo?: number; dia?: string; n?: number };
    const n = l.dia === hoy ? l.n ?? 0 : 0;
    if (l.ultimo && Date.now() - l.ultimo < 60_000) return "espera";
    if (n >= 6) return "tope";
    tx.set(ref, { ultimo: Date.now(), dia: hoy, n: n + 1 });
    return "ok";
  });
}

// Hasta 10 respuestas "sin compra" por hora para cada IP: frena a quien prueba correos para saber quién compró.
// En memoria: Railway corre un solo proceso.
const intentos = new Map<string, { hora: number; n: number }>();
function otroIntento(req: Request) {
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "?";
  const hora = Math.floor(Date.now() / 3_600_000);
  if (intentos.size > 5000) for (const [k, v] of intentos) if (v.hora !== hora) intentos.delete(k);
  const v = intentos.get(ip);
  const n = v?.hora === hora ? v.n + 1 : 1;
  intentos.set(ip, { hora, n });
  return n <= 10;
}

function origen(req: Request) {
  if (appUrl()) return appUrl();
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return host ? `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}` : new URL(req.url).origin;
}

export async function POST(req: Request) {
  let email = "";
  try {
    const cuerpo = JSON.parse(await leerCuerpo(req, 2048)) as { email?: unknown };
    email = typeof cuerpo.email === "string" ? normalizar(cuerpo.email) : "";
  } catch { return ok("invalido"); }
  if (email.length > 200 || !/^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email)) return ok("invalido");

  let compra: Awaited<ReturnType<typeof compraDe>>;
  try { compra = await compraDe(email); } catch (e) { console.error("enlace", e); return ok("error"); }
  if (!compra?.productos?.pack) return ok(otroIntento(req) ? "sin-compra" : "limite");

  try {
    const p = await permitido(email);
    // "espera": ya se mandó uno hace menos de un minuto. "tope": se acabaron los del día; que lo mande Firebase.
    if (p === "espera") return ok("espera");
    if (p === "tope") return ok("firebase");
    await asegurarUsuario(email);
    // Sin correo propio, el link lo manda Firebase.
    if (!process.env.RESEND_API_KEY) return ok("firebase");
    const link = await authAdmin().generateSignInWithEmailLink(email, { url: `${origen(req)}/entrar`, handleCodeInApp: true });
    return ok((await correoAcceso(email, link)) ? "propio" : "firebase");
  } catch (e) {
    console.error("enlace", e);
    return ok("firebase");
  }
}
