// Página de venta. El botón lleva al checkout de Impul; quien ya compró entra desde "Entrar".
// Regla: la página promete solo lo que trae el pack (90 publicaciones, 40 diseños, 30 guiones). Sin testimonios,
// números ni urgencia inventados. Las imágenes son diseños reales del pack armados con una marca de ejemplo.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BarraCompra, Comprar } from "./_web/Comprar";
import { ASoporte, DatosProveedor } from "./_web/Contacto";
import { Opiniones } from "./_web/Opiniones";
import { PRECIO_MXN } from "@/lib/oferta";
import "./landing.css";

export const metadata: Metadata = {
  title: "Publica y Capta · 90 días de contenido para asesores inmobiliarios",
  description: "90 publicaciones con el texto completo, 40 diseños con tu logo y tus colores y 30 guiones de reels, para Instagram, Facebook y WhatsApp. Pago único.",
};

const PRECIO = `$${PRECIO_MXN} MXN`;

// [tema, plantilla gratis, Publica y Capta, la plantilla lo trae a medias]
const COMPARA: [string, string, string, boolean?][] = [
  ["Diseño", "Sí, pero con texto de relleno: el de cada lámina lo escribes tú", "40 diseños de bienes raíces, con el texto de cada lámina ya puesto", true],
  ["Texto de cada publicación", "Texto de muestra que cambias tú, uno por uno", "90 textos completos, listos para copiar; solo completas lo marcado, como el precio de cada propiedad"],
  ["Tu logo, colores y contacto", "Los pones tú en cada diseño", "Ya vienen puestos en los 40 diseños"],
  ["Qué publicar cada día", "Lo decides tú", "Calendario de 90 días"],
  ["Lo que pregunta el cliente mexicano", "Textos genéricos, a veces en inglés o de España", "Infonavit, enganche, avalúo, escrituración"],
  ["Tiempo que te toma", "Lo que tardes en escribir y diseñar cada post", "Unos 5 minutos de formulario; el pack se arma solo"],
];

const PASOS: [string, string, ReactNode][] = [
  ["Haces tu pago", "Pago único y seguro. Te llega un correo con tu acceso.",
    <><rect x="5" y="11" width="30" height="20" rx="3" /><path d="M5 17h30M10 25h7" /></>],
  ["Llenas un formulario", "Tu logo, tus colores, tu zona y tus datos. Toma unos 5 minutos.",
    <><rect x="9" y="6" width="22" height="28" rx="2" /><path d="M15 6v-1h10v1M14 15h12M14 21h12M14 27h7" /></>],
  ["Descargas y publicas", "Tus 90 días con tu marca: cada día sabes qué publicar y copias el texto listo.",
    <><path d="M20 6v18M13 17l7 7 7-7" /><path d="M7 25v7h26v-7" /></>],
];

// Muestras de la tira (las 5 y 8 son historias, verticales). Salen de scripts/imagenes-web.tsx.
const MUESTRAS: [number, string][] = [
  [1, "Portada de carrusel: ¿Cuánto juntar para el enganche?"],
  [2, "Lámina interior de un carrusel sobre el enganche"],
  [3, "Portada de carrusel: Lo que te va a pedir el notario"],
  [4, "Lámina de cierre de un carrusel con el botón para escribir"],
  [5, "Historia con espacio para la caja de preguntas"],
  [6, "Post de presentación: Hola, soy Laura"],
  [7, "Post de una propiedad armado con el generador"],
  [8, "Historia de una propiedad armada con el generador"],
];

const INCLUYE: [string, string][] = [
  ["90 publicaciones con el texto completo", "gancho, desarrollo, llamada a la acción y hashtags"],
  ["Calendario de 90 días", "compradores, vendedores, rentas y tu marca personal"],
  ["40 diseños con tu logo y tus colores", "23 carruseles, 11 posts y 6 historias"],
  ["30 guiones de reels", "15 sin salir a cámara"],
  ["Generador de post e historia para cada propiedad", "cargas los datos y una foto, y sale con tu marca"],
  ["Versión para Instagram, Facebook y WhatsApp", "con su texto corto para tus estados"],
  ["Guía “Empieza aquí”", "para publicar desde el primer día"],
  ["2 bonos", "Perfil que capta en 1 hora y 20 prompts para tu colonia"],
];

