// Firebase del lado del servidor: compras, perfiles, archivos y verificación de sesión.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/** Lee el JSON de la cuenta de servicio tal como lo pegue la persona: entero, en una línea, con saltos reales o en base64. */
function cuentaDeServicio() {
  const crudo = (process.env.FIREBASE_SERVICE_ACCOUNT || "").trim().replace(/^'([\s\S]*)'$/, "$1");
  if (!crudo) return {};
  for (const t of [crudo, crudo.replace(/\r?\n/g, "\\n"), Buffer.from(crudo, "base64").toString("utf8")]) {
    try { return JSON.parse(t); } catch { /* sigue con el siguiente formato */ }
  }
  throw new Error("FIREBASE_SERVICE_ACCOUNT no es un JSON válido: pega el contenido completo del archivo .json de la cuenta de servicio.");
}

function app() {
  if (getApps().length) return getApps()[0];
  return initializeApp({ credential: cert(cuentaDeServicio()), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
}

export const db = () => getFirestore(app());
export const bucket = () => getStorage(app()).bucket();
export const authAdmin = () => getAuth(app());

export type Productos = { pack: boolean; bump: boolean; upsell: boolean };
export type Compra = { email: string; productos: Productos; activo: boolean; ordenes: Record<string, { productos: (keyof Productos)[]; estado: string; fecha: string }> };

export const normalizar = (email: string) => email.trim().toLowerCase();

/** Lee la compra de un correo. Si no hay pack vigente (webhook perdido), la busca en la API de Impul, como máximo cada 10 minutos. */
export async function compraDe(email: string): Promise<Compra | null> {
  const id = normalizar(email);
  const ref = db().collection("compras").doc(id);
  const actual = (await ref.get()).data() as Compra | undefined;
  if (actual?.productos?.pack) return actual;
  const busqueda = db().collection("busquedas").doc(id);
  const ultima = (await busqueda.get()).data()?.revisado as number | undefined;
  if (ultima && Date.now() - ultima < 10 * 60 * 1000) return actual ?? null;
  await busqueda.set({ revisado: Date.now() });
  const { buscarEnImpul } = await import("./impul");
  const ordenes = await buscarEnImpul(email);
  for (const o of ordenes) await registrarOrden(o);
  return ((await ref.get()).data() as Compra | undefined) ?? null;
}

export type Orden = { id: string; email: string; estado: "approved" | "refunded" | "chargeback"; productos: (keyof Productos)[]; fecha: string };

/** Guarda o actualiza una orden y recalcula qué productos tiene el comprador. */
export async function registrarOrden(o: Orden) {
  const ref = db().collection("compras").doc(normalizar(o.email));
  await db().runTransaction(async (tx) => {
    const actual = ((await tx.get(ref)).data() as Compra | undefined) ?? { email: normalizar(o.email), productos: { pack: false, bump: false, upsell: false }, activo: false, ordenes: {} };
    actual.ordenes ??= {};
    // Un reembolso o contracargo es definitivo: un "approved" que llega tarde o repetido no devuelve el acceso.
    const previo = actual.ordenes[o.id]?.estado;
    if (o.estado === "approved" && (previo === "refunded" || previo === "chargeback")) return;
    actual.ordenes[o.id] = { productos: o.productos, estado: o.estado, fecha: o.fecha };
    const vigentes = Object.values(actual.ordenes).filter((x) => x.estado === "approved");
    const tiene = (p: keyof Productos) => vigentes.some((x) => x.productos.includes(p));
    actual.productos = { pack: tiene("pack"), bump: tiene("bump"), upsell: tiene("upsell") };
    actual.activo = actual.productos.pack || actual.productos.bump || actual.productos.upsell;
    tx.set(ref, actual);
  });
}

/** Verifica el token de Firebase del encabezado Authorization y que el correo tenga una compra vigente. */
export async function sesion(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) throw new ErrorHttp(401, "Inicia sesión con tu correo.");
  // checkRevoked + email_verified: solo vale un correo probado con el link mágico (nadie puede registrarse con el correo de otro).
  const u = await getAuth(app()).verifyIdToken(token, true).catch(() => null);
  if (!u?.email || u.email_verified !== true) throw new ErrorHttp(401, "Tu sesión venció. Vuelve a entrar con tu correo.");
  const compra = await compraDe(u.email);
  if (!compra?.productos?.pack) throw new ErrorHttp(403, "No encontramos una compra con este correo. Entra con el mismo correo que usaste al pagar.");
  return { uid: u.uid, email: normalizar(u.email), compra };
}

/** Deja lista la cuenta de acceso de un comprador. La app nunca crea cuentas con contraseña, así que una cuenta
 *  con el correo sin verificar solo puede venir de alguien que se registró con el correo de otro: se borra y se crea de nuevo. */
export async function asegurarUsuario(email: string) {
  const a = getAuth(app());
  const correo = normalizar(email);
  const existente = await a.getUserByEmail(correo).catch(() => null);
  if (existente?.emailVerified) return existente.uid;
  if (existente) await a.deleteUser(existente.uid);
  return (await a.createUser({ email: correo, emailVerified: false })).uid;
}

/** Limita la generación: una a la vez por usuario y hasta 10 por día (cuida el costo de la IA y el correo). */
export async function reservarGeneracion(uid: string) {
  const ref = db().collection("limites").doc(uid);
  const hoy = new Date().toISOString().slice(0, 10);
  await db().runTransaction(async (tx) => {
    const l = ((await tx.get(ref)).data() ?? {}) as { enCurso?: number; dia?: string; usadas?: number };
    if (l.enCurso && Date.now() - l.enCurso < 10 * 60 * 1000) throw new ErrorHttp(429, "Tu pack ya se está armando. Espera a que termine" + (process.env.RESEND_API_KEY ? "; también te llega por correo." : " y vuelve a intentarlo en unos minutos."));
    const usadas = l.dia === hoy ? l.usadas ?? 0 : 0;
    if (usadas >= 10) throw new ErrorHttp(429, "Ya armaste tu pack 10 veces hoy. Vuelve a intentarlo mañana.");
    tx.set(ref, { enCurso: Date.now(), dia: hoy, usadas: usadas + 1 });
  });
  return () => ref.set({ enCurso: 0 }, { merge: true });
}

/** Lee el cuerpo como texto con un tope de bytes (evita que un pedido gigante tumbe el servidor). */
export async function leerCuerpo(req: Request, max: number) {
  if (Number(req.headers.get("content-length") ?? 0) > max) throw new ErrorHttp(413, "El archivo es demasiado grande.");
  const reader = req.body?.getReader();
  if (!reader) return "";
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) { await reader.cancel(); throw new ErrorHttp(413, "El archivo es demasiado grande."); }
    partes.push(value);
  }
  return Buffer.concat(partes).toString("utf8");
}

