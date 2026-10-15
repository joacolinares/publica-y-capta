/* eslint-disable @next/next/no-img-element */
// Las 40 piezas del pack: portadas, láminas de carrusel e historias. Sin IA: toman los textos de content/disenos.json
// y los datos, colores, logo y foto del asesor.
import React from "react";
import type { ReactNode } from "react";
import { NUM, SANS, SERIF, type Estilo } from "./estilo";
import { repartir, type Etiqueta, type Pedida } from "./fotos";
import {
  ALTO_BOTON, Abs, Boton, Cap, Firma, Icono, Img, Lienzo, Monograma, Pie, PieColumna, Texto, TituloLamina, TituloPortada, altoTexto, contexto, usuario,
  type Contenido, type Ctx, type DiaDiseno, type Formato, type Historia, type Lamina, type Marca, type Titulo, type Tono,
} from "./piezas";
import disenosBase from "@/content/disenos.json";

export { MEDIDAS, marca, prepararMarca, type Formato, type Marca } from "./piezas";

// ---------- Portadas y posts (1080x1350) ----------

type Portada = { etiqueta: string; titulo: Titulo; bajada?: string; boton?: string; foto: Etiqueta; flecha?: boolean };

/** Lo que ocupan la bajada y el botón debajo del título: el título se achica para que todo entre sin encimarse. */
const resto = (d: Portada, anchoBajada: number, size: number, mBajada: number, mBoton: number) =>
  (d.bajada ? mBajada + altoTexto(d.bajada, size, anchoBajada) : 0) + (d.boton ? mBoton + ALTO_BOTON : 0);
const ALTO_CAP = 30;

/** Foto en arco a la derecha, título a la izquierda. */
async function PortadaArco(c: Ctx, d: Portada) {
  const { e } = c.m;
  const foto = await c.foto(d.foto, 470, 780);
  return (
    <Lienzo fondo={e.crema} color={e.carbon}>
      <Abs style={{ right: 80, top: 150, width: 470, height: 780, borderRadius: "235px 235px 0 0", overflow: "hidden" }}>
        <img src={foto} width={470} height={780} />
      </Abs>
      <Abs style={{ right: 60, top: 130, width: 510, height: 820, borderRadius: "255px 255px 0 0", border: `2px solid ${e.linea}` }} />
      <Abs style={{ left: 80, top: 96 }}><Cap color={e.carbon} max={420}>{d.etiqueta}</Cap></Abs>
      <Abs style={{ left: 80, top: 230, width: 400, height: 760, flexDirection: "column", justifyContent: "center" }}>
        <TituloPortada t={d.titulo} ancho={400} color={e.carbon} colorScript={e.acento} serifMax={92} serifLineas={4} alto={760 - resto(d, 390, 30, 34, 44)} />
        {d.bajada ? <Texto color={e.topoTexto} size={30} ancho={390} style={{ marginTop: 34 }}>{d.bajada}</Texto> : null}
        {d.boton ? <div style={{ display: "flex", marginTop: 44 }}><Boton texto={d.boton} color={e.carbon} flecha={d.flecha} max={400} /></div> : null}
      </Abs>
      <Pie m={c.m} tono="claro" />
    </Lienzo>
  );
}

/** Foto arriba de lado a lado y un panel crema encimado con el título. */
async function PortadaPanel(c: Ctx, d: Portada) {
  const { e } = c.m;
  const foto = await c.foto(d.foto, 1080, 560);
  return (
    <Lienzo fondo={e.crema} color={e.carbon}>
      <Img src={foto} w={1080} h={560} style={{ left: 0, top: 0 }} />
      <Abs style={{ left: 80, right: 80, top: 440, bottom: 170, background: e.crema, padding: "56px 64px 40px", flexDirection: "column", justifyContent: "center" }}>
        <Cap color={e.topoTexto} size={22}>{d.etiqueta}</Cap>
        <div style={{ display: "flex", marginTop: 26 }}>
          <TituloPortada t={d.titulo} ancho={790} color={e.carbon} colorScript={e.acento} serifMax={90} serifLineas={2} sangria={60} alto={644 - ALTO_CAP - 26 - 20 - resto(d, 760, 30, 26, 34)} />
        </div>
        {d.bajada ? <Texto color={e.topoTexto} size={30} ancho={760} style={{ marginTop: 26 }}>{d.bajada}</Texto> : null}
        {d.boton ? <div style={{ display: "flex", marginTop: 34 }}><Boton texto={d.boton} color={e.carbon} flecha={d.flecha} /></div> : null}
      </Abs>
      <Pie m={c.m} tono="claro" />
    </Lienzo>
  );
}

