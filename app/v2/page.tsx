// Página de venta, versión oscura de prueba (/v2). No se indexa: la principal sigue siendo app/page.tsx.
// Misma regla que la principal: solo lo que trae el pack, sin testimonios, números ni urgencia inventados.
// Las imágenes son diseños reales del pack armados con dos marcas de ejemplo (scripts/imagenes-web.tsx e imagenes-v2.tsx).
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BarraCompra, Comprar } from "../_web/Comprar";
import { ASoporte, DatosProveedor } from "../_web/Contacto";
import { Opiniones } from "../_web/Opiniones";
import { PRECIO_MXN, SOPORTE } from "@/lib/oferta";
import { PERFIL_EJEMPLO, type Perfil } from "@/lib/perfil";
import { PERFIL_EJEMPLO_2 } from "@/lib/perfil-v2";
import { TEXTOS, reemplazar } from "@/lib/personalizar";
import autor from "@/content/autor.json";
import "../landing.css";
import "./v2.css";

export const metadata: Metadata = {
  title: { absolute: "Publica y Capta · 90 días de contenido con tu marca" },
  description: "90 publicaciones con el texto completo, 40 diseños con tu logo y tus colores, y 30 guiones de reels para Instagram, Facebook y WhatsApp. Pago único.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#1C1B19" };

const PRECIO = `$${PRECIO_MXN} MXN`;

// El día 9 del pack, tal como le sale a la marca de ejemplo.
const DIA_9 = TEXTOS.find((d) => d.dia === 9)!;
const POST_9 = reemplazar(DIA_9.post, PERFIL_EJEMPLO);
const ESTADO_9 = reemplazar(DIA_9.whatsapp, PERFIL_EJEMPLO);

type Img = [src: string, ancho: number, alto: number, alt: string];

const CARRUSELES: Img[] = [
  ["/web/muestra-1.webp", 540, 675, "Portada de carrusel: ¿Cuánto juntar para el enganche?"],
  ["/web/v2/carrusel-1.webp", 540, 675, "Portada de carrusel: Lo que me preguntan todos los días"],
  ["/web/muestra-2.webp", 540, 675, "Lámina interior de un carrusel sobre el enganche"],
  ["/web/v2/carrusel-2.webp", 540, 675, "Portada de carrusel: Antes de apartar en preventa"],
  ["/web/muestra-3.webp", 540, 675, "Portada de carrusel: Lo que te va a pedir el notario"],
  ["/web/v2/carrusel-3.webp", 540, 675, "Portada de carrusel: Checklist para tu primera visita"],
  ["/web/muestra-4.webp", 540, 675, "Lámina de cierre de un carrusel con el botón para escribir"],
];

const POSTS: Img[] = [
  ["/web/muestra-6.webp", 540, 675, "Post de presentación: Hola, soy Laura"],
  ["/web/v2/historia-1.webp", 540, 960, "Historia con caja de preguntas: ¿Rentas tu depa?"],
  ["/web/v2/post-1.webp", 540, 675, "Post: No infles tu precio de salida"],
  ["/web/muestra-post.webp", 540, 675, "Post: ¿Tu casa lleva meses publicada?"],
  ["/web/muestra-5.webp", 540, 960, "Historia con espacio para la caja de preguntas"],
  ["/web/v2/post-2.webp", 540, 675, "Post: Calcula tu mensualidad cómoda"],
];

const PARTES: [string, string][] = [
  ["Gancho", "La primera línea, para que dejen de deslizar."],
  ["Desarrollo", "La explicación clara, sin palabras de notario."],
  ["Llamada a la acción", "Con una palabra clave para saber quién te escribe por ese post."],
  ["Hashtags", "Listos para pegar; en la mayoría, con tu ciudad ya puesta."],
];

