// Integración con Impul Tienda: firma de webhooks y búsqueda de órdenes por API (respaldo).
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Orden, Productos } from "./servidor";

/** Firma: HMAC-SHA256 en hex de `${timestamp}.${cuerpo}` con el secreto del webhook. */
export function firmaValida(cuerpo: string, timestamp: string | null, firma: string | null) {
  const secreto = process.env.IMPULTIENDA_WEBHOOK_SECRET;
  if (!secreto || !timestamp || !firma) return false;
  // Acepta segundos, milisegundos o ISO; rechaza cualquier otra cosa y lo que tenga más de 10 minutos.
  const t = /^\d+$/.test(timestamp) ? Number(timestamp) : Date.parse(timestamp);
  if (!Number.isFinite(t)) return false;
  const ms = t < 1e12 ? t * 1000 : t;
  if (Math.abs(Date.now() - ms) > 600_000) return false;
  const esperada = createHmac("sha256", secreto).update(`${timestamp}.${cuerpo}`).digest("hex");
  const a = Buffer.from(esperada), b = Buffer.from(firma.replace(/^sha256=/, ""));
  return a.length === b.length && timingSafeEqual(a, b);
}

type ItemImpul = { product_id: string; type?: string };
type DatosImpul = { order_id: string; status: string; customer: { email: string }; items: ItemImpul[]; order_created_at?: string };

/** Qué producto nuestro es cada ítem, según los ids de las variables de entorno.
 *  Si IMPUL_PRODUCTO_PACK está cargado, un id desconocido no da acceso; si no, cuenta como el pack. */
function producto(item: ItemImpul): keyof Productos | null {
  const id = String(item.product_id ?? "");
  const es = (v?: string) => Boolean(v) && id === v;
  if (es(process.env.IMPUL_PRODUCTO_BUMP)) return "bump";
  if (es(process.env.IMPUL_PRODUCTO_UPSELL)) return "upsell";
  if (process.env.IMPUL_PRODUCTO_PACK) return es(process.env.IMPUL_PRODUCTO_PACK) ? "pack" : null;
  return "pack";
}

export function aOrden(d: DatosImpul, estado: Orden["estado"]): Orden {
  const productos = [...new Set((d.items ?? []).map(producto).filter((x): x is keyof Productos => x !== null))];
  return { id: String(d.order_id), email: d.customer.email, estado, productos, fecha: d.order_created_at ?? new Date().toISOString() };
}

/** Respaldo si el webhook no llegó: busca órdenes aprobadas de ese correo (últimos 120 días). */
export async function buscarEnImpul(email: string): Promise<Orden[]> {
  const key = process.env.IMPULTIENDA_API_KEY;
  if (!key) return [];
  const base = process.env.IMPULTIENDA_API_URL || "https://api.impultienda.ar";
  const desde = new Date(Date.now() - 120 * 864e5).toISOString();
  const encontradas: Orden[] = [];
  let cursor: string | undefined;
  for (let pagina = 0; pagina < 20; pagina++) {
    const url = `${base}/v1/orders?status=approved&from=${desde}&limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) { console.error("Impul API", r.status, await r.text()); break; }
    const j = (await r.json()) as { data: DatosImpul[]; pagination?: { has_more: boolean; next_cursor?: string } };
    for (const d of j.data) if (d.customer?.email?.toLowerCase() === email.toLowerCase()) encontradas.push(aOrden(d, "approved"));
    if (!j.pagination?.has_more || !j.pagination.next_cursor) break;
    cursor = j.pagination.next_cursor;
  }
  return encontradas;
}