/** Foto tipo polaroid girada arriba a la derecha, título grande abajo. */
async function PortadaPolaroid(c: Ctx, d: Portada) {
  const { e } = c.m;
  const foto = await c.foto(d.foto, 400, 470);
  return (
    <Lienzo fondo={e.crema} color={e.carbon}>
      <Abs style={{ right: 92, top: 112, width: 444, height: 584, background: e.blanco, padding: "22px 22px 92px", transform: "rotate(4deg)", boxShadow: "0 14px 22px rgba(43,42,40,.16)" }}>
        <img src={foto} width={400} height={470} />
      </Abs>
      <Abs style={{ left: 80, top: 96 }}><Cap color={e.carbon} max={430}>{d.etiqueta}</Cap></Abs>
      <Abs style={{ left: 80, top: 690, width: 920, height: 520, flexDirection: "column", justifyContent: "center" }}>
        <TituloPortada t={d.titulo} ancho={900} color={e.carbon} colorScript={e.acento} serifMax={110} serifLineas={2} sangria={140} alto={520 - resto(d, 800, 30, 24, 34)} />
        {d.bajada ? <Texto color={e.topoTexto} size={30} ancho={800} style={{ marginTop: 24 }}>{d.bajada}</Texto> : null}
        {d.boton ? <div style={{ display: "flex", marginTop: 34 }}><Boton texto={d.boton} color={e.carbon} flecha={d.flecha} /></div> : null}
      </Abs>
      <Pie m={c.m} tono="claro" />
    </Lienzo>
  );
}

/** Fondo carbón a la izquierda y foto a la derecha. */
async function PortadaOscura(c: Ctx, d: Portada) {
  const { e } = c.m;
  const foto = await c.foto(d.foto, 500, 1350);
  return (
    <Lienzo fondo={e.carbon} color={e.blanco}>
      <Img src={foto} w={500} h={1350} style={{ right: 0, top: 0 }} />
      <Abs style={{ left: 80, top: 96, width: 440 }}><Cap color={e.arena} max={440}>{d.etiqueta}</Cap></Abs>
      <Abs style={{ left: 80, top: 190, width: 440, height: 880, flexDirection: "column", justifyContent: "center" }}>
        <TituloPortada t={d.titulo} ancho={440} color={e.blanco} colorScript={e.acentoOscuro} serifMax={92} serifLineas={5} alto={880 - 42 - resto(d, 430, 28, 34, 40)} />
        <div style={{ display: "flex", width: 120, height: 2, background: e.arena, marginTop: 40, opacity: 0.6 }} />
        {d.bajada ? <Texto color={e.arena} size={28} ancho={430} style={{ marginTop: 34 }}>{d.bajada}</Texto> : null}
        {d.boton ? <div style={{ display: "flex", marginTop: 40 }}><Boton texto={d.boton} color={e.arena} flecha={d.flecha} max={440} /></div> : null}
      </Abs>
      <PieColumna m={c.m} tono="oscuro" />
    </Lienzo>
  );
}

/** Fondo arena, sin foto: título y una tarjeta crema con la bajada. Para temas de papeles y créditos. */
async function PortadaArena(c: Ctx, d: Portada) {
  const { e } = c.m;
  return (
    <Lienzo fondo={e.arena} color={e.carbon}>
      <Abs style={{ left: 80, top: 96 }}><Cap color={e.carbon}>{d.etiqueta}</Cap></Abs>
      <Abs style={{ left: 80, right: 80, top: 230, flexDirection: "column" }}>
        <TituloPortada t={d.titulo} ancho={920} color={e.carbon} colorScript={e.acento} serifMax={112} serifLineas={3} sangria={80}
          alto={950 - (d.bajada || d.boton ? 56 + 92 + (d.bajada ? altoTexto(d.bajada, 32, 820) : 0) + (d.bajada && d.boton ? 62 : 0) + (d.boton ? ALTO_BOTON : 0) : 0)} />
        {d.bajada || d.boton ? (
          <div style={{ display: "flex", flexDirection: "column", background: e.crema, marginTop: 56, padding: "46px 50px" }}>
            {d.bajada ? <Texto color={e.carbon} size={32} ancho={820}>{d.bajada}</Texto> : null}
            {d.bajada && d.boton ? <div style={{ display: "flex", height: 2, background: e.linea, margin: "30px 0" }} /> : null}
            {d.boton ? <Boton texto={d.boton} color={e.carbon} flecha={d.flecha} /> : null}
          </div>
        ) : null}
      </Abs>
      <Pie m={c.m} tono="claro" />
    </Lienzo>
  );
}

