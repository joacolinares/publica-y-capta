import { readFileSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "fonts");
const f = (file: string) => readFileSync(path.join(dir, file));

type Fuente = { name: string; data: Buffer; weight: 400 | 500 | 600 | 700 | 800; style: "normal" | "italic" };
let cache: Fuente[] | null = null;

// Todas con licencia OFL (Google Fonts): uso comercial permitido.
export function fuentes() {
  cache ??= [
    { name: "Montserrat", data: f("Montserrat-400.woff"), weight: 400, style: "normal" },
    { name: "Montserrat", data: f("Montserrat-600.woff"), weight: 600, style: "normal" },
    { name: "Montserrat", data: f("Montserrat-700.woff"), weight: 700, style: "normal" },
    { name: "Montserrat", data: f("Montserrat-800.woff"), weight: 800, style: "normal" },
    { name: "Playfair", data: f("PlayfairDisplay-700.woff"), weight: 700, style: "normal" },
    { name: "Playfair", data: f("PlayfairDisplay-700-italic.woff"), weight: 700, style: "italic" },
    { name: "Cormorant", data: f("CormorantGaramond-500.woff"), weight: 500, style: "normal" },
    { name: "Cormorant", data: f("CormorantGaramond-600.woff"), weight: 600, style: "normal" },
    { name: "Cormorant", data: f("CormorantGaramond-500-italic.woff"), weight: 500, style: "italic" },
    { name: "Cormorant", data: f("CormorantGaramond-600-italic.woff"), weight: 600, style: "italic" },
    { name: "Pinyon", data: f("PinyonScript-400.woff"), weight: 400, style: "normal" },
  ];
  return cache;
}
