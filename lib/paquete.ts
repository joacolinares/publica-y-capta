import JSZip from "jszip";
import type { Perfil } from "./perfil";
import { TEXTOS, reemplazar, reemplazarSinColonia, pendientes, revisar } from "./personalizar";
import { mdAHtml } from "./md";
import { adaptarConIA } from "./ia";
import { catalogo, prepararMarca, MEDIDAS, totalDisenos, type Pieza } from "./disenos";
import { imagen } from "./render";
import { bonos, bump, guionesExtra, upsell } from "./extras";
import { copiar, esc, pagina } from "./pagina";
import { appUrl } from "./sitio";

// Nombre de archivo ASCII de hasta 50 caracteres, cortado en una palabra completa.
const slug = (s: string) => {
  const t = s.replace(/ñ/g, "ni").replace(/Ñ/g, "Ni").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  return t.length <= 50 ? t : t.slice(0, 51).replace(/\s+\S*$/, "");
};
const dd = (n: number) => String(n).padStart(2, "0");
const app = appUrl();
// Cómo llegar a la pestaña de propiedades del panel (con el link, si hay APP_URL).
const panelPropiedades = `entra a tu panel${app ? ` (<a href="${esc(app)}/entrar">${esc(app.replace(/^https?:\/\//, ""))}</a>)` : ""} y abre la pestaña <b>Propiedades</b>: te arma el post y la historia con la foto de la casa, el precio y tus datos.`;
// Lo que queda entre [corchetes] se marca en amarillo: es lo que completa el asesor.
const marcar = (html: string) => html.replace(/\[([^\]<]{1,200})\]/g, "<mark>[$1]</mark>");

export type Opciones = { usarIA?: boolean; logo?: string; foto?: string; bump?: boolean; upsell?: boolean };

/** Corre `fn` sobre todos los elementos, `n` a la vez, y devuelve los resultados en el mismo orden. */
async function deANes<T, R>(items: T[], n: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let k = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (k < items.length) { const i = k++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

/** Qué diseño le toca a cada día, para el calendario y las publicaciones. */
type DisenoDia = { carrusel?: { carpeta: string; imagenes: number }; post?: string; historia?: string };

export async function armarPaquete(perfil: Perfil, op: Opciones = {}) {
  const m = await prepararMarca(perfil, op.logo, op.foto);
  const { e } = m;
  const firma = perfil.nombreComercial || perfil.nombre;
  const zip = new JSZip();

  // La IA (red) y los diseños (CPU) van al mismo tiempo: así el pack sale antes.
  const iaP = op.usarIA ? adaptarConIA(TEXTOS, perfil) : Promise.resolve(new Map<number, { post: string; whatsapp: string }>());

  // 1. Diseños: 40 piezas (los carruseles traen varias imágenes). Con foto van en JPG, solo texto en PNG.
  const piezas = catalogo((t) => reemplazar(t, perfil));
  // DISENOS_A_LA_VEZ (opcional, 2 por defecto): cuántos diseños se arman a la vez. 4 es más rápido pero usa cerca de 1 GB de RAM.
  const hechas = await deANes(piezas, Math.max(1, Math.floor(Number(process.env.DISENOS_A_LA_VEZ)) || 2), async (p: Pieza, i) => {
    const { el, conFoto } = await p.armar(m, i);
    const { width, height } = MEDIDAS[p.formato];
    const r = await imagen(el, width, height, conFoto);
    const ruta = `03 Disenos/${p.archivo}.${r.ext}`;
    zip.file(ruta, r.buf);
    return { p, ruta };
  });
  const disenoDe = new Map<number, DisenoDia>();
  for (const { p, ruta } of hechas) {
    if (!p.dia) continue;
    const d = disenoDe.get(p.dia) ?? {};
    const partes = p.archivo.split("/");
    if (p.formato === "story") d.historia = ruta;
    else if (partes.length > 1 && !p.archivo.startsWith("Historias/")) {
      d.carrusel = { carpeta: `03 Disenos/${partes[0]}`, imagenes: (d.carrusel?.imagenes ?? 0) + 1 };
    } else d.post = ruta;
    disenoDe.set(p.dia, d);
  }

  // 2. Textos: IA solo para los días no técnicos; después, los datos del formulario.
  const ia = await iaP;
  const dias = TEXTOS.map((d) => {
    const base = ia.get(d.dia) ?? { post: d.post, whatsapp: d.whatsapp };
    // En los días de propiedad, [colonia] es la de la casa: se deja para completar.
    const r = d.publico === "Propiedad" ? reemplazarSinColonia : reemplazar;
    const post = r(base.post, perfil);
    const whatsapp = r(base.whatsapp, perfil);
    const story = d.story ? r(d.story, perfil).replace(/^Story\s*(\(Diseño \d+\))?:\s*/i, "") : "";
    return { ...d, tema: r(d.tema, perfil), post, whatsapp, story, guion: r(d.guion, perfil), adaptado: ia.has(d.dia), faltan: pendientes(post + "\n" + whatsapp) };
  });
  const alertas = dias.flatMap((d) => revisar(d.post + d.whatsapp).map((r) => `Día ${d.dia}: ${r}`));
  type DiaPack = (typeof dias)[number];

  const esReel = (d: DiaPack) => Boolean(d.guion);
  /** Qué publica ese día, en pocas palabras (para el calendario). */
  const queUsa = (d: DiaPack) => {
    const x = disenoDe.get(d.dia);
    if (x?.carrusel) return `Carrusel de ${x.carrusel.imagenes} imágenes`;
    if (x?.post && x.historia) return "Diseño + historia";
    if (x?.post) return "Diseño listo";
    if (x?.historia) return "Historia lista";
    if (esReel(d)) return `${d.formato} (guion)`;
    if (d.publico === "Propiedad") return "Propiedad (en la app)";
    return "Tu foto + texto";
  };
  /** La indicación completa de qué diseño o guion usar (para las publicaciones). */
  const queUsaLargo = (d: DiaPack) => {
    const x = disenoDe.get(d.dia);
    const partes: string[] = [];
    if (x?.carrusel) partes.push(`<b>Carrusel:</b> carpeta ${esc(x.carrusel.carpeta.replace("03 Disenos/", "03 Disenos › "))}. Sube las ${x.carrusel.imagenes} imágenes en orden (01, 02, 03…) en una sola publicación.`);
    if (x?.post) partes.push(`<b>Diseño:</b> ${esc(x.post.replace("03 Disenos/", "03 Disenos › "))}`);
    if (x?.historia) partes.push(`<b>Historia:</b> ${esc(x.historia.replace("03 Disenos/", "03 Disenos › "))}. Pon el sticker de Instagram encima del recuadro punteado.`);
    if (!x && esReel(d)) partes.push(`<b>Reel:</b> el guion está en <a href="../04 Guiones de reels.html#dia-${d.dia}">04 Guiones de reels, Día ${d.dia}</a>.`);
    if (!x && !esReel(d) && d.publico === "Propiedad") partes.push(`<b>Propiedad:</b> ${panelPropiedades}`);
    if (!partes.length) partes.push("<b>Imagen:</b> usa una foto tuya, de tu zona o de una propiedad que tengas.");
    return partes.map((p) => `<p class="meta">${p}</p>`).join("");
  };
  const semanas = Array.from({ length: Math.ceil(dias.length / 7) }, (_, i) => dias.slice(i * 7, i * 7 + 7));
  const navSemanas = `<p class="meta">${semanas.map((s, i) => `<a href="#dia-${s[0].dia}">Semana ${i + 1}</a>`).join(" · ")}</p>`;

  // 3. Publicaciones: un archivo por día (fácil de copiar en el celular) + todas juntas con botón de copiar.
  for (const d of dias) {
    const extra = d.faltan.length ? `\n\n— Completa antes de publicar: ${d.faltan.join(", ")}` : "";
    zip.file(`02 Publicaciones/Dia ${dd(d.dia)} - ${slug(d.tema)}.txt`, `${d.post}\n\n— Estado de WhatsApp —\n${d.whatsapp}${d.story ? `\n\n— Historia —\n${d.story}` : ""}${extra}\n`);
  }
  const tarjetaDia = (d: DiaPack) => `<section class="tarjeta" id="dia-${d.dia}">
<div class="cap">Día ${d.dia} · ${esc(d.publico)} · ${esc(d.formato)}</div><h2>${marcar(esc(d.tema))}</h2>${queUsaLargo(d)}
<h4>Texto para Instagram y Facebook</h4>${copiar(`p${d.dia}`)}<div class="post" id="p${d.dia}">${marcar(esc(d.post))}</div>
${d.faltan.length ? `<p class="nota">Completa antes de publicar: ${marcar(esc(d.faltan.join(", ")))}</p>` : ""}
<h4>Estado de WhatsApp</h4>${copiar(`w${d.dia}`)}<div class="wa" id="w${d.dia}">${marcar(esc(d.whatsapp))}</div>
${d.story ? `<h4>Historia</h4><div class="wa">${marcar(esc(d.story))}</div>` : ""}${d.nota ? `<p class="nota">${esc(d.nota)}</p>` : ""}</section>`;
  zip.file("02 Publicaciones/Todas las publicaciones.html", pagina("Tus 90 publicaciones",
    `<div class="cap">02 · Publicaciones</div><h1>Tus <em>90</em> publicaciones</h1><p class="intro">Busca el día que toca, toca <b>Copiar texto</b> y pégalo en Instagram, Facebook o tu estado de WhatsApp. Lo marcado en amarillo es lo que cambias por tu dato.</p>${navSemanas}`
    + dias.map(tarjetaDia).join("\n"), e, firma, "../"));

  // 4. Calendario
  const fila = (c: string[]) => c.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
  const csv = [fila(["Día", "Público", "Tema", "Formato", "Qué publicas", "¿Publicado?"]), ...dias.map((d) => fila([String(d.dia), d.publico, d.tema, d.formato, queUsa(d), ""]))].join("\r\n");
  zip.file("01 Calendario 90 dias.csv", "﻿" + csv);
  zip.file("01 Calendario 90 dias.html", pagina("Tu calendario de 90 días",
    `<div class="cap">01 · Calendario</div><h1>Tu calendario de <em>90 días</em></h1><p class="intro">Empieza el Día 1 el día que quieras. Si un día no puedes, sigue con el siguiente: no hace falta ponerse al corriente.</p>`
    + semanas.map((s, i) => `<h3 id="dia-${s[0].dia}">Semana ${i + 1}</h3><table><tr><th>Día</th><th>Tema</th><th>Qué publicas</th></tr>${s.map((d) => `<tr><td>${d.dia}</td><td><a href="02 Publicaciones/Todas las publicaciones.html#dia-${d.dia}">${esc(d.tema)}</a><br><span class="meta">${esc(d.publico)}</span></td><td><span class="chip">${esc(queUsa(d))}</span></td></tr>`).join("")}</table>`).join(""), e, firma));

  // 5. Guiones: los 20 del calendario + 10 extra, cada uno con su texto para publicar.
  const conGuion = dias.filter(esReel);
  const extras = guionesExtra(perfil);
  const consejos = [
    "Graba en vertical, con el celular a la altura de los ojos y la luz de una ventana de frente.",
    "Elige uno de los 3 ganchos de cada guion: los primeros 3 segundos deciden si la gente se queda.",
    "Graba cada toma 2 o 3 segundos más larga de lo que dice la tabla y recorta al editar. Cambiar de toma cada 2 a 4 segundos ayuda a que lo vean completo.",
    "Pon subtítulos automáticos en Instagram o CapCut: mucha gente ve los reels sin sonido.",
    "Para la música, elige una canción de la biblioteca de Instagram; si tu cuenta es de empresa, usa las que te aparecen disponibles.",
    "Usa la portada que trae cada guion: así tu perfil se ve ordenado.",
    "Pide permiso a quien salga en el video y no muestres direcciones, placas ni datos de nadie.",
  ];
  const tarjetaGuion = (d: DiaPack) => `<section class="tarjeta" id="dia-${d.dia}">
<div class="cap">Día ${d.dia} · ${esc(d.publico)} · Reel ${esc(d.guionTipo || d.formato.replace(/^Reel /, ""))}</div><h2>${esc(d.tema)}</h2>
${marcar(mdAHtml(d.guion))}
<h4>Texto para publicar con el reel</h4>${copiar(`g${d.dia}`)}<div class="post" id="g${d.dia}">${marcar(esc(d.post))}</div></section>`;
  const tarjetaExtra = (x: (typeof extras)[number]) => `<section class="tarjeta" id="extra-${x.n}">
<div class="cap">Extra ${x.n} · ${esc(x.duracion)}</div><h2>${esc(x.titulo)}</h2>
${x.html}
${x.texto ? `<h4>Texto para publicar con el reel</h4>${copiar(`x${x.n}`)}<div class="post" id="x${x.n}">${marcar(esc(x.texto))}</div>` : ""}</section>`;
  zip.file("04 Guiones de reels.html", pagina("Guiones de reels",
    `<div class="cap">04 · Guiones</div><h1>Guiones para tus <em>reels</em></h1>
<p class="intro">${conGuion.length + extras.length} guiones listos para grabar con tu celular, sin equipo: ${conGuion.length} del calendario y ${extras.length} extra para cuando quieras grabar en vez de publicar un post. Cada uno trae 3 ganchos para elegir, la tabla toma por toma, la portada, tips para grabarlo y el texto para publicar.</p>
<div class="tarjeta"><div class="cap">Antes de grabar cualquiera</div><ol>${consejos.map((c) => `<li>${c}</li>`).join("")}</ol></div>
<h3>Del calendario</h3><ul class="indice">${conGuion.map((d) => `<li><a href="#dia-${d.dia}">Día ${d.dia} · ${esc(d.tema)}</a></li>`).join("")}</ul>
${extras.length ? `<h3>Extra</h3><ul class="indice">${extras.map((x) => `<li><a href="#extra-${x.n}">Extra ${x.n} · ${esc(x.titulo)}</a></li>`).join("")}</ul>` : ""}`
    + conGuion.map(tarjetaGuion).join("\n")
    + (extras.length ? `<hr><div class="cap">Guiones extra</div><h2>${extras.length} reels <em>extra</em></h2><p>Para cualquier día en que quieras grabar en vez de publicar un post.</p>` + extras.map(tarjetaExtra).join("\n") : ""), e, firma));

  // 6. Bonos, bump y upsell
  const bs = bonos(perfil);
  bs.forEach((b, i) => zip.file(`05 Bonos/${i + 1} ${slug(b.titulo)}.html`, pagina(b.titulo, `<div class="cap">Bono ${i + 1}</div><h1>${esc(b.titulo)}</h1>${b.html}`, e, firma, "../")));
  if (op.bump) zip.file("06 Del mensaje a la visita.html", pagina("Del mensaje a la visita", `<div class="cap">06 · Respuestas de WhatsApp</div><h1>Del mensaje a la <em>visita</em></h1><p class="intro">50 respuestas de WhatsApp para cada momento de la plática.</p>${bump(perfil)}`, e, firma));
  const kit = op.upsell ? upsell(perfil, e) : null;
  if (kit) {
    zip.file("07 Kit Captacion Exclusiva/1 Presentacion de captacion.html", kit.presentacion);
    kit.resto.forEach((s, i) => zip.file(`07 Kit Captacion Exclusiva/${i + 2} ${slug(s.titulo)}.html`, pagina(s.titulo, `<div class="cap">Kit Captación Exclusiva · ${i + 2}</div><h1>${esc(s.titulo)}</h1>${s.html}`, e, firma, "../")));
  }

  // 7. Empieza aquí
  const nombre = esc(perfil.nombre.split(" ")[0]);
  const imagenes = hechas.length;
  const guiones = conGuion.length + extras.length;
  // Las historias sin día salen como "Historia N": se dice cuándo usarlas.
  const libres = hechas.map(({ p }) => /^Historias\/Historia (\d+)/.exec(p.archivo)?.[1]).filter((n): n is string => Boolean(n));
  const seguidas = Number(libres.at(-1)) - Number(libres[0]) === libres.length - 1;
  const historiasLibres = !libres.length ? ""
    : libres.length === 1 ? ` La historia ${libres[0]} no tiene día fijo: úsala`
    : ` Las historias ${seguidas ? `${libres[0]} a ${libres.at(-1)}` : `${libres.slice(0, -1).join(", ")} y ${libres.at(-1)}`} no tienen día fijo: úsalas`;
  const perfilBono = bs[0] ? `05 Bonos › 1 ${esc(slug(bs[0].titulo))}` : "";
  zip.file("00 EMPIEZA AQUI.html", pagina("Empieza aquí", `<div class="cap">Tu contenido de 90 días</div>
<h1>Hola, <em>${nombre}</em>.<br>Tu contenido ya está listo.</h1>
<p class="intro">Todo viene con tu nombre, tus colores y tus datos: ${dias.length} publicaciones, ${totalDisenos()} diseños (${imagenes} imágenes) y ${guiones} guiones de reels.</p>
${perfilBono ? `<div class="tarjeta"><div class="cap">Antes del Día 1</div><h2>Deja tu perfil <em>listo</em></h2><p>Abre <b>${perfilBono}</b> y sigue la guía. En una hora tu perfil queda listo para recibir mensajes.</p></div>` : ""}
<h2>Así lo usas en <em>10 minutos</em> al día</h2>
<div class="paso"><div class="n">1</div><div>Abre <b>01 Calendario 90 dias</b> y busca el día que toca.</div></div>
<div class="paso"><div class="n">2</div><div>En <b>02 Publicaciones › Todas las publicaciones</b>, toca <b>Copiar texto</b> en ese día. Si ves algo en amarillo entre [corchetes], cámbialo por tu dato.</div></div>
<div class="paso"><div class="n">3</div><div>Sube el diseño de <b>03 Disenos</b> (o tu foto, o tu reel) y pega el texto. Listo.</div></div>
<h2>Qué hay en cada <em>carpeta</em></h2>
<ul>
<li><b>03 Disenos</b>: cada carrusel viene en su carpeta. Sube las imágenes en orden (01, 02, 03…) en una sola publicación. En las historias, pon el sticker de encuesta o la caja de preguntas de Instagram encima del recuadro punteado.${historiasLibres ? `${historiasLibres} cuando quieras subir una encuesta o una caja de preguntas, por ejemplo en los días que no traen historia.` : ""}</li>
<li><b>04 Guiones de reels</b>: ${guiones} guiones toma por toma, con 3 ganchos para elegir, la portada, tips para grabar y el texto para publicar.</li>
<li><b>05 Bonos</b>: ${bs.map((b) => esc(b.titulo)).join(" y ")}.</li>
${op.bump ? "<li><b>06 Del mensaje a la visita</b>: tus 50 respuestas de WhatsApp.</li>" : ""}
${kit ? "<li><b>07 Kit Captacion Exclusiva</b>: tu presentación para dueños (se edita en el navegador y se guarda en PDF), la opinión de valor, el guion para pedir la exclusiva, el checklist de documentos y 10 publicaciones de resultados.</li>" : ""}
</ul>
<h2>Para tus <em>propiedades</em></h2>
<p>${panelPropiedades.replace(/^e/, "E")}</p>
<p class="meta">Los textos sobre créditos, escrituras e impuestos son información general. Cada caso puede cambiar según el estado y la institución.</p>`, e, firma));

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return { zip: buf, resumen: { publicaciones: dias.length, adaptadasConIA: ia.size, disenos: totalDisenos(), imagenes, guiones, bonos: bs.length, bump: Boolean(op.bump), upsell: Boolean(kit), alertas } };
}