/** Foto de fondo completa con degradado oscuro abajo. */
async function PortadaFoto(c: Ctx, d: Portada) {
  const { e } = c.m;
  const foto = await c.foto(d.foto, 1080, 1350, { oscurecer: 0.12 });
  return (
    <Lienzo fondo={e.carbon} color={e.blanco}>
      <Img src={foto} w={1080} h={1350} style={{ left: 0, top: 0 }} />
      <Abs style={{ left: 0, top: 0, width: 1080, height: 1350, backgroundImage: "linear-gradient(180deg, rgba(43,42,40,0.15) 0%, rgba(43,42,40,0) 22%, rgba(43,42,40,0.62) 42%, rgba(43,42,40,0.92) 68%)" }} />
      <Abs style={{ left: 80, right: 80, bottom: 170, flexDirection: "column" }}>
        <Cap color={e.arena}>{d.etiqueta}</Cap>
        <div style={{ display: "flex", marginTop: 26 }}>
          <TituloPortada t={d.titulo} ancho={900} color={e.blanco} colorScript={e.acentoOscuro} serifMax={112} serifLineas={2} sangria={110} alto={880 - ALTO_CAP - 26 - resto(d, 800, 30, 22, 34)} />
        </div>
        {d.bajada ? <Texto color={e.blanco} size={30} ancho={800} style={{ marginTop: 22, opacity: 0.92 }}>{d.bajada}</Texto> : null}
        {d.boton ? <div style={{ display: "flex", marginTop: 34 }}><Boton texto={d.boton} color={e.blanco} flecha={d.flecha} /></div> : null}
      </Abs>
      <Pie m={c.m} tono="oscuro" />
    </Lienzo>
  );
}

/** Foto de fondo con un velo crema a la izquierda: para frases. */
async function PortadaVelo(c: Ctx, d: Portada) {
  const { e } = c.m;
  const foto = await c.foto(d.foto, 1080, 1350);
  return (
    <Lienzo fondo={e.crema} color={e.carbon}>
      <Img src={foto} w={1080} h={1350} style={{ left: 0, top: 0 }} />
      <Abs style={{ left: 0, top: 0, width: 1080, height: 1350, backgroundImage: "linear-gradient(90deg, rgba(244,239,232,0.98) 0%, rgba(244,239,232,0.96) 46%, rgba(244,239,232,0.55) 66%, rgba(244,239,232,0) 92%)" }} />
      <Abs style={{ left: 80, top: 96 }}><Cap color={e.topoTexto}>{d.etiqueta}</Cap></Abs>
      <Abs style={{ left: 80, top: 190, width: 540, height: 880, flexDirection: "column", justifyContent: "center" }}>
        <TituloPortada t={d.titulo} ancho={540} color={e.carbon} colorScript={e.acento} serifMax={100} serifLineas={5} alto={880 - resto(d, 500, 30, 32, 40)} />
        {d.bajada ? <Texto color={e.topoTexto} size={30} ancho={500} style={{ marginTop: 32 }}>{d.bajada}</Texto> : null}
        {d.boton ? <div style={{ display: "flex", marginTop: 40 }}><Boton texto={d.boton} color={e.carbon} flecha={d.flecha} /></div> : null}
      </Abs>
      <PieColumna m={c.m} tono="claro" ancho={520} />
    </Lienzo>
  );
}

const PORTADAS = { arco: PortadaArco, panel: PortadaPanel, polaroid: PortadaPolaroid, oscura: PortadaOscura, arena: PortadaArena, foto: PortadaFoto, velo: PortadaVelo };
type EstiloPortada = keyof typeof PORTADAS;