const EXTRAS: [string, string, string, ReactNode][] = [
  ["Bono", "Perfil que capta en 1 hora", "Foto, bio, historias destacadas y tus 9 primeras publicaciones, paso a paso.",
    <><circle cx="20" cy="15" r="6" /><path d="M9 33c1.5-6 6-9 11-9s9.5 3 11 9" /></>],
  ["Bono", "20 prompts para tu colonia", "Para adaptar cualquier texto a tu colonia con ChatGPT, Gemini o la IA que uses.",
    <><path d="M8 10h24v16H17l-6 5v-5H8z" /><path d="M14 16h12M14 21h8" /></>],
  ["En el pack", "Calendario de 90 días", "Qué publicar cada día: compradores, vendedores, rentas y tu marca personal.",
    <><rect x="7" y="9" width="26" height="24" rx="2" /><path d="M7 16h26M14 6v6M26 6v6M13 22h3M19 22h3M25 22h3M13 27h3M19 27h3" /></>],
  ["En el pack", "Versión para estados de WhatsApp", "Cada publicación trae su texto corto para tus estados.",
    <><rect x="12" y="5" width="16" height="30" rx="3" /><path d="M17 9h6M18 30h4" /></>],
];

// [tipo, qué es, detalle]
const RESUMEN: [string, string, string][] = [
  ["Pack", "90 publicaciones con el texto completo", "gancho, desarrollo, llamada a la acción y hashtags"],
  ["Pack", "Calendario de 90 días", "qué publicar cada día"],
  ["Pack", "40 diseños con tu logo, tus colores y tus datos", "23 carruseles, 11 posts y 6 historias"],
  ["Pack", "30 guiones de reels toma por toma", "con 3 ganchos para elegir; 15 sin salir a cámara"],
  ["Pack", "Versión para estados de WhatsApp", "de cada publicación"],
  ["Pack", "Guía “Empieza aquí”", "para publicar desde el primer día"],
  ["Herramienta", "Generador de post e historia para cada propiedad", "precio, recámaras, m², colonia y foto"],
  ["Bono", "Perfil que capta en 1 hora", "foto, bio, destacadas y tus 9 primeras publicaciones"],
  ["Bono", "20 prompts para adaptar cualquier texto a tu colonia", "para usar con la IA que prefieras"],
];

const PREGUNTAS: [string, ReactNode][] = [
  ["¿Cómo recibo el pack?", "Al terminar el pago te llega un correo con el acceso. Entras con el mismo correo con el que pagaste, llenas el formulario (unos 5 minutos) y en minutos descargas todo. Puedes volver a armarlo y descargarlo durante al menos 12 meses. Si no ves el correo, revisa spam o promociones."],
  ["¿Necesito Canva o saber de diseño?", "No. Los diseños te llegan listos, con tu nombre, tu logo y tus colores. Solo descargas y publicas."],
  ["¿Tengo que salir en video?", "No. De los 30 guiones, 15 son sin salir a cámara: texto en pantalla, tomas de casas y voz en off si quieres."],
  ["¿Sirve para mi ciudad? ¿Y si trabajo en una inmobiliaria?", "Sí. Los textos no dependen de una ciudad: en el formulario pones tu zona y tus colonias, y los textos salen con ellas. Si trabajas en una inmobiliaria o franquicia, los diseños pueden llevar tu logo o el de tu oficina."],
  ["¿Me garantiza clientes?", "No. Nadie te lo puede garantizar. Lo que te da es contenido listo para que publiques con constancia y quien te busque encuentre un perfil activo y profesional."],
  ["¿Y si no me sirve?", <>{SOPORTE ? <>Escríbenos<ASoporte /></> : process.env.CORREO_RESPUESTAS ? "Responde el correo en el que te llegó tu acceso" : "Escríbenos"} dentro de los 7 días naturales siguientes a tu compra y te devolvemos lo que pagaste. Al reembolsarte se desactiva tu acceso. Las condiciones están en los <a href="/terminos">términos y condiciones</a>.</>],
];

type Autor = { nombre?: string; rol?: string; texto?: string[]; foto?: string };

function Marca() {
  return <a className="marca" href="/v2" aria-label="Publica y Capta, inicio"><span className="monograma">P<i>y</i>C</span><b>Publica y Capta</b></a>;
}

function BotonCompra() {
  return <Comprar className="compra">Quiero mi pack <span className="compra-precio">{PRECIO}</span><span className="flecha" aria-hidden /></Comprar>;
}

function Accion() {
  return <div className="v2-accion"><BotonCompra /></div>;
}

function Etiqueta({ children, llena }: { children: ReactNode; llena?: boolean }) {
  return <p className={`v2-etiqueta${llena ? " llena" : ""}`}>{children}</p>;
}

function Telefono({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`v2-tel ${className}`}><div className="v2-tel-pantalla">{children}</div></div>;
}

