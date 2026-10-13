import { readFileSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "fonts");
const f = (file: string) => readFileSync(path.join(dir, file));

let cache: { name: string; data: Buffer; weight: 400 | 600 | 700 | 800; style: "normal" | "italic" }[] | null = null;

export function fuentes() {
  cache ??= [
    { name: "Montserrat", data: f("Montserrat-400.woff"), weight: 400, style: "normal" },
    { name: "Montserrat", data: f("Montserrat-600.woff"), weight: 600, style: "normal" },
    { name: "Montserrat", data: f("Montserrat-700.woff"), weight: 700, style: "normal" },
    { name: "Montserrat", data: f("Montserrat-800.woff"), weight: 800, style: "normal" },
    { name: "Playfair", data: f("PlayfairDisplay-700.woff"), weight: 700, style: "normal" },
    { name: "Playfair", data: f("PlayfairDisplay-700-italic.woff"), weight: 700, style: "italic" },
  ];
  return cache;
}
