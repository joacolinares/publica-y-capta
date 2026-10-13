// Genera un pack de prueba con un perfil inventado, sin Firebase ni IA: npm run demo
import { writeFileSync, mkdirSync } from "node:fs";
import { PERFIL_EJEMPLO } from "../lib/perfil";
import { armarPaquete } from "../lib/paquete";

const out = process.argv[2] || "demo-salida";
mkdirSync(out, { recursive: true });
const t0 = Date.now();
const { zip, resumen } = await armarPaquete(PERFIL_EJEMPLO, { usarIA: false, bump: true, upsell: true });
writeFileSync(`${out}/publica-y-capta.zip`, zip);
console.log(resumen, `${((Date.now() - t0) / 1000).toFixed(1)} s`);