const PREGUNTAS: [string, ReactNode][] = [
  ["¿Necesito Canva o saber de diseño?", "No. Llenas un formulario y te entregamos los diseños listos, con tu nombre, tu logo y tus colores."],
  ["¿Tengo que salir en video?", "No. 15 de los 30 guiones se graban sin salir a cámara: con texto en pantalla o voz en off."],
  ["¿Cómo recibo el pack?", "Al terminar el pago te llega un correo con el acceso. Entras con el mismo correo, llenas el formulario y descargas todo. Si no ves el correo, revisa spam o promociones."],
  ["¿Sirve para mi ciudad? ¿Y si trabajo en una inmobiliaria?", "Sí. Los textos no dependen de una ciudad: con el formulario ponemos tu zona y tus colonias. Si trabajas en una inmobiliaria o franquicia, los diseños llevan tu logo o el de tu oficina."],
  ["¿El pack me garantiza clientes?", "No, y nadie te lo puede garantizar. Lo que te da es el contenido listo para que publiques con constancia y, cuando alguien te busque, encuentre un perfil activo y profesional."],
  ["¿Y si no me sirve?", <>Escríbenos<ASoporte /> dentro de los 7 días naturales siguientes a tu compra y te devolvemos lo que pagaste. Al reembolsarte se desactiva tu acceso.</>],
];

function Marca() {
  return <a className="marca" href="/" aria-label="Publica y Capta, inicio"><span className="monograma">P<i>y</i>C</span><b>Publica y Capta</b></a>;
}

/** El botón de compra de la página: el mismo en todas las secciones. */
function BotonCompra() {
  return <Comprar className="compra">Quiero mi pack <span className="compra-precio">{PRECIO}</span><span className="flecha" aria-hidden /></Comprar>;
}

