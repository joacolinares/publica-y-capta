// Webhook de Impul Tienda: activa el acceso al aprobarse el pago y lo corta con reembolso o contracargo.
import { correoBienvenida } from "@/lib/correo";
import { aOrden, firmaValida } from "@/lib/impul";
import { asegurarUsuario, db, leerCuerpo, registrarOrden, ErrorHttp, type Orden } from "@/lib/servidor";

export const runtime = "nodejs";

const ESTADO: Record<string, Orden["estado"]> = { "order.approved": "approved", "order.refunded": "refunded", "order.chargeback": "chargeback" };

export async function POST(req: Request) {
  const ts = req.headers.get("x-impultienda-timestamp"), firma = req.headers.get("x-impultienda-signature");
  if (!ts || !firma) return Response.json({ error: "firma inválida" }, { status: 401 });
  let cuerpo: string;
  try { cuerpo = await leerCuerpo(req, 256 * 1024); }
  catch (e) { return Response.json({ error: e instanceof ErrorHttp ? e.message : "cuerpo inválido" }, { status: 413 }); }
  if (!firmaValida(cuerpo, ts, firma)) return Response.json({ error: "firma inválida" }, { status: 401 });

  const ev = JSON.parse(cuerpo) as { id: string; event: string; data: Parameters<typeof aOrden>[0] & { is_post_purchase?: boolean } };
  const estado = ESTADO[ev.event];
  if (!estado) return Response.json({ ok: true, ignorado: ev.event });

  const orden = aOrden(ev.data, estado);
  if (!orden.productos.length) {
    console.warn("Impul: orden sin productos conocidos", ev.data.order_id);
    return Response.json({ ok: true, ignorado: "producto desconocido" });
  }

  // Idempotencia: se reserva la entrega antes de procesarla, así dos reenvíos simultáneos no se procesan dos veces.
  const visto = db().collection("webhooks").doc(String(ev.id));
  try { await visto.create({ evento: ev.event, orden: orden.id, recibido: new Date().toISOString() }); }
  catch (e) {
    if ((e as { code?: number }).code === 6) return Response.json({ ok: true, repetido: true }); // ALREADY_EXISTS
    throw e;
  }
  try { await registrarOrden(orden); }
  catch (e) { await visto.delete().catch(() => null); throw e; } // que el reintento de Impul se procese

  if (estado === "approved") await asegurarUsuario(orden.email).catch((e) => console.error("Auth", e));
  // Respaldo del correo de entrega de Impul (no se repite en el upsell post-compra).
  if (estado === "approved" && !ev.data.is_post_purchase) await correoBienvenida(ev.data.customer.email).catch(() => false);
  return Response.json({ ok: true });
}