/** Día 1: "Hola, soy …" con la foto del asesor. Sin foto, el monograma en un arco. */
async function Presentacion(c: Ctx, d: Portada) {
  const { e, perfil } = c.m;
  const propia = await c.propia(1080, 1350);
  const nombre = perfil.nombre.split(/\s+/)[0];
  // El día 1 dice "Hola, soy [Tu nombre]": en manuscrita va solo el nombre de pila.
  const script = (d.titulo.script ?? "").replace(/\[Tu nombre\]/gi, nombre);
  const t = { ...d.titulo, script: !script || script === perfil.nombre ? nombre : script };
  if (propia) {
    return (
      <Lienzo fondo={e.carbon} color={e.blanco}>
        <Img src={propia} w={1080} h={1350} style={{ left: 0, top: 0 }} />
        <Abs style={{ left: 0, top: 0, width: 1080, height: 1350, backgroundImage: "linear-gradient(180deg, rgba(43,42,40,0) 38%, rgba(43,42,40,0.6) 62%, rgba(43,42,40,0.9) 84%)" }} />
        <Abs style={{ left: 80, right: 80, bottom: d.boton ? 196 : 160, flexDirection: "column" }}>
          <Cap color={e.arena}>{d.etiqueta}</Cap>
          <div style={{ display: "flex", marginTop: 24 }}><TituloPortada t={t} ancho={900} color={e.blanco} colorScript={e.acentoOscuro} serifMax={140} serifLineas={1} sangria={120} scriptMax={190} /></div>
          {d.bajada ? <Texto color={e.blanco} size={31} ancho={800} style={{ marginTop: 14, opacity: 0.92 }}>{d.bajada}</Texto> : null}
          {d.boton ? <div style={{ display: "flex", marginTop: 36 }}><Boton texto={d.boton} color={e.blanco} /></div> : null}
        </Abs>
        <Pie m={c.m} tono="oscuro" />
      </Lienzo>
    );
  }
  const foto = await c.foto("sala", 470, 700);
  return (
    <Lienzo fondo={e.crema} color={e.carbon}>
      <Abs style={{ right: 80, top: 150, width: 470, height: 700, borderRadius: "235px 235px 0 0", overflow: "hidden" }}><img src={foto} width={470} height={700} /></Abs>
      <Abs style={{ right: 240, top: 760, width: 150, height: 150, borderRadius: 75, background: e.crema, alignItems: "center", justifyContent: "center" }}><Monograma m={c.m} size={130} color={e.acento} /></Abs>
      <Abs style={{ left: 80, top: 96 }}><Cap color={e.carbon}>{d.etiqueta}</Cap></Abs>
      <Abs style={{ left: 80, top: 330, width: 400, flexDirection: "column" }}>
        <TituloPortada t={t} ancho={400} color={e.carbon} colorScript={e.acento} serifMax={108} serifLineas={1} scriptMax={170} />
        {d.bajada ? <Texto color={e.topoTexto} size={30} ancho={390} style={{ marginTop: 30 }}>{d.bajada}</Texto> : null}
        {d.boton ? <div style={{ display: "flex", marginTop: 40 }}><Boton texto={d.boton} color={e.carbon} max={400} /></div> : null}
      </Abs>
      <Pie m={c.m} tono="claro" />
    </Lienzo>
  );
}

// ---------- Láminas de carrusel (1080x1350, sin foto) ----------

type Tema = "claro" | "arena" | "oscuro";
const fondoTema = (e: Estilo, t: Tema) => (t === "claro" ? e.crema : t === "arena" ? e.arena : e.carbon);

// Etiquetas sobre el título y sobre el texto, según el tipo de lámina (los títulos de estas láminas van entre comillas).
const ETIQUETAS_TIPO: Record<NonNullable<Lamina["tipo"]>, [string, string]> = {
  mito: ["Mito", "Realidad"],
  pregunta: ["Pregunta", "Respuesta"],
  anuncio: ["Dice el anuncio", "Qué hacer"],
};

