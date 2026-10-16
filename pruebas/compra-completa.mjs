// Compra completa contra los emuladores de Firebase: webhook, acceso, perfil, generación, propiedad y reembolso.
import { createHmac } from "node:crypto";
const APP = "http://localhost:3124", AUTH = "http://127.0.0.1:9099", P = "demo-pyc", KEY = "fake-api-key";
const resultados = [];
const check = (nombre, ok, extra = "") => { resultados.push(ok); console.log(`${ok ? "ok   " : "FALLA"} ${nombre} ${extra}`); };
const firmar = (cuerpo, ts = String(Math.floor(Date.now() / 1000))) => ({ "X-Impultienda-Timestamp": ts, "X-Impultienda-Signature": createHmac("sha256", "whsec").update(`${ts}.${cuerpo}`).digest("hex"), "Content-Type": "application/json" });
const webhook = async (ev) => { const b = JSON.stringify(ev); const r = await fetch(`${APP}/api/webhooks/impul`, { method: "POST", headers: firmar(b), body: b }); return [r.status, await r.json()]; };
const orden = (id, event, email, items, extra = {}) => ({ id, event, created_at: new Date().toISOString(), data: { order_id: `o-${id.split("-")[0]}`, status: "approved", customer: { email }, items, ...extra } });
const idt = async (path, body) => (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/${path}?key=${KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
async function tokenPorLink(email) {
  await idt("accounts:sendOobCode", { requestType: "EMAIL_SIGNIN", email, continueUrl: `${APP}/entrar`, canHandleCodeInApp: true });
  const codes = (await (await fetch(`${AUTH}/emulator/v1/projects/${P}/oobCodes`)).json()).oobCodes.filter((c) => c.email === email && c.requestType === "EMAIL_SIGNIN");
  const r = await idt("accounts:signInWithEmailLink", { email, oobCode: codes.at(-1).oobCode });
  return r.idToken;
}
const api = async (ruta, token, init = {}) => { const r = await fetch(`${APP}${ruta}`, { ...init, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) } }); let j = null; try { j = await r.json(); } catch {} return [r.status, j]; };

const comprador = "laura@ejemplo.mx";
// 1. Webhooks
let [s, j] = await fetch(`${APP}/api/webhooks/impul`, { method: "POST", body: "{}" }).then(async (r) => [r.status, await r.json()]);
check("webhook sin firma → 401", s === 401);
const grande = "x".repeat(300 * 1024);
s = (await fetch(`${APP}/api/webhooks/impul`, { method: "POST", headers: firmar(grande), body: grande })).status;
check("webhook gigante → 413", s === 413, String(s));
[s, j] = await webhook(orden("e1-a", "order.approved", "Laura@Ejemplo.mx ", [{ product_id: "P", type: "main" }, { product_id: "B", type: "bonus" }]));
check("webhook pack+bump → 200", s === 200 && j.ok, JSON.stringify(j));
[s, j] = await webhook(orden("e1-a", "order.approved", comprador, [{ product_id: "P" }]));
check("webhook repetido → repetido", j.repetido === true, JSON.stringify(j));
[s, j] = await webhook(orden("e9-a", "order.approved", "otro@x.com", [{ product_id: "ZZZ" }]));
check("producto desconocido → ignorado", j.ignorado === "producto desconocido", JSON.stringify(j));

// 2. Sesión con correo NO verificado (registro con contraseña) no entra
const falso = await idt("accounts:signUp", { email: comprador, password: "atacante123", returnSecureToken: true });
if (falso.idToken) { [s] = await api("/api/acceso", falso.idToken); check("token sin verificar → 401", s === 401, String(s)); }
else check("registro con contraseña bloqueado", true, JSON.stringify(falso.error?.message));

// 3. Sesión real con link
const token = await tokenPorLink(comprador);
[s, j] = await api("/api/acceso", token);
check("acceso con link → 200 pack+bump", s === 200 && j.productos.pack && j.productos.bump && !j.productos.upsell, JSON.stringify(j?.productos ?? j));
const nadie = await tokenPorLink("nadie@x.com");
[s, j] = await api("/api/acceso", nadie);
check("sin compra → 403 en español", s === 403 && /compra/.test(j.error), j.error);