export class ErrorHttp extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function responderError(e: unknown) {
  if (e instanceof ErrorHttp) return Response.json({ error: e.message }, { status: e.status });
  console.error(e);
  return Response.json({ error: "Algo falló de nuestro lado. Intenta de nuevo en un minuto." }, { status: 500 });
}

/** Sube un archivo a Storage. Reintenta hasta 3 veces si la conexión se corta o Storage responde 429/5xx (sobrescribir es seguro). */
export async function subir(ruta: string, datos: Buffer, contentType: string) {
  for (let intento = 1; ; intento++) {
    try { return await bucket().file(ruta).save(datos, { contentType, resumable: false }); }
    catch (e) {
      const codigo = (e as { code?: string | number }).code;
      const pasajero = ["EPIPE", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EAI_AGAIN"].includes(String(codigo)) || codigo === 429 || (typeof codigo === "number" && codigo >= 500);
      if (intento >= 3 || !pasajero) throw e;
      await new Promise((r) => setTimeout(r, 500 * intento));
    }
  }
}

/** Guarda una imagen (data URL) del usuario en Storage y la devuelve como data URL normalizada. */
export async function guardarImagen(uid: string, nombre: "logo" | "foto", dataUrl: string) {
  const m = dataUrl.match(/^data:(image\/(png|jpeg));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new ErrorHttp(400, "La imagen tiene que ser PNG o JPG.");
  const buf = Buffer.from(m[3], "base64");
  if (buf.length > 3 * 1024 * 1024) throw new ErrorHttp(400, "La imagen pesa más de 3 MB. Usa una más chica.");
  await subir(`usuarios/${uid}/${nombre}`, buf, m[1]);
}

export async function leerImagen(uid: string, nombre: "logo" | "foto") {
  const f = bucket().file(`usuarios/${uid}/${nombre}`);
  const [existe] = await f.exists();
  if (!existe) return undefined;
  const [[buf], [meta]] = await Promise.all([f.download(), f.getMetadata()]);
  return `data:${meta.contentType};base64,${buf.toString("base64")}`;
}