/** `i` y `total` cuentan solo las láminas numeradas; una lámina `extra` no lleva número. */
async function LaminaInterior(c: Ctx, l: Lamina, i: number, total: number, tema: Tema, etiqueta: string) {
  const { e } = c.m;
  const oscuro = tema === "oscuro";
  const tx = oscuro ? e.blanco : e.carbon;
  const sub = oscuro ? e.arena : e.topoTexto;
  const ac = oscuro ? e.acentoOscuro : e.acento;
  const numero = String(i).padStart(2, "0");
  const tipo = l.tipo ? ETIQUETAS_TIPO[l.tipo] : null;
  const largo = (l.texto?.length ?? 0) + (l.lista ?? []).join(" ").length;
  const conLista = Boolean(l.lista?.length);
  return (
    <Lienzo fondo={fondoTema(e, tema)} color={tx}>
      <Abs style={{ left: 80, top: 96 }}><Cap color={sub} size={22}>{l.extra ? `${etiqueta} · Extra` : `${etiqueta} · ${numero} de ${String(total).padStart(2, "0")}`}</Cap></Abs>
      {l.extra ? null : <Abs style={{ right: 66, top: 60, fontFamily: NUM, fontWeight: 700, fontSize: 330, lineHeight: 1, color: oscuro ? "rgba(228,218,204,0.14)" : tema === "arena" ? "rgba(244,239,232,0.85)" : e.arena }}>{numero}</Abs>}
      <Abs style={{ left: 80, right: 80, top: 250, bottom: 190, flexDirection: "column", justifyContent: "center" }}>
        {tipo ? <Cap color={ac} size={22} style={{ marginBottom: 22 }}>{tipo[0]}</Cap> : null}
        <TituloLamina t={l.titulo} ancho={900} color={tx} colorAcento={ac} max={conLista ? 90 : 112} lineasMax={3} italica={Boolean(tipo)} />
        <div style={{ display: "flex", width: 140, height: 2, background: ac, margin: conLista ? "36px 0 18px" : "46px 0 40px", opacity: 0.8 }} />
        {tipo && l.texto ? <Cap color={ac} size={22} style={{ marginBottom: 16 }}>{tipo[1]}</Cap> : null}
        {conLista ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {l.lista!.map((x, k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 28, padding: "22px 0", borderBottom: `2px solid ${oscuro ? "rgba(228,218,204,0.25)" : e.linea}` }}>
                <Icono tipo={l.marca ?? "punto"} color={l.marca === "no" ? sub : ac} />
                <Texto color={tx} size={33} ancho={820}>{x}</Texto>
              </div>
            ))}
          </div>
        ) : null}
        {/* Con lista, el texto es una aclaración o la contra: va después de los puntos. */}
        {l.texto ? <Texto color={oscuro ? e.arena : e.carbon} size={conLista ? 31 : largo > 140 ? 36 : 40} ancho={900} style={conLista ? { marginTop: 24 } : {}}>{l.texto}</Texto> : null}
      </Abs>
      <Pie m={c.m} tono={oscuro ? "oscuro" : "claro"} />
    </Lienzo>
  );
}

