// La IA se llama solo cuando cambia el perfil: con el mismo perfil, los lotes salen de lo guardado.
// Sin red: un servidor local hace de API de Anthropic y devuelve los mismos textos con una marca.
// Uso: ./node_modules/.bin/tsx pruebas/cache-ia.ts
import { createServer } from "node:http";
import type { Perfil } from "../lib/perfil";

let llamadas = 0, fallarLote: number | null = null, vacio = false;
const api = createServer((req, res) => {
  let cuerpo = "";
  req.on("data", (c) => (cuerpo += c));
  req.on("end", () => {
    llamadas++;
    const pedido = JSON.parse(cuerpo) as { messages: { content: string }[] };
    const textos = JSON.parse(pedido.messages[0].content.split("Textos a adaptar (JSON):\n")[1]) as { dia: number; post: string; whatsapp: string }[];
    if (textos[0].dia === fallarLote) { res.writeHead(500, { "content-type": "application/json" }); return res.end('{"type":"error","error":{"type":"api_error","message":"falla de prueba"}}'); }
    const salida = { textos: vacio ? [] : textos.map((t) => ({ ...t, whatsapp: `${t.whatsapp} ✓` })) };
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ id: "msg_prueba", type: "message", role: "assistant", model: "claude-opus-5-5", content: [{ type: "text", text: JSON.stringify(salida) }], stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } }));
  });
});
await new Promise<void>((ok) => api.listen(0, "127.0.0.1", ok));
const { port } = api.address() as { port: number };
process.env.ANTHROPIC_API_KEY = "prueba";
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;

const { adaptarConIA } = await import("../lib/ia");
const { TEXTOS } = await import("../lib/personalizar");

let ok = 0, n = 0;
const check = (t: string, c: boolean, x = "") => { n++; if (c) ok++; console.log(c ? "ok   " : "FALLA", t, x); };

let guardado: Record<string, { dia: number; post: string; whatsapp: string }[]> = {};
let escrituras = 0;
const cache = { leer: async () => guardado, guardar: async (l: typeof guardado) => { guardado = l; escrituras++; } };
const perfil: Perfil = { nombre: "Laura Gómez", ciudad: "Guadalajara", zona: "Zapopan", colonias: ["Jardines"], especialidad: "venta", cliente: "familias", tono: "cercano" } as Perfil;

// 1. Primera vez: 4 lotes, 4 llamadas, se guardan los 4.
let r = await adaptarConIA(TEXTOS, perfil, cache);
check("primera vez llama a la IA por cada lote", llamadas === 4 && r.llamadas === 4, `${llamadas} llamadas`);
check("se guardan los 4 lotes", Object.keys(guardado).length === 4 && escrituras === 1, `${Object.keys(guardado).length} lotes`);
const adaptados = r.textos.size;
check("adapta los 45 textos no técnicos", adaptados === 45, String(adaptados));

// 2. Mismo perfil: cero llamadas, mismos textos y no se vuelve a escribir.
llamadas = 0;
r = await adaptarConIA(TEXTOS, perfil, cache);
check("mismo perfil no llama a la IA", llamadas === 0 && r.llamadas === 0, `${llamadas} llamadas`);
check("y entrega los mismos textos adaptados", r.textos.size === adaptados && [...r.textos.values()].every((t) => t.whatsapp.endsWith("✓")));
check("y no reescribe lo guardado", escrituras === 1, `${escrituras} escrituras`);

// 3. Cambia el perfil: vuelve a llamar y reemplaza lo guardado (no se acumulan lotes viejos).
llamadas = 0;
r = await adaptarConIA(TEXTOS, { ...perfil, zona: "Tlaquepaque" }, cache);
check("perfil distinto vuelve a llamar", llamadas === 4, `${llamadas} llamadas`);
check("lo guardado queda solo con el perfil nuevo", Object.keys(guardado).length === 4);

// 4. Si un lote falla, se guardan los demás y la próxima vez solo se pide el que faltó.
guardado = {}; llamadas = 0;
const candidatos = TEXTOS.filter((d) => !d.tecnico && d.publico !== "Propiedad");
fallarLote = candidatos[12].dia;
r = await adaptarConIA(TEXTOS, perfil, cache);
check("un lote con error usa el texto base y no se guarda", Object.keys(guardado).length === 3 && r.textos.size === adaptados - 12, `${Object.keys(guardado).length} lotes, ${r.textos.size} textos`);
fallarLote = null; llamadas = 0;
r = await adaptarConIA(TEXTOS, perfil, cache);
check("la vez siguiente solo pide el lote que faltó", llamadas === 1 && r.textos.size === adaptados && Object.keys(guardado).length === 4, `${llamadas} llamadas`);

// 5. Un lote que vuelve vacío no se guarda: la próxima vez se vuelve a pedir.
guardado = {}; llamadas = 0; vacio = true;
r = await adaptarConIA(TEXTOS, perfil, cache);
check("la IA devuelve lotes vacíos → no se guardan", r.textos.size === 0 && Object.keys(guardado).length === 0, `${Object.keys(guardado).length} lotes`);
vacio = false; llamadas = 0;
r = await adaptarConIA(TEXTOS, perfil, cache);
check("y la vez siguiente se vuelven a pedir", llamadas === 4 && r.textos.size === adaptados);

// 6. Si no se puede leer lo guardado, igual arma el pack (llamando a la IA).
llamadas = 0;
r = await adaptarConIA(TEXTOS, perfil, { leer: async () => { throw new Error("sin base"); }, guardar: async () => {} });
check("sin poder leer lo guardado, igual adapta", llamadas === 4 && r.textos.size === adaptados);

api.close();
console.log(`${ok}/${n} ok`);
process.exitCode = ok === n ? 0 : 1;