const DESTACADAS = ["Compra", "Vende", "Rentas", "Sobre mí"];

/** Perfil de Instagram de una marca de ejemplo: encabezado, historias destacadas y la cuadrícula del feed. */
function PerfilIG({ usuario, ini, nombre, bio, img, alt, color, carga = "lazy" }: { usuario: string; ini: string; nombre: string; bio: string; img: string; alt: string; color: string; carga?: "lazy" | "eager" }) {
  return (
    <div className="v2-ig">
      <div className="v2-ig-cab" aria-hidden>
        <b>{usuario}</b>
        <div className="v2-ig-perfil">
          <span className="v2-ig-ini" style={{ borderColor: color, color }}>{ini}</span>
          <div><b>{nombre}</b><span>{bio}</span></div>
        </div>
        <div className="v2-ig-botones"><span style={{ background: color }}>Seguir</span><span>Mensaje</span></div>
        <ul className="v2-ig-destacadas">
          {DESTACADAS.map((d) => <li key={d}><i style={{ borderColor: color }} />{d}</li>)}
        </ul>
        <div className="v2-ig-tabs"><i /><i /><i /></div>
      </div>
      <img src={img} width={1080} height={1347} alt={alt} loading={carga} />
    </div>
  );
}

/** Lo que PerfilIG necesita de una marca de ejemplo, sacado del mismo perfil con el que se armaron sus imágenes. */
function marcaIG(p: Perfil, img: string) {
  const ini = p.nombre.split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  return { usuario: p.usuarioRedes.replace(/^@/, ""), ini, nombre: p.nombre, bio: `Asesora inmobiliaria · ${p.ciudad}`, img, color: p.colorPrincipal };
}
const LAURA = marcaIG(PERFIL_EJEMPLO, "/web/perfil.webp");
const ANDREA = marcaIG(PERFIL_EJEMPLO_2, "/web/v2/perfil.webp");
// Nombres de los colores para el pie de cada teléfono (si se regeneran las imágenes con otros colores, cambiarlos aquí).
const COLORES_LAURA = "azul y ámbar";
const COLORES_ANDREA = "vino y rosa palo";

function Muestras({ p }: { p: Perfil }) {
  return <><i style={{ background: p.colorPrincipal }} /><i style={{ background: p.colorAcento }} /></>;
}

/** Laptop con diseños del pack y dos teléfonos, todo de la misma marca de ejemplo: portada y oferta. `decorativa`: la segunda vez, sin repetir los alt. */
function Dispositivos({ prioridad, decorativa }: { prioridad?: boolean; decorativa?: boolean }) {
  const tiles: [string, number][] = [["/web/muestra-1.webp", 675], ["/web/muestra-6.webp", 675], ["/web/muestra-2.webp", 675], ["/web/muestra-post.webp", 675], ["/web/muestra-3.webp", 675], ["/web/muestra-7.webp", 675], ["/web/muestra-4.webp", 675], ["/web/muestra-8.webp", 960]];
  const carga = prioridad ? "eager" : "lazy";
  return (
    <figure className="v2-disp" aria-hidden={decorativa || undefined}>
      <div className="v2-laptop">
        <div className="v2-laptop-pantalla">
          {tiles.map(([s, h]) => <img key={s} src={s} width={540} height={h} alt="" loading={carga} />)}
        </div>
        <div className="v2-laptop-base" />
      </div>
      <Telefono className="v2-disp-izq">
        <PerfilIG {...LAURA} alt={decorativa ? "" : "Perfil de Instagram armado con los diseños del pack"} carga={carga} />
      </Telefono>
      <Telefono className="v2-disp-der">
        <img src="/web/muestra-5.webp" width={540} height={960} alt={decorativa ? "" : "Historia del pack con espacio para la caja de preguntas"} loading={carga} />
      </Telefono>
    </figure>
  );
}