async function LaminaCierre(c: Ctx, cierre: NonNullable<DiaDiseno["cierre"]>, tema: Tema) {
  const { e, perfil } = c.m;
  const oscuro = tema !== "claro";
  const fondo = oscuro ? e.carbon : e.crema;
  const tx = oscuro ? e.blanco : e.carbon;
  const sub = oscuro ? e.arena : e.topoTexto;
  return (
    <Lienzo fondo={fondo} color={tx}>
      <Abs style={{ left: 70, top: 70, right: 70, bottom: 70, border: `2px solid ${oscuro ? "rgba(228,218,204,0.35)" : e.linea}` }} />
      <Abs style={{ left: 120, right: 120, top: 150, bottom: 150, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Firma m={c.m} tono={oscuro ? "oscuro" : "claro"} alto={96} />
        <div style={{ display: "flex", marginTop: 56 }}>
          <TituloPortada t={cierre.titulo} ancho={840} color={tx} colorScript={oscuro ? e.acentoOscuro : e.acento} serifMax={118} serifLineas={2} centrado
            alto={1050 - 96 - 56 - 34 - altoTexto(cierre.texto, 36, 800) - 50 - ALTO_BOTON - 56 - ALTO_CAP - (perfil.usuarioRedes ? 14 + ALTO_CAP : 0) - 20} />
        </div>
        <Texto color={sub} size={36} ancho={800} style={{ marginTop: 34, textAlign: "center", justifyContent: "center" }}>{cierre.texto}</Texto>
        <div style={{ display: "flex", marginTop: 50 }}><Boton texto={`Escríbeme "${cierre.palabra}"`} color={tx} /></div>
        <div style={{ display: "flex", marginTop: 56, fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 4.4, textTransform: "uppercase", color: sub }}>{`${perfil.nombre} · WhatsApp ${perfil.whatsapp}`}</div>
        {perfil.usuarioRedes ? <div style={{ display: "flex", marginTop: 14, fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 4.4, textTransform: "uppercase", color: sub }}>{usuario(perfil)}</div> : null}
      </Abs>
    </Lienzo>
  );
}

// ---------- Historias (1080x1920) ----------
// En historias, Instagram tapa arriba y abajo: lo importante va entre 250 y 1650 px.

function Sticker({ m, texto, opciones, oscuro }: { m: Marca; texto: string; opciones?: string[]; oscuro?: boolean }) {
  const { e } = m;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 760, height: 250, border: `3px dashed ${oscuro ? e.arena : e.topo}`, borderRadius: 32, background: oscuro ? "rgba(43,42,40,0.35)" : "rgba(255,253,249,0.6)", gap: 14 }}>
      <Cap color={oscuro ? e.arena : e.topoTexto} size={20}>{texto}</Cap>
      {opciones?.length ? <div style={{ display: "flex", fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 44, color: oscuro ? e.blanco : e.carbon }}>{opciones.join("  ·  ")}</div> : null}
    </div>
  );
}

function PieHistoria({ m, tono }: { m: Marca; tono: Tono }) {
  return <Pie m={m} tono={tono} abajo={300} />;
}

