// Webhook de Impul Tienda: activa el acceso al aprobarse el pago y lo corta con reembolso o contracargo.
import { correoBienvenida } from "@/lib/correo";
import { aOrden, firmaValida } from "@/lib/impul";
import { db, registrarOrden, type Orden } from "@/lib/servidor";

export const runtime = "nodejs";

const ESTADO: Record<string, Orden["estado"]> = { "order.approved": "approved", "order.refunded": "refunded", "order.chargeback": "chargeback" };

export async function POST(req: Request) {
  const cuerpo = await req.text();
  if (!firmaValida(cuerpo, req.headers.get("x-impultienda-timestamp"), req.headers.get("x-impultienda-signature")))
    return Response.json({ error: "firma inválida" }, { status: 401 });

  const ev = JSON.parse(cuerpo) as { id: string; event: string; data: Parameters<typeof aOrden>[0] & { is_post_purchase?: boolean } };
  const estado = ESTADO[ev.event];
  if (!estado) return Response.json({ ok: true, ignorado: ev.event });

  // Idempotencia: Impul puede reenviar la misma entrega.
  const visto = db().collection("webhooks").doc(ev.id);
  if ((await visto.get()).exists) return Response.json({ ok: true, repetido: true });

  await registrarOrden(aOrden(ev.data, estado));
  await visto.set({ evento: ev.event, orden: ev.data.order_id, recibido: new Date().toISOString() });
  // Respaldo del correo de entrega de Impul (no se repite en el upsell post-compra).
  if (estado === "approved" && !ev.data.is_post_purchase) await correoBienvenida(ev.data.customer.email).catch(() => false);
  return Response.json({ ok: true });
}
