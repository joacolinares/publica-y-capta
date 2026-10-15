// Convierte content/textos-90-dias.md en content/textos.json (lo que usa la app).
import { readFileSync, writeFileSync } from "node:fs";

const md = readFileSync(new URL("../content/textos-90-dias.md", import.meta.url), "utf8");
const plan = readFileSync(new URL("../content/plan-90-dias.md", import.meta.url), "utf8");

const formatos = {};
for (const m of plan.matchAll(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)) {
  formatos[Number(m[1])] = m[4].trim();
}

const quote = (block) =>
  block
    .split("\n")
    .filter((l) => l.startsWith(">"))
    .map((l) => l.replace(/^> ?/, ""))
    .join("\n")
    .trim();

const dias = [];
const partes = md.split(/^## Día /m).slice(1);
for (const p of partes) {
  const head = p.split("\n")[0];
  const [num, publico, ...resto] = head.split(" · ");
  const dia = Number(num);
  const tema = resto.join(" · ").trim();
  const sec = (titulo) => {
    const re = new RegExp(`\\*\\*${titulo}[^*]*\\*\\*([\\s\\S]*?)(?=\\n\\*\\*[A-ZÁÉÍÓÚ]|\\n---|\\n## |$)`);
    const m = p.match(re);
    return m ? m[1] : "";
  };
  const post = quote(sec("Instagram y Facebook")) || quote(sec("Texto del reel"));
  const whatsapp = quote(sec("Estado de WhatsApp"));
  // El guion lleva sus propias negritas (**La idea:**, **Cierre:**...): termina solo en otra sección del día.
  const guionM = p.match(/\*\*Guion del reel\*\*\s*(?:\(([^)\n]*)\))?([\s\S]*?)(?=\n\*\*(?:Estado de WhatsApp|Instagram y Facebook|Texto del reel|Story|Nota para el asesor)|\n---|\n## |$)/);
  const notaM = p.match(/\*\*Nota para el asesor[^*]*\*\*\s*([^\n]+)/);
  const tecnico = p.match(/_Revisión técnica: ([^_]+)_/);
  const storyM = p.match(/\*\*Story\*?\*?:?\*?\*?[^\n]*\n?([^\n]*)/);
  dias.push({
    dia,
    publico: publico.trim(),
    tema,
    formato: formatos[dia] || "",
    post,
    whatsapp,
    guion: guionM ? guionM[2].trim() : "",
    guionTipo: guionM?.[1]?.trim() ?? "",
    nota: notaM ? notaM[1].trim().replace(/^\p{Ll}/u, (c) => c.toUpperCase()) : "",
    tecnico: tecnico ? tecnico[1].trim() : null,
    story: storyM ? storyM[0].replace(/\*\*/g, "").trim() : "",
  });
}

const faltan = dias.filter((d) => !d.post || !d.whatsapp || (/^Reel/.test(d.formato) && !d.guion)).map((d) => d.dia);
if (dias.length !== 90 || faltan.length) {
  console.error(`Error: ${dias.length} días, sin texto o sin guion: ${faltan.join(", ")}`);
  process.exit(1);
}
writeFileSync(new URL("../content/textos.json", import.meta.url), JSON.stringify(dias, null, 1));
console.log(`OK: ${dias.length} días, ${dias.filter((d) => d.tecnico).length} técnicos, ${dias.filter((d) => d.guion).length} guiones`);

// Extras: guiones extra, bonos, bump y upsell (Markdown tal cual; la app los convierte a HTML).
const extras = {};
for (const [k, f] of [["guionesExtra", "guiones-extra.md"], ["bonos", "bonos.md"], ["bump", "bump-whatsapp.md"], ["upsell", "upsell-captacion.md"]]) {
  try { extras[k] = readFileSync(new URL(`../content/${f}`, import.meta.url), "utf8"); } catch { extras[k] = ""; console.warn(`Aviso: falta content/${f}`); }
}
writeFileSync(new URL("../content/extras.json", import.meta.url), JSON.stringify(extras));
console.log(`OK extras: ${Object.entries(extras).filter(([, v]) => v).map(([k]) => k).join(", ")}`);
