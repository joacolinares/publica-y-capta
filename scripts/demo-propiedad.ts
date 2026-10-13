// Prueba del generador de propiedades sin Firebase: npm run demo:propiedad
import { writeFileSync, mkdirSync } from "node:fs";
import { marca, MEDIDAS } from "../lib/disenos";
import { PERFIL_EJEMPLO } from "../lib/perfil";
import { postPropiedad, PropiedadSchema, textoPropiedad } from "../lib/propiedad";
import { png } from "../lib/render";

const out = process.argv[2] || "demo-salida";
mkdirSync(out, { recursive: true });
const m = marca(PERFIL_EJEMPLO);
const x = PropiedadSchema.parse({ operacion: "venta", tipo: "Casa", colonia: "Ciudad Granja", recamaras: "3", banos: "2.5", m2: "180", precio: "4250000", caracteristicas: ["Cocina integral", "Jardín", "2 lugares de estacionamiento"], creditos: ["bancario", "Infonavit"] });
writeFileSync(`${out}/propiedad.png`, await png(postPropiedad(m, x), MEDIDAS.feed.width, MEDIDAS.feed.height));
console.log(textoPropiedad(m, x));