export default function Inicio() {
  return (
    <div className="l">
      <header className="l-barra">
        <Marca />
        <nav aria-label="Secciones">
          <a href="#como">Así funciona</a>
          <a href="#incluye">Qué incluye</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <div className="l-barra-acciones">
          <a className="l-entrar" href="/entrar">Entrar</a>
          <Comprar className="compra l-solo-compu">Quiero mi pack <span className="flecha" aria-hidden /></Comprar>
        </div>
      </header>

      <main>
        {/* Portada */}
        <section className="l-hero">
          <div className="l-hero-texto">
            <div className="cap">Para asesores inmobiliarios en México</div>
            <h1>Publica todos los días <em>sin pensar</em> qué escribir.</h1>
            <p className="l-lead">El texto y el diseño de cada día, con tu logo y tus colores, para Instagram, Facebook y WhatsApp.</p>
            <div className="l-cta">
              <BotonCompra />
              <p className="ayuda">Pago único, sin suscripción. Reembolso en 7 días.</p>
            </div>
          </div>
          <figure className="l-hero-img">
            <img src="/web/hero.webp" width={1200} height={990} alt="Carrusel, post e historia del pack con una marca de ejemplo" fetchPriority="high" />
            <figcaption>Diseños reales del pack, armados con una marca de ejemplo</figcaption>
          </figure>
        </section>

        {/* Números */}
        <section className="l-numeros" aria-label="Lo que trae el pack">
          <div><b>90</b><span>publicaciones</span></div>
          <div><b>40</b><span>diseños</span></div>
          <div><b>30</b><span>guiones de reels</span></div>
          <div><b>3</b><span>redes sociales</span></div>
        </section>

        {/* Comparativa */}
        <section className="l-sec l-dif">
          <div className="l-ancho">
            <div className="cap">La diferencia</div>
            <h2>Una plantilla te da el diseño. <em>Aquí ya viene todo hecho.</em></h2>
            <table className="l-tabla" role="table">
              <caption className="l-solo-lector">Una plantilla gratis contra Publica y Capta</caption>
              <thead role="rowgroup">
                <tr role="row">
                  <td role="cell" />
                  <th scope="col" role="columnheader" className="l-t-ellos">Una plantilla gratis{" "}<span>de Canva o de internet</span></th>
                  <th scope="col" role="columnheader" className="l-t-nos"><span className="l-etiqueta">Lo que recibes</span>{" "}Publica y Capta</th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {COMPARA.map(([tema, ellos, nos, aMedias]) => (
                  <tr key={tema} role="row">
                    <th scope="row" role="rowheader">{tema}</th>
                    <td role="cell" className={`l-t-ellos${aMedias ? " a-medias" : ""}`}><i aria-hidden />{ellos}</td>
                    <td role="cell" className="l-t-nos"><i aria-hidden />{nos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="l-accion"><BotonCompra /></div>
          </div>
        </section>

        {/* Así funciona */}
        <section className="l-sec l-como" id="como">
          <div className="l-ancho">
            <div className="cap">Así funciona</div>
            <h2>Tres pasos y <em>a publicar</em></h2>
            <ol className="l-pasos">
              {PASOS.map(([t, d, icono], i) => (
                <li key={t}>
                  <div className="l-paso-ico">
                    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icono}</svg>
                    <span className="l-paso-n">{i + 1}</span>
                  </div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
            <div className="l-accion"><BotonCompra /></div>
          </div>
        </section>

        {/* Así se ve */}
        <section className="l-sec l-muestras" id="muestras">
          <div className="l-ancho">
            <div className="cap">Así se ve por dentro</div>
            <h2>Diseños que se ven de revista, <em>con tu marca.</em></h2>
          </div>
          {/* En compu la tira corre sola (la segunda vuelta es copia, para que no se corte); en celular se desliza con el dedo. */}
          <div className="l-carrusel" tabIndex={0} role="region" aria-label="Muestras del pack">
            <div className="l-pista" role="list">
              {[...MUESTRAS, ...MUESTRAS].map(([n, alt], k) => (
                <img key={k} role={k < MUESTRAS.length ? "listitem" : undefined} aria-hidden={k >= MUESTRAS.length || undefined} src={`/web/muestra-${n}.webp`} width={540} height={n === 5 || n === 8 ? 960 : 675} alt={k < MUESTRAS.length ? alt : ""} loading="lazy"
                  className={[n === 5 || n === 8 ? "alta" : "", k >= MUESTRAS.length ? "l-copia" : ""].filter(Boolean).join(" ") || undefined} />
              ))}
            </div>
          </div>
          <div className="l-ancho">
            <p className="ayuda l-nota">Diseños reales del pack con una marca de ejemplo. Los tuyos salen con tu nombre, tu logo, tus colores y tus datos de contacto. Y cada día trae el texto completo, listo para copiar y pegar.</p>
            <div className="l-accion"><BotonCompra /></div>
          </div>
        </section>

        <Opiniones><BotonCompra /></Opiniones>

        {/* Precio y qué incluye */}
        <section className="l-sec l-precio" id="incluye">
          <div className="l-ancho l-precio-caja">
            <div className="l-precio-cab">
              <div className="cap">Qué incluye</div>
              <h2>Todo lo que recibes, <em>en un solo pago</em></h2>
            </div>
            <div className="tarjeta oscura l-oferta">
              <ul className="lista-check">
                {INCLUYE.map(([t, d]) => <li key={t}><b>{t}</b> <span>· {d}</span></li>)}
              </ul>
              <div className="l-monto"><span className="serif">{PRECIO}</span></div>
              <BotonCompra />
              <p className="ayuda">Precio en pesos mexicanos. Pago único, sin suscripción.</p>
              <p className="ayuda">Antes de pagar, lee los <a href="/terminos">términos y condiciones</a>.</p>
            </div>
            <div className="l-garantia">
              <div className="l-sello" aria-hidden><b>7</b><span>días</span></div>
              <div><h3>Reembolso en <em>7 días</em></h3><p>Si el pack no te sirve, escríbenos<ASoporte /> dentro de los 7 días naturales siguientes a tu compra y te devolvemos lo que pagaste. Al reembolsarte se desactiva tu acceso.</p></div>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section className="l-sec l-faq" id="preguntas">
          <div className="l-ancho l-faq-caja">
            <div>
              <div className="cap">Preguntas frecuentes</div>
              <h2>Lo que nos preguntan <em>antes de comprar</em></h2>
            </div>
            <div className="l-acordeon">
              {PREGUNTAS.map(([p, r]) => <details key={p}><summary>{p}</summary><p>{r}</p></details>)}
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section className="l-cierre">
          <div className="l-ancho">
            <h2>Cuando un cliente te busque, que encuentre un perfil <em>activo</em>.</h2>
            <p className="l-lead">Ordena hoy tus próximos 90 días en Instagram, Facebook y WhatsApp.</p>
            <BotonCompra />
          </div>
        </section>
      </main>

      <footer className="l-pie">
        <Marca />
        <DatosProveedor />
        <p><a href="/terminos">Términos y condiciones</a> · <a href="/privacidad">Aviso de privacidad</a> · <a href="/entrar">Ya compré: entrar</a></p>
      </footer>
      <BarraCompra precio={PRECIO} />
    </div>
  );
}