/** Tira de diseños que corre sola en compu (la segunda vuelta es copia) y se desliza con el dedo en celular. */
function Galeria({ imagenes, etiqueta, inversa }: { imagenes: Img[]; etiqueta: string; inversa?: boolean }) {
  return (
    <div className={`v2-galeria${inversa ? " inversa" : ""}`} role="region" aria-label={etiqueta} tabIndex={0}>
      <ul className="v2-pista">
        {[...imagenes, ...imagenes].map(([src, w, h, alt], k) => {
          const copia = k >= imagenes.length;
          return (
            <li key={k} className={copia ? "v2-copia" : undefined} aria-hidden={copia || undefined}>
              <img src={src} width={w} height={h} alt={copia ? "" : alt} loading="lazy" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** "Quién está detrás": solo si content/autor.json tiene nombre. Nada inventado. */
function QuienEsta() {
  const a = autor as Autor;
  if (!a.nombre?.trim()) return null;
  return (
    <section className="v2-sec v2-clara v2-autor">
      <div className="v2-ancho">
        <Etiqueta>Quién está detrás</Etiqueta>
        <div className="v2-autor-caja">
          {a.foto && <img src={a.foto} width={480} height={600} alt={`Foto de ${a.nombre}`} loading="lazy" />}
          <div>
            <h2>{a.nombre}</h2>
            {a.rol && <p className="v2-autor-rol">{a.rol}</p>}
            {(a.texto ?? []).map((t, i) => <p key={i}>{t}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function V2() {
  return (
    <div className="l v2">
      <header className="v2-barra">
        <Marca />
        <a className="v2-entrar" href="/entrar">Entrar</a>
      </header>

      <main>
        {/* 1. Portada */}
        <section className="v2-portada">
          <div className="v2-ancho v2-centro">
            <Etiqueta>Para asesores inmobiliarios en México</Etiqueta>
            <h1>Tus próximos 90 días de publicaciones, <em>listos y con tu marca.</em></h1>
            <p className="v2-bajada">Textos completos, diseños con tu logo y tus colores, y guiones de reels para Instagram, Facebook y WhatsApp. Llenas un formulario y en minutos lo descargas.</p>
            <div className="v2-portada-cta"><BotonCompra /></div>
            <ul className="v2-hechos" aria-label="Lo esencial">
              <li>90 publicaciones</li><li>40 diseños</li><li>30 guiones</li><li>Reembolso en 7 días</li>
            </ul>
          </div>
          <div className="v2-ancho"><Dispositivos prioridad /><p className="v2-nota v2-disp-nota">Diseños reales del pack, armados con una marca de ejemplo</p></div>
        </section>

        {/* 2. Por qué importa (clara) */}
        <section className="v2-sec v2-clara v2-porque">
          <div className="v2-ancho v2-angosto v2-centro">
            <Etiqueta>Tu perfil habla primero</Etiqueta>
            <h2>Antes de llamarte, <em>te buscan.</em></h2>
            <p>Quien piensa comprar, vender o rentar suele revisar tu Instagram antes de mandarte un mensaje.</p>
            <p>Si encuentra un perfil <strong>activo</strong>, con consejos claros y tu marca, llega con más confianza.</p>
            <p>Lo difícil no es el diseño. Es <strong>publicar con constancia</strong> y saber qué escribir cada día.</p>
            <p className="v2-porque-cierre">Eso es lo que resuelve el pack: el texto, el diseño y el calendario de 90 días, listos para que te enfoques en publicar.</p>
            <div className="v2-adorno" aria-hidden><span /></div>
          </div>
        </section>

        {/* 3. Qué recibes */}
        <section className="v2-sec v2-recibes">
          <div className="v2-ancho v2-centro">
            <Etiqueta>Hecho con tu marca</Etiqueta>
            <h2>Todo sale <em>con tus colores</em></h2>
            <p className="v2-bajada">Llenas un formulario con tu logo, tus colores, tu zona y tus datos, y con eso se arman los 40 diseños y los 90 textos. Aquí, el pack armado con dos marcas de ejemplo.</p>
            <div className="v2-dos-tel">
              <figure>
                <Telefono><PerfilIG {...LAURA} alt={`Perfil de Instagram con los diseños del pack en ${COLORES_LAURA}`} /></Telefono>
                <figcaption><Muestras p={PERFIL_EJEMPLO} />Marca de ejemplo en {COLORES_LAURA}</figcaption>
              </figure>
              <figure>
                <Telefono><PerfilIG {...ANDREA} alt={`Perfil de Instagram con los diseños del pack en ${COLORES_ANDREA}`} /></Telefono>
                <figcaption><Muestras p={PERFIL_EJEMPLO_2} />Marca de ejemplo en {COLORES_ANDREA}</figcaption>
              </figure>
            </div>
          </div>
          <div className="v2-ancho">
            <div className="v2-tarjetas-2">
              <article className="v2-tarjeta">
                <Etiqueta>Tus colores</Etiqueta>
                <h3>Con tus colores de marca</h3>
                <p>Los diseños tienen una base neutra y elegante, y tus colores de marca en las palabras clave y los detalles. Si uno de tus colores no se lee bien sobre algún fondo, se usa el otro o un tono neutro para que todo se lea.</p>
              </article>
              <article className="v2-tarjeta">
                <Etiqueta>Tus datos</Etiqueta>
                <h3>Con tu logo y tus datos</h3>
                <p>Tu nombre, tu logo o tus iniciales, tu usuario y tu WhatsApp ya vienen puestos. Y los textos hablan de tu zona y tus colonias.</p>
              </article>
            </div>
            <ul className="v2-pastillas" aria-label="En resumen">
              <li>90 textos completos</li><li>40 diseños</li><li>30 guiones de reels</li><li>Instagram · Facebook · WhatsApp</li><li>Sin Canva</li>
            </ul>
            <Accion />
          </div>
        </section>

        {/* 4. Galerías */}
        <section className="v2-sec v2-galerias">
          <div className="v2-ancho v2-centro">
            <Etiqueta>Galería · Carruseles</Etiqueta>
            <h2>Carruseles que <em>enseñan</em></h2>
            <p className="v2-sub">23 carruseles sobre enganche, crédito, papeles, precio y rentas. Aquí van algunos.</p>
            <label className="v2-pausa"><input type="checkbox" /> Detener las galerías</label>
          </div>
          <Galeria imagenes={CARRUSELES} etiqueta="Ejemplos de carruseles del pack" />
          <div className="v2-ancho v2-centro v2-galeria-2">
            <Etiqueta>Galería · Posts e historias</Etiqueta>
            <h2>Posts e <em>historias</em></h2>
            <p className="v2-sub">11 posts y 6 historias; las historias traen espacio para tu encuesta o tu caja de preguntas.</p>
          </div>
          <Galeria imagenes={POSTS} etiqueta="Ejemplos de posts e historias del pack" inversa />
          <div className="v2-ancho">
            <p className="v2-nota">Diseños reales del pack con dos marcas de ejemplo. Los tuyos salen con tu nombre, tu logo, tus colores y tu WhatsApp.</p>
            <Accion />
          </div>
        </section>

        {/* 5. Generador de propiedades */}
        <section className="v2-sec v2-propiedad">
          <div className="v2-ancho v2-dos-col">
            <div className="v2-col-cab">
              <Etiqueta llena>Herramienta incluida</Etiqueta>
              <h2>Cada propiedad, <em>lista para publicar</em></h2>
              <p className="v2-texto">Cuando captas una casa, cargas sus datos y una foto. Salen el post y la historia con tu marca, para anunciarla el mismo día.</p>
            </div>
            <div className="v2-col-media v2-propiedad-img">
              <img className="v2-prop-post" src="/web/muestra-7.webp" width={540} height={675} alt="Post de una casa en venta en Ciudad Granja, armado con el generador" loading="lazy" />
              <Telefono className="v2-prop-tel">
                <img src="/web/muestra-8.webp" width={540} height={960} alt="Historia de la misma casa, armada con el generador" loading="lazy" />
              </Telefono>
            </div>
            <div className="v2-col-detalle">
              <ul className="v2-pastillas v2-izq" aria-label="Lo que cargas">
                <li>Precio</li><li>Recámaras</li><li>m²</li><li>Colonia</li><li>Foto</li>
              </ul>
              <Accion />
            </div>
          </div>
        </section>

        {/* 6. El texto completo (clara) */}
        <section className="v2-sec v2-clara v2-texto-sec">
          <div className="v2-ancho v2-dos-col">
            <div className="v2-col-cab">
              <Etiqueta>El texto, completo</Etiqueta>
              <h2>No solo el diseño: <em>también el texto</em></h2>
              <p className="v2-texto">Cada uno de los 90 días trae el texto entero, con tus datos ya puestos. En algunos, como los de tus propiedades o tu historia, completas lo que va entre corchetes. Este es el del día 9, tal como le sale a la marca de ejemplo.</p>
            </div>
            <article className="v2-col-media v2-post" aria-label="Ejemplo de publicación del día 9">
              <header className="v2-post-cab"><span className="v2-ig-ini" style={{ borderColor: LAURA.color, color: LAURA.color }}>{LAURA.ini}</span><div><b>{LAURA.usuario}</b><span>{PERFIL_EJEMPLO.ciudad}</span></div></header>
              <img src="/web/muestra-post.webp" width={540} height={675} alt="Diseño del día 9: ¿Tu casa lleva meses publicada?" loading="lazy" />
              <div className="v2-post-iconos" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z" /></svg>
                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M20 12a8 8 0 1 1-3.2-6.4A8 8 0 0 1 20 12zM20 20l-2.6-2.6" /></svg>
                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M21 4 3 11l7 2 2 7z" /></svg>
              </div>
              <p className="v2-post-texto"><b>{LAURA.usuario}</b> {POST_9}</p>
            </article>
            <div className="v2-col-detalle">
              <ol className="v2-partes">
                {PARTES.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
              </ol>
              <div className="v2-estado">
                <p className="v2-estado-cab">Y su versión para tus estados de WhatsApp</p>
                <p className="v2-estado-burbuja">{ESTADO_9}</p>
              </div>
              <Accion />
            </div>
          </div>
        </section>

        {/* 7. Guiones de reels */}
        <section className="v2-sec v2-guiones">
          <div className="v2-ancho v2-centro">
            <Etiqueta>Reels</Etiqueta>
            <h2>30 guiones de reels, <em>toma por toma</em></h2>
            <p className="v2-bajada">Qué grabar en cada toma, qué texto poner en pantalla y, si quieres, qué decir en voz en off. Se graban con el celular, sin equipo.</p>
          </div>
          <div className="v2-ancho">
            <figure className="v2-guion">
              <div className="v2-guion-cab"><span>Día 5 · Infonavit: cuánto te prestan</span><span className="v2-guion-tipo">Sin salir a cámara · 30 a 35 segundos</span></div>
              <p className="v2-guion-sub">Gancho: elige uno para los primeros 3 segundos</p>
              <ol className="v2-guion-ganchos">
                <li>“¿Cotizas en el Infonavit y no sabes cuánto te prestan?”</li>
                <li>“Antes de ver casas, haz esta consulta desde tu celular.”</li>
                <li>“Tu monto del Infonavit no es un secreto. Así lo consultas.”</li>
              </ol>
              <table>
                <thead><tr><th scope="col">Seg.</th><th scope="col">Toma</th><th scope="col">Texto en pantalla</th></tr></thead>
                <tbody>
                  <tr><td>0-3</td><td>Fachada de una casa; el celular entra a cuadro desde abajo</td><td>El gancho que elegiste</td></tr>
                  <tr><td>3-7</td><td>Tu mano con el celular en una pantalla de inicio de sesión, sin datos reales</td><td>“Entra a Mi Cuenta Infonavit con tu NSS”</td></tr>
                  <tr><td>7-11</td><td>Plano cerrado: tu pulgar baja por la pantalla</td><td>“Ahí ves tu precalificación”</td></tr>
                </tbody>
              </table>
              <figcaption className="v2-guion-pie">Fragmento del guion del día 5</figcaption>
            </figure>
            <ul className="v2-datos">
              <li><b>30</b><span>guiones de reels</span></li>
              <li><b>15</b><span>sin salir a cámara</span></li>
              <li><b>3</b><span>ganchos por guion</span></li>
            </ul>
            <Accion />
          </div>
        </section>

        {/* 8. Y además */}
        <section className="v2-sec v2-ademas">
          <div className="v2-ancho v2-centro">
            <Etiqueta llena>Bonos y extras</Etiqueta>
            <h2>Dos bonos y lo que necesitas <em>para&nbsp;arrancar</em></h2>
            <p className="v2-bajada">Además del calendario y la versión para tus estados de WhatsApp, te llevas dos bonos para dejar listo tu perfil y adaptar los textos a tu colonia.</p>
          </div>
          <div className="v2-ancho">
            <ul className="v2-extras">
              {EXTRAS.map(([tipo, t, d, icono]) => (
                <li key={t}>
                  <svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icono}</svg>
                  <div><span className="v2-extra-tipo">{tipo}</span><h3>{t}</h3><p>{d}</p></div>
                </li>
              ))}
            </ul>
            <Accion />
          </div>
        </section>

        {/* 9. Opiniones (solo con conversaciones reales) */}
        <Opiniones><BotonCompra /></Opiniones>

        {/* 10. Quién está detrás (solo con datos reales) */}
        <QuienEsta />

        {/* 11. Resumen */}
        <section className="v2-sec v2-resumen">
          <div className="v2-ancho v2-angosto">
            <div className="v2-centro">
              <Etiqueta>En una lista</Etiqueta>
              <h2>Todo lo que <em>recibes</em></h2>
            </div>
            <ul className="v2-lista">
              {RESUMEN.map(([tipo, t, d]) => (
                <li key={t}><span className={`v2-tipo v2-tipo-${tipo.toLowerCase()}`}>{tipo}</span><p><b>{t}</b>{"\u00a0·"} <span>{d}</span></p></li>
              ))}
            </ul>
          </div>
        </section>

        {/* 12. Oferta */}
        <section className="v2-sec v2-oferta" id="oferta">
          <div className="v2-ancho v2-centro">
            <Etiqueta>Tu pack</Etiqueta>
            <h2>Tus 90 días, <em>en un solo pago</em></h2>
          </div>
          <div className="v2-ancho v2-oferta-disp"><Dispositivos decorativa /></div>
          <div className="v2-ancho">
            <div className="v2-precio">
              <ul className="v2-check">
                <li>90 publicaciones con el texto completo</li>
                <li>Calendario de 90 días</li>
                <li>40 diseños con tu marca</li>
                <li>30 guiones de reels</li>
                <li>Generador de propiedades</li>
                <li>Versión para estados de WhatsApp</li>
                <li>Guía “Empieza aquí”</li>
                <li>2 bonos</li>
              </ul>
              <p className="v2-precio-cap">Precio único</p>
              <p className="v2-monto">{PRECIO}</p>
              <p className="v2-precio-nota">Pago único, sin suscripción</p>
              <Comprar className="compra">Quiero mi pack <span className="flecha" aria-hidden /></Comprar>
              <p className="v2-precio-pie"><span className="nw">Acceso por correo al terminar el pago</span> <span className="nw"><span className="v2-sep" aria-hidden>· </span>Reembolso en 7 días naturales</span></p>
              <p className="v2-precio-pie">Antes de pagar, lee los <a href="/terminos">términos y condiciones</a>.</p>
            </div>
          </div>
        </section>

        {/* 13. Sellos */}
        <section className="v2-sellos" aria-label="Condiciones de compra">
          <ul className="v2-ancho">
            <li><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></svg>Pago único</li>
            <li><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M13 3 5 14h6l-1 7 8-11h-6z" /></svg>Acceso inmediato</li>
            <li><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></svg>Reembolso en 7 días</li>
            <li><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><circle cx="12" cy="12" r="8" /><path d="M7 17 17 7" /></svg>Sin suscripción</li>
          </ul>
        </section>

        {/* 14. Preguntas */}
        <section className="v2-sec v2-faq" id="preguntas">
          <div className="v2-ancho v2-angosto">
            <div className="v2-centro">
              <Etiqueta>Preguntas frecuentes</Etiqueta>
              <h2>Antes de <em>comprar</em></h2>
            </div>
            <div className="v2-acordeon">
              {PREGUNTAS.map(([p, r]) => <details key={p}><summary>{p}</summary><p>{r}</p></details>)}
            </div>
          </div>
        </section>

        {/* 15. Aviso */}
        <section className="v2-aviso" aria-label="Aviso">
          <p className="v2-ancho v2-angosto">El pack te da contenido listo para publicar; no garantiza ventas ni un número de clientes. Los resultados dependen de tu constancia, de tu zona y de cómo atiendes a quien te escribe.</p>
        </section>
      </main>

      <footer className="v2-pie">
        <Marca />
        <DatosProveedor />
        <ul className="v2-pie-enlaces"><li><a href="/terminos">Términos y condiciones</a></li><li><a href="/privacidad">Aviso de privacidad</a></li><li><a href="/entrar">Ya compré: entrar</a></li></ul>
      </footer>
      <BarraCompra precio={PRECIO} />
    </div>
  );
}
