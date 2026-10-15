// Prueba del generador de propiedades sin Firebase: npm run demo:propiedad [carpeta] [foto.jpg]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { MEDIDAS, prepararMarca } from "../lib/disenos";
import { PERFIL_EJEMPLO } from "../lib/perfil";
import { historiaPropiedad, postPropiedad, PropiedadSchema, textoPropiedad } from "../lib/propiedad";
import { imagen } from "../lib/render";

const out = process.argv[2] || "demo-salida";
const foto = process.argv[3] ? `data:image/jpeg;base64,${readFileSync(process.argv[3]).toString("base64")}` : undefined;
mkdirSync(out, { recursive: true });
const m = await prepararMarca(PERFIL_EJEMPLO);
const base = { operacion: "venta", tipo: "Casa", colonia: "Ciudad Granja", recamaras: "3", banos: "2.5", m2: "180", precio: "4250000", caracteristicas: ["Cocina integral", "Jardín", "2 lugares de estacionamiento"], creditos: ["bancario", "Infonavit"], foto };
for (const etiqueta of ["Recién captada", "Precio actualizado", "Vendida"] as const) {
  const x = PropiedadSchema.parse({ ...base, etiqueta });
  for (const [nombre, armar, f] of [["post", postPropiedad, MEDIDAS.feed], ["historia", historiaPropiedad, MEDIDAS.story]] as const) {
    const { el, conFoto } = await armar(m, x);
    const r = await imagen(el, f.width, f.height, conFoto);
    writeFileSync(`${out}/propiedad-${etiqueta.split(" ")[0].toLowerCase()}-${nombre}.${r.ext}`, r.buf);
  }
}
console.log(textoPropiedad(m, PropiedadSchema.parse(base)));