// 4. Perfil
const perfil = { nombre: "Laura Gómez", nombreComercial: "Laura Gómez Bienes Raíces", whatsapp: "33 1234 5678", correo: comprador, domicilio: "Av. Patria 1234, Zapopan, Jal.", ciudad: "Zapopan", zona: "Zapopan", colonias: ["Ciudad Granja"], colorPrincipal: "#1F3A5F", colorAcento: "#E8A33D", especialidad: "ambas", cliente: "familias", tono: "cercano", genero: "a", aniosExperiencia: "15 años", historia: "", usuarioRedes: "@laura" };
[s, j] = await api("/api/perfil", token, { method: "PUT", body: JSON.stringify({ perfil: { ...perfil, whatsapp: "1" } }) });
check("perfil inválido → mensaje en español", s === 400 && /WhatsApp/.test(j.error), j.error);
[s, j] = await api("/api/perfil", token, { method: "PUT", body: JSON.stringify({ perfil }) });
check("perfil → 200", s === 200, JSON.stringify(j));

// 5. Generar (dos a la vez: una gana, la otra 429)
const t0 = Date.now();
const [g1, g2] = await Promise.all([api("/api/generar", token, { method: "POST" }), new Promise((r) => setTimeout(r, 300)).then(() => api("/api/generar", token, { method: "POST" }))]);
const okG = [g1, g2].find(([st]) => st === 200), dup = [g1, g2].find(([st]) => st === 429);
check("generar → 200 con url", Boolean(okG?.[1]?.url), `${((Date.now() - t0) / 1000).toFixed(1)} s ${JSON.stringify(okG?.[1]?.resumen ?? g1[1])}`);
check("segunda generación simultánea → 429", Boolean(dup), dup?.[1]?.error);
if (okG) {
  const z = await fetch(okG[1].url);
  const buf = Buffer.from(await z.arrayBuffer());
  check("link de descarga baja el ZIP", z.ok && buf.subarray(0, 2).toString() === "PK", `${z.status} ${buf.length} bytes ${okG[1].url.slice(0, 60)}`);
}
[s, j] = await api("/api/generar", token, { method: "POST" });
check("generar otra vez al terminar → 200", s === 200, j?.error ?? "");

// 5b. Pedir el link para entrar: sin Resend, a quien compró se lo manda Firebase; a los demás no se les manda nada.
for (const [correo, esperado] of [[comprador, "firebase"], ["nadie@x.com", "sin-compra"], ["no-es-correo", "invalido"]]) {
  [s, j] = await api("/api/enlace", "", { method: "POST", body: JSON.stringify({ email: correo }) });
  check(`enlace ${correo} → ${esperado}`, s === 200 && j?.modo === esperado, `${s} ${JSON.stringify(j)}`);
}

// 6. Nueva propiedad
const base = { operacion: "venta", tipo: "Casa", colonia: "Jardines", precio: "2450000", recamaras: "3", banos: "2", m2: "120", caracteristicas: [], creditos: ["Infonavit"] };
[s, j] = await api("/api/propiedad", token, { method: "POST", body: JSON.stringify({ ...base, foto: "http://169.254.169.254/latest/meta-data" }) });
check("foto con URL → 400", s === 400, j?.error);
const png1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
[s, j] = await api("/api/propiedad", token, { method: "POST", body: JSON.stringify({ ...base, foto: png1 }) });
check("propiedad → 200 con texto NOM", s === 200 && /^data:image\/(png|jpeg);base64,/.test(j.imagen) && /Av\. Patria/.test(j.texto) && /gratuito/.test(j.texto), (j?.texto ?? j?.error ?? "").split("\n")[0]);
check("propiedad trae la historia", /^data:image\/(png|jpeg);base64,/.test(j?.historia ?? ""), String(j?.historia ?? "").slice(0, 30));

// 7. Reembolso corta el acceso y un approved tardío no lo devuelve
[s, j] = await webhook(orden("e1-r", "order.refunded", comprador, [{ product_id: "P" }, { product_id: "B" }]));
check("reembolso → 200", s === 200, JSON.stringify(j));
const token2 = await tokenPorLink(comprador);
[s, j] = await api("/api/acceso", token2);
check("después del reembolso → 403", s === 403, String(s));
[s, j] = await webhook(orden("e1-late", "order.approved", comprador, [{ product_id: "P" }]));
[s, j] = await api("/api/acceso", token2);
check("approved tardío no devuelve acceso", s === 403, String(s));
[s, j] = await webhook(orden("e2-a", "order.approved", comprador, [{ product_id: "P" }]));
[s, j] = await api("/api/acceso", token2);
check("compra nueva sí da acceso", s === 200, String(s));

console.log(`\n${resultados.filter(Boolean).length}/${resultados.length} ok`);
process.exitCode = resultados.every(Boolean) ? 0 : 1;
