// Firebase del lado del servidor: compras, perfiles, archivos y verificación de sesión.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function app() {
  if (getApps().length) return getApps()[0];
  const cuenta = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
  return initializeApp({ credential: cert(cuenta), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
}

export const db = () => getFirestore(app());
export const bucket = () => getStorage(app()).bucket();

export type Productos = { pack: boolean; bump: boolean; upsell: boolean };
export type Compra = { email: string; productos: Productos; activo: boolean; ordenes: Record<string, { productos: (keyof Productos)[]; estado: string; fecha: string }> };

export const normalizar = (email: string) => email.trim().toLowerCase();

/** Lee la compra de un correo. Si el webhook no llegó, la busca en la API de Impul. */
export async function compraDe(email: string): Promise<Compra | null> {
  const ref = db().collection("compras").doc(normalizar(email));
  const snap = await ref.get();
  if (snap.exists) return snap.data() as Compra;
  const { buscarEnImpul } = await import("./impul");
  const ordenes = await buscarEnImpul(email);
  if (!ordenes.length) return null;
  for (const o of ordenes) await registrarOrden(o);
  return ((await ref.get()).data() as Compra) ?? null;
}

export type Orden = { id: string; email: string; estado: "approved" | "refunded" | "chargeback"; productos: (keyof Productos)[]; fecha: string };

/** Guarda o actualiza una orden y recalcula qué productos tiene el comprador. */
export async function registrarOrden(o: Orden) {
  const ref = db().collection("compras").doc(normalizar(o.email));
  await db().runTransaction(async (tx) => {
    const actual = ((await tx.get(ref)).data() as Compra | undefined) ?? { email: normalizar(o.email), productos: { pack: false, bump: false, upsell: false }, activo: false, ordenes: {} };
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
  const u = await getAuth(app()).verifyIdToken(token).catch(() => null);
  if (!u?.email) throw new ErrorHttp(401, "Tu sesión venció. Vuelve a entrar con tu correo.");
  const compra = await compraDe(u.email);
  if (!compra?.activo) throw new ErrorHttp(403, "No encontramos una compra con este correo. Entra con el mismo correo que usaste al pagar.");
  return { uid: u.uid, email: normalizar(u.email), compra };
}

export class ErrorHttp extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function responderError(e: unknown) {
  if (e instanceof ErrorHttp) return Response.json({ error: e.message }, { status: e.status });
  console.error(e);
  return Response.json({ error: "Algo falló de nuestro lado. Intenta de nuevo en un minuto." }, { status: 500 });
}

/** Guarda una imagen (data URL) del usuario en Storage y la devuelve como data URL normalizada. */
export async function guardarImagen(uid: string, nombre: "logo" | "foto", dataUrl: string) {
  const m = dataUrl.match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/);
  if (!m) throw new ErrorHttp(400, "La imagen tiene que ser PNG o JPG.");
  const buf = Buffer.from(m[3], "base64");
  if (buf.length > 3 * 1024 * 1024) throw new ErrorHttp(400, "La imagen pesa más de 3 MB. Usa una más chica.");
  await bucket().file(`usuarios/${uid}/${nombre}`).save(buf, { contentType: m[1], resumable: false });
}

export async function leerImagen(uid: string, nombre: "logo" | "foto") {
  const f = bucket().file(`usuarios/${uid}/${nombre}`);
  const [existe] = await f.exists();
  if (!existe) return undefined;
  const [[buf], [meta]] = await Promise.all([f.download(), f.getMetadata()]);
  return `data:${meta.contentType};base64,${buf.toString("base64")}`;
}