async function HistoriaEncuesta(c: Ctx, h: Historia) {
  const { e } = c.m;
  const foto = await c.foto(h.foto, 764, 600);
  return (
    <Lienzo fondo={e.arena} color={e.carbon}>
      <Abs style={{ left: 134, top: 230, width: 812, height: 648, background: e.blanco, padding: 24, transform: "rotate(-2deg)" }}><img src={foto} width={764} height={600} /></Abs>
      <Abs style={{ left: 80, right: 80, top: 910, height: 600, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Cap color={e.topoTexto} size={22}>{h.etiqueta}</Cap>
        <div style={{ display: "flex", marginTop: 22 }}><TituloPortada t={h.titulo} ancho={900} color={e.carbon} colorScript={e.acento} serifMax={92} serifLineas={2} centrado alto={600 - ALTO_CAP - 22 - 34 - 250 - (h.bajada ? 26 + altoTexto(h.bajada, 28, 860) : 0)} /></div>
        <div style={{ display: "flex", marginTop: 34 }}><Sticker m={c.m} texto={h.tipo === "encuesta" ? "Pon aquí el sticker de encuesta" : "Pon aquí la caja de preguntas"} opciones={h.opciones} /></div>
        {h.bajada ? <Texto color={e.topoTexto} size={28} ancho={860} style={{ marginTop: 26, textAlign: "center", justifyContent: "center" }}>{h.bajada}</Texto> : null}
      </Abs>
      <PieHistoria m={c.m} tono="claro" />
    </Lienzo>
  );
}

async function HistoriaPreguntas(c: Ctx, h: Historia) {
  const { e } = c.m;
  const foto = (await c.propia(1080, 1000)) ?? (await c.foto(h.foto, 1080, 1000));
  return (
    <Lienzo fondo={e.crema} color={e.carbon}>
      <Img src={foto} w={1080} h={1000} style={{ left: 0, top: 0 }} />
      <Abs style={{ left: 80, right: 80, top: 800, flexDirection: "column", alignItems: "center", background: e.crema, padding: "60px 60px 50px" }}>
        <Cap color={e.topoTexto} size={22}>{h.etiqueta}</Cap>
        <div style={{ display: "flex", marginTop: 22 }}><TituloPortada t={h.titulo} ancho={800} color={e.carbon} colorScript={e.acento} serifMax={92} serifLineas={2} centrado alto={680 - ALTO_CAP - 22 - 36 - 250 - (h.bajada ? 24 + altoTexto(h.bajada, 27, 780) : 0)} /></div>
        <div style={{ display: "flex", marginTop: 36 }}><Sticker m={c.m} texto={h.tipo === "encuesta" ? "Pon aquí el sticker de encuesta" : "Pon aquí la caja de preguntas"} opciones={h.opciones} /></div>
        {h.bajada ? <Texto color={e.topoTexto} size={27} ancho={780} style={{ marginTop: 24, textAlign: "center", justifyContent: "center" }}>{h.bajada}</Texto> : null}
      </Abs>
      <PieHistoria m={c.m} tono="claro" />
    </Lienzo>
  );
}

async function HistoriaFoto(c: Ctx, h: Historia) {
  const { e } = c.m;
  const foto = await c.foto(h.foto, 1080, 1920);
  return (
    <Lienzo fondo={e.carbon} color={e.blanco}>
      <Img src={foto} w={1080} h={1920} style={{ left: 0, top: 0 }} />
      <Abs style={{ left: 0, top: 0, width: 1080, height: 1920, backgroundImage: "linear-gradient(180deg, rgba(43,42,40,0.5) 0%, rgba(43,42,40,0.15) 25%, rgba(43,42,40,0.6) 40%, rgba(43,42,40,0.9) 70%)" }} />
      <Abs style={{ left: 80, right: 80, top: 760, height: 780, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Cap color={e.arena} size={22}>{h.etiqueta}</Cap>
        <div style={{ display: "flex", marginTop: 22 }}><TituloPortada t={h.titulo} ancho={900} color={e.blanco} colorScript={e.acentoOscuro} serifMax={100} serifLineas={2} centrado alto={780 - ALTO_CAP - 22 - 40 - 250 - (h.bajada ? 26 + altoTexto(h.bajada, 28, 860) : 0)} /></div>
        <div style={{ display: "flex", marginTop: 40 }}><Sticker m={c.m} texto={h.tipo === "encuesta" ? "Pon aquí el sticker de encuesta" : "Pon aquí la caja de preguntas"} opciones={h.opciones} oscuro /></div>
        {h.bajada ? <Texto color={e.blanco} size={28} ancho={860} style={{ marginTop: 26, textAlign: "center", justifyContent: "center", opacity: 0.92 }}>{h.bajada}</Texto> : null}
      </Abs>
      <PieHistoria m={c.m} tono="oscuro" />
    </Lienzo>
  );
}

// ---------- Catálogo ----------

export type Pieza = {
  id: string; dia: number; formato: Formato; titulo: string;
  /** Carpeta y nombre del archivo dentro de "03 Disenos" (sin extensión). */
  archivo: string;
  armar: (m: Marca, n: number) => Promise<{ el: ReactNode; conFoto: boolean }>;
};

const CONTENIDO = disenosBase as Contenido;

/** Reemplaza los datos del asesor en todos los textos de un objeto. */
function conDatos<T>(x: T, datos: (t: string) => string): T {
  return JSON.parse(JSON.stringify(x), (_k, v) => (typeof v === "string" ? datos(v) : v)) as T;
}

const textoTitulo = (t: Titulo) => [t.serif, t.script ?? t.acento].filter(Boolean).join(" ");
const slug = (s: string) => {
  const t = s.replace(/ñ/g, "ni").replace(/Ñ/g, "Ni").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  return t.length <= 50 ? t : t.slice(0, 51).replace(/\s+\S*$/, "");
};
const dd = (n: number) => String(n).padStart(2, "0");

// Rotación de estilos de portada para que dos carruseles seguidos no se vean iguales.
const ROTACION_CARRUSEL: EstiloPortada[] = ["arco", "panel", "oscura", "polaroid", "arena", "foto"];
const ROTACION_POST: EstiloPortada[] = ["polaroid", "velo", "arena", "foto", "arco", "oscura"];
const TEMA_DE: Record<EstiloPortada, Tema> = { arco: "claro", panel: "claro", polaroid: "claro", velo: "claro", arena: "arena", oscura: "oscuro", foto: "oscuro" };

function armado(c: Ctx, el: ReactNode) { return { el, conFoto: c.usaFoto }; }

/** Las 40 piezas del pack: 23 carruseles completos, 11 posts y 6 historias. */
export function catalogo(datos: (t: string) => string = (t) => t, contenido: Contenido = CONTENIDO): Pieza[] {
  const piezas: Pieza[] = [];
  let nc = 0, np = 0;
  // Fotos de stock: se anotan en orden, con el diseño que las usa, y se reparten al final (las piezas se arman después).
  const pedidas: Pedida[] = [], fotoDe: string[] = [];
  const pedir = (etiqueta: Etiqueta, estilo: string) => { const k = pedidas.push({ etiqueta, estilo }) - 1; return () => fotoDe[k]; };
  for (const base of [...contenido.dias].sort((a, b) => a.dia - b.dia)) {
    const d = conDatos(base, datos);
    const nombre = `Dia ${dd(d.dia)} - ${slug(textoTitulo(d.titulo))}`;
    if (d.tipo === "carrusel" && d.laminas?.length) {
      const estiloP = ROTACION_CARRUSEL[nc++ % ROTACION_CARRUSEL.length];
      const tema = TEMA_DE[estiloP];
      const total = d.laminas.length + (d.cierre ? 2 : 1);
      const portada: Portada = { ...d, boton: d.boton || "Desliza", flecha: true };
      const f = estiloP === "arena" ? () => undefined : pedir(d.foto, estiloP);
      piezas.push({ id: `dia-${dd(d.dia)}-1`, dia: d.dia, formato: "feed", titulo: textoTitulo(d.titulo), archivo: `${nombre}/${dd(1)} de ${dd(total)}`, armar: async (m, n) => { const c = contexto(m, n, f()); return armado(c, await PORTADAS[estiloP](c, portada)); } });
      const numeradas = d.laminas.filter((l) => !l.extra).length;
      d.laminas.forEach((l, i) => {
        const num = d.laminas!.slice(0, i + 1).filter((x) => !x.extra).length;
        piezas.push({ id: `dia-${dd(d.dia)}-${i + 2}`, dia: d.dia, formato: "feed", titulo: textoTitulo(l.titulo), archivo: `${nombre}/${dd(i + 2)} de ${dd(total)}`, armar: async (m, n) => { const c = contexto(m, n); return armado(c, await LaminaInterior(c, l, num, numeradas, tema, d.etiqueta)); } });
      });
      if (d.cierre) piezas.push({ id: `dia-${dd(d.dia)}-${total}`, dia: d.dia, formato: "feed", titulo: textoTitulo(d.cierre.titulo), archivo: `${nombre}/${dd(total)} de ${dd(total)}`, armar: async (m, n) => { const c = contexto(m, n); return armado(c, await LaminaCierre(c, d.cierre!, tema)); } });
    } else {
      const estiloP = ROTACION_POST[np++ % ROTACION_POST.length];
      const armar = d.dia === 1 ? Presentacion : PORTADAS[estiloP];
      const f = d.dia !== 1 && estiloP === "arena" ? () => undefined : d.dia === 1 ? pedir("sala", "presentacion") : pedir(d.foto, estiloP);
      piezas.push({ id: `dia-${dd(d.dia)}`, dia: d.dia, formato: "feed", titulo: textoTitulo(d.titulo), archivo: nombre, armar: async (m, n) => { const c = contexto(m, n, f()); return armado(c, await armar(c, d)); } });
    }
  }
  const historias = { encuesta: HistoriaEncuesta, preguntas: HistoriaPreguntas, foto: HistoriaFoto };
  contenido.historias.forEach((base, i) => {
    const h = conDatos(base, datos);
    const estiloH = h.tipo === "preguntas" ? "preguntas" : i % 2 === 0 ? "encuesta" : "foto";
    const armar = historias[estiloH];
    const nombre = `Historias/${h.dia ? `Dia ${dd(h.dia)}` : `Historia ${i + 1}`} - ${slug(textoTitulo(h.titulo))}`;
    const f = pedir(h.foto, `historia-${estiloH}`);
    piezas.push({ id: h.id, dia: h.dia ?? 0, formato: "story", titulo: textoTitulo(h.titulo), archivo: nombre, armar: async (m, n) => { const c = contexto(m, n, f()); return armado(c, await armar(c, h)); } });
  });
  fotoDe.push(...repartir(pedidas));
  return piezas;
}

/** Cuántos diseños trae el pack (un carrusel cuenta como un diseño). */
export const totalDisenos = (contenido: Contenido = CONTENIDO) => contenido.dias.length + contenido.historias.length;
