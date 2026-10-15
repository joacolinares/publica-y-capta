// Intento de robo de cuenta: alguien se registra con el correo de una compradora antes de que ella entre.
import { createHash, createHmac } from "node:crypto";
const APP = "http://localhost:3124", AUTH = "http://127.0.0.1:9099", FS = "http://127.0.0.1:8080", P = "demo-pyc";
const idt = async (path, body) => (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/${path}?key=k`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
const firmar = (b, ts = String(Math.floor(Date.now() / 1000))) => ({ "X-Impultienda-Timestamp": ts, "X-Impultienda-Signature": createHmac("sha256", "whsec").update(`${ts}.${b}`).digest("hex"), "Content-Type": "application/json" });
const email = "compradora@x.com";
let ok = 0, n = 0;
const check = (t, c, x = "") => { n++; if (c) ok++; console.log(c ? "ok   " : "FALLA", t, x); };

const a = await idt("accounts:signUp", { email, password: "atacante123", returnSecureToken: true });
check("atacante se registra antes del pago", Boolean(a.idToken));
const b = JSON.stringify({ id: "t1", event: "order.approved", data: { order_id: "ot1", status: "approved", customer: { email }, items: [{ product_id: "P" }] } });
const r = await fetch(`${APP}/api/webhooks/impul`, { method: "POST", headers: firmar(b), body: b });
check("webhook aprobado", r.status === 200);
const p1 = await idt("accounts:signInWithPassword", { email, password: "atacante123", returnSecureToken: true });
check("la contraseña del atacante ya no sirve", !p1.idToken, p1.error?.message);
const a2 = await idt("accounts:signUp", { email, password: "otra12345", returnSecureToken: true });
check("no puede registrarse otra vez (correo tomado)", !a2.idToken, a2.error?.message);

await fetch(`${APP}/api/enlace`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
await idt("accounts:sendOobCode", { requestType: "EMAIL_SIGNIN", email, continueUrl: `${APP}/entrar`, canHandleCodeInApp: true });
const codes = (await (await fetch(`${AUTH}/emulator/v1/projects/${P}/oobCodes`)).json()).oobCodes.filter((c) => c.email === email);
const l = await idt("accounts:signInWithEmailLink", { email, oobCode: codes.at(-1).oobCode });
const acc = await fetch(`${APP}/api/acceso`, { headers: { Authorization: `Bearer ${l.idToken}` } });
check("compradora entra con el link", acc.status === 200, String(acc.status));
const p2 = await idt("accounts:signInWithPassword", { email, password: "atacante123", returnSecureToken: true });
check("y el atacante sigue afuera", !p2.idToken, p2.error?.message);
// /api/enlace deja 1 pedido por minuto por correo: se borra su contador en el emulador para pedir otro link enseguida.
await fetch(`${FS}/v1/projects/${P}/databases/(default)/documents/enlaces/${createHash("sha256").update(email).digest("hex")}`, { method: "DELETE", headers: { Authorization: "Bearer owner" } });
await fetch(`${APP}/api/enlace`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
const acc2 = await fetch(`${APP}/api/acceso`, { headers: { Authorization: `Bearer ${l.idToken}` } });
check("pedir otro link no la saca de su cuenta", acc2.status === 200, String(acc2.status));
const enlace = async (correo, ip) => (await (await fetch(`${APP}/api/enlace`, { method: "POST", headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) }, body: JSON.stringify({ email: correo }) })).json()).modo;
check("otro link enseguida → espera", (await enlace(email)) === "espera");
// Sin compra no se manda nada: ni nuestro correo ni el de Firebase.
const pr = await enlace("nadie@x.com");
const codigosNadie = (await (await fetch(`${AUTH}/emulator/v1/projects/${P}/oobCodes`)).json()).oobCodes.filter((c) => c.email === "nadie@x.com");
check("correo sin compra → sin-compra y no se manda link", pr === "sin-compra" && codigosNadie.length === 0, `${pr} ${codigosNadie.length}`);
const modos = [];
for (let i = 0; i < 11; i++) modos.push(await enlace(`prueba${i}@x.com`, "203.0.113.9"));
check("probar muchos correos desde una IP → limite", modos.slice(0, 10).every((m) => m === "sin-compra") && modos[10] === "limite", modos.join(","));
console.log(`${ok}/${n} ok`);
process.exitCode = ok === n ? 0 : 1;
