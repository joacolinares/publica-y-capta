// Markdown mínimo a HTML para los extras (títulos, listas, tablas, citas, negritas y casillas).
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s: string) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(^|[\s(])_([^_\n]+)_(?=[\s.,;:)!?]|$)/g, "$1<i>$2</i>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

export function mdAHtml(md: string) {
  const out: string[] = [];
  const lineas = md.replace(/\r/g, "").split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (!l.trim()) continue;
    let m: RegExpMatchArray | null;
    if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { const n = Math.min(m[1].length + 1, 4); out.push(`<h${n}>${inline(m[2])}</h${n}>`); continue; }
    if (/^---+\s*$/.test(l)) { out.push("<hr>"); continue; }
    if (l.startsWith(">")) {
      const b: string[] = [];
      while (i < lineas.length && lineas[i].startsWith(">")) b.push(lineas[i++].replace(/^>\s?/, ""));
      i--; out.push(`<div class="post">${inline(b.join("\n"))}</div>`); continue;
    }
    if (l.startsWith("|")) {
      const filas: string[][] = [];
      while (i < lineas.length && lineas[i].startsWith("|")) {
        const c = lineas[i++].replace(/^\||\|\s*$/g, "").split("|").map((x) => x.trim());
        if (!c.every((x) => /^:?-+:?$/.test(x))) filas.push(c);
      }
      i--;
      // data-l: el título de cada columna, para mostrar la tabla como tarjetas en el celular.
      const cab = filas[0] ?? [];
      out.push(`<table class="t">${filas.map((f, k) => `<tr>${f.map((x, j) => (k ? `<td data-l="${esc(cab[j] ?? "")}">${inline(x)}</td>` : `<th>${inline(x)}</th>`)).join("")}</tr>`).join("")}</table>`);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s/.test(l)) {
      const ord = /^\s*\d+\./.test(l);
      const items: string[] = [];
      while (i < lineas.length && /^\s*([-*]|\d+\.)\s/.test(lineas[i])) {
        const t = lineas[i++].replace(/^\s*([-*]|\d+\.)\s+/, "");
        items.push(t.startsWith("[ ] ") ? `☐ ${inline(t.slice(4))}` : inline(t));
      }
      i--; out.push(`<${ord ? "ol" : "ul"}>${items.map((x) => `<li>${x}</li>`).join("")}</${ord ? "ol" : "ul"}>`); continue;
    }
    out.push(`<p>${inline(l)}</p>`);
  }
  return out.join("\n");
}
