// Página de venta. El botón lleva al checkout de Impul; quien ya compró entra desde "Entrar".
// Regla: la página promete solo lo que trae el pack (90 publicaciones, 40 diseños, 30 guiones). Sin testimonios,
// números ni urgencia inventados. Las imágenes son diseños reales del pack armados con una marca de ejemplo.
import type { Metadata } from "next";
import { BarraCompra, Comprar } from "./_web/Comprar";
import { ASoporte, DatosProveedor } from "./_web/Contacto";
import { PRECIO_MXN, SOPORTE } from "@/lib/oferta";
import "./landing.css";

export const metadata: Metadata = {
  title: "Publica y Capta · 90 días de contenido para asesores inmobiliarios",
  description: "90 publicaciones con el texto completo, 40 diseños con tu logo y tus colores y 30 guiones de reels para Instagram, Facebook y WhatsApp. Pago único.",
};

const PRECIO = `$${PRECIO_MXN} MXN`;

const DOLORES = [
  "Abres Canva, eliges una plantilla bonita y te quedas en blanco con el texto.",
  "Solo publicas cuando tienes una propiedad nueva, y tu perfil pasa semanas sin moverse.",
  "Un cliente te busca en Instagram antes de llamarte y lo último que ve es de hace un mes.",
  "Entre visitas, llamadas y trámites, el contenido siempre queda para mañana.",
  "Las plantillas gratis se ven igual que las de todos los asesores de tu zona.",
];

const INCLUYE: [string, string, string][] = [
  ["90", "publicaciones con el texto completo", "Gancho, desarrollo, llamada a la acción y hashtags, con tus datos ya puestos donde van. Cada una con su versión para estados de WhatsApp."],
  ["90", "días de calendario", "Qué publicar cada día, mezclando compradores, vendedores, rentas y tu marca personal."],
  ["40", "diseños con tu logo y tus colores", "23 carruseles completos, 11 posts y 6 historias, listos para subir."],
  ["30", "guiones de reels", "Toma por toma, con 3 ganchos para elegir, la portada y el texto para publicar. La mitad, sin salir a cámara."],
  ["1", "generador para tus propiedades", "Captas una casa, cargas precio, recámaras, m², colonia y una foto, y te arma el post y la historia con tu marca."],
  ["2", "bonos para arrancar", "Perfil que capta en 1 hora y 20 prompts para adaptar cualquier texto a tu colonia."],
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

const PASOS: [string, string][] = [
  ["Haces tu pago", "Pago único y seguro. No es una suscripción."],
  ["Llenas un formulario", "Entras con tu correo, sin contraseña, y pones tu logo, tus colores, tu zona y tus datos. Toma unos 5 minutos."],
  ["Descargas todo con tu marca", "En minutos tienes tus 90 días de contenido. Copias el texto del día, subes el diseño, tu foto o tu reel, según el día, y publicas."],
];

const PREGUNTAS: [string, string][] = [
  ["¿Necesito Canva o saber de diseño?", "No. Llenas un formulario y te entregamos los diseños listos, con tu nombre, tu logo y tus colores."],
  ["¿Los diseños se pueden editar?", "Vienen como imágenes listas para subir. Si cambias un dato, lo corriges en la app y vuelves a descargar todo actualizado."],
  ["¿Sirve para Facebook y WhatsApp?", "Sí. Cada publicación sirve para Instagram y Facebook, y trae su versión corta para tus estados de WhatsApp."],
  ["¿Tengo que salir en video?", "No. La mitad de los guiones son sin salir a cámara: texto en pantalla o voz en off."],
  ["¿Por qué no lo hago con ChatGPT?", "Puedes, pero tendrías que escribir y revisar 90 textos y armar los diseños. Aquí ya están escritos para el cliente mexicano, y además te regalamos 20 prompts para adaptarlos a tu colonia."],
  ["¿Cómo recibo el pack?", "Al terminar el pago te llega un correo con el acceso. Entras con el mismo correo, llenas el formulario y descargas todo. Si no ves el correo, revisa spam o promociones."],
  ["¿Es una suscripción?", "No. Pagas una sola vez y el pack es tuyo."],
  ["¿Sirve si trabajo en una inmobiliaria o franquicia?", "Sí. Los textos hablan de comprar, vender y rentar, y los diseños llevan tu logo o el de tu oficina."],
  ["¿Sirve para cualquier ciudad de México?", "Sí. Los textos no dependen de una ciudad: el formulario pone tu zona y tus colonias."],
  ["¿Y si no me sirve?", `Escríbenos${SOPORTE ? ` a ${SOPORTE}` : ""} dentro de los 7 días naturales siguientes a tu compra y te devolvemos lo que pagaste. Al reembolsarte se desactiva tu acceso.`],
];

const EJEMPLO = `¿Tu casa lleva meses publicada y nadie llama? Casi siempre es por una de estas 3 razones 👇

1. El precio. Si está arriba de lo que se vendió hace poco en tu colonia, los compradores la comparan y siguen de largo.
2. Las fotos. Fotos oscuras, chuecas o con la casa desordenada hacen que la gente ni siquiera abra el anuncio.
3. Los papeles. Si un comprador pregunta por la escritura o el predial y no hay respuesta clara, se enfría.

La buena noticia: las tres se pueden corregir. A veces basta con ajustar una sola para que vuelvan las llamadas.

¿Quieres que revisemos tu anuncio juntos? Mándame la palabra VENTA y lo vemos sin compromiso.

#vendermicasa #bienesraices #asesorinmobiliario`;

function Marca() {
  return <a className="marca" href="/" aria-label="Publica y Capta, inicio"><span className="monograma">P<i>y</i>C</span><b>Publica y Capta</b></a>;
}

export default function Inicio() {
  return (
    <div className="l">
      <header className="l-barra">
        <Marca />
        <nav aria-label="Secciones">
          <a href="#incluye">Qué incluye</a>
          <a href="#como">Cómo funciona</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <div className="l-barra-acciones">
          <a className="l-entrar" href="/entrar">Entrar</a>
          <Comprar className="boton l-solo-compu">Comprar</Comprar>
        </div>
      </header>

      <main>
        {/* Portada */}
        <section className="l-hero">
          <div className="l-hero-texto">
            <div className="cap">Para asesores inmobiliarios en México</div>
            <h1>Publica todos los días <em>sin pensar</em> qué escribir.</h1>
            <p className="l-lead">90 días de contenido para Instagram, Facebook y WhatsApp: el texto completo de cada publicación y los diseños con tu logo, tus colores y tus datos. Llenas un formulario y en minutos lo descargas.</p>
            <div className="l-cta">
              <Comprar className="boton">Quiero mi pack · {PRECIO} <span className="flecha" aria-hidden /></Comprar>
              <p className="ayuda">Pago único, sin suscripción. No necesitas Canva ni saber de diseño.</p>
            </div>
            <ul className="l-sellos" aria-label="Incluye">
              <li>Tu logo</li><li>Tus colores</li><li>Reembolso en 7 días</li>
            </ul>
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
          <div><b>3</b><span>redes: Instagram, Facebook y WhatsApp</span></div>
        </section>

        {/* Dolores */}
        <section className="l-sec l-dolores">
          <div className="l-ancho">
            <div className="cap">¿Te suena?</div>
            <h2>Sabes que tienes que publicar. <em>El problema es qué.</em></h2>
            <ol className="l-lista-num">
              {DOLORES.map((d, i) => <li key={i}><span>{String(i + 1).padStart(2, "0")}</span>{d}</li>)}
            </ol>
          </div>
        </section>

        {/* Así se ve */}
        <section className="l-sec l-muestras" id="muestras">
          <div className="l-ancho">
            <div className="cap">Así se ve por dentro</div>
            <h2>Diseños que se ven de revista, <em>con tu marca.</em></h2>
            <p className="l-lead">Base neutra y elegante, y tu color como acento. Carruseles para enseñar, posts para tu marca e historias con espacio para la encuesta o la caja de preguntas.</p>
          </div>
          {/* En compu la tira corre sola (la segunda vuelta es copia, para que no se corte); en celular se desliza con el dedo. */}
          <div className="l-carrusel">
            <div className="l-pista" role="list">
              {[...MUESTRAS, ...MUESTRAS].map(([n, alt], k) => (
                <img key={k} role={k < MUESTRAS.length ? "listitem" : undefined} aria-hidden={k >= MUESTRAS.length || undefined} src={`/web/muestra-${n}.webp`} width={540} height={n === 5 || n === 8 ? 960 : 675} alt={k < MUESTRAS.length ? alt : ""} loading="lazy"
                  className={[n === 5 || n === 8 ? "alta" : "", k >= MUESTRAS.length ? "l-copia" : ""].filter(Boolean).join(" ") || undefined} />
              ))}
            </div>
          </div>
          <p className="ayuda l-ancho">Diseños reales del pack con una marca de ejemplo. Los tuyos salen con tu nombre, tu logo, tus colores y tu WhatsApp.</p>

          <div className="l-ejemplo l-ancho">
            <div className="l-ejemplo-txt">
              <div className="cap">Y el texto, completo</div>
              <h3>No es una idea suelta: es lo que <em>copias y pegas</em>.</h3>
              <p>Cada día trae el texto entero, con gancho, desarrollo, la palabra para que te escriban y los hashtags. Así se ve el del día 9:</p>
            </div>
            <div className="l-post">
              <div className="l-post-cab"><span className="monograma">LG</span><div><b>laura.ejemplo</b><span>Zapopan</span></div></div>
              <img src="/web/muestra-post.webp" width={540} height={675} alt="Diseño del día 9 con una marca de ejemplo" loading="lazy" />
              <p className="l-post-texto">{EJEMPLO}</p>
            </div>
          </div>
        </section>

        {/* Qué incluye */}
        <section className="l-sec l-incluye" id="incluye">
          <div className="l-ancho">
            <div className="cap">Qué incluye</div>
            <h2>Todo lo que <em>recibes</em></h2>
            <div className="l-grilla">
              {INCLUYE.map(([n, t, d]) => (
                <article key={t} className="l-item"><b>{n}</b><h3>{t}</h3><p>{d}</p></article>
              ))}
            </div>
          </div>
        </section>

        {/* Diferencia */}
        <section className="l-sec l-dif">
          <div className="l-ancho">
            <div className="cap">La diferencia</div>
            <h2>Una plantilla te da el diseño. <em>Aquí ya viene con el texto y tu marca.</em></h2>
            <div className="l-dos">
              <div className="l-col"><h3>Plantilla gratis</h3>
                <ul className="l-x"><li>Un diseño con texto de muestra que tienes que cambiar uno por uno.</li><li>Textos genéricos, muchas veces en inglés o de España.</li><li>Tú decides qué publicar cada día.</li></ul>
              </div>
              <div className="l-col l-col-nuestra"><h3>Publica y Capta</h3>
                <ul className="lista-check"><li>Diseños ya hechos con tu logo, tus colores y tu teléfono.</li><li>El texto completo de cada publicación, escrito para el cliente mexicano.</li><li>Un calendario que te dice qué subir cada día.</li><li>Temas que tu cliente sí pregunta: Infonavit, enganche, escrituración, predial.</li></ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="l-sec l-como" id="como">
          <div className="l-ancho">
            <div className="cap">Cómo funciona</div>
            <h2>De la compra a tu primera publicación <em>en un rato</em></h2>
            <ol className="l-pasos">
              {PASOS.map(([t, d], i) => <li key={t}><span className="l-paso-n">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}
            </ol>
            <img className="l-perfil" src="/web/perfil.webp" width={1080} height={1347} alt="Así se ve un perfil con los diseños del pack, con una marca de ejemplo" loading="lazy" />
          </div>
        </section>

        {/* Para quién */}
        <section className="l-sec l-quien">
          <div className="l-ancho">
            <div className="cap">Para quién es</div>
            <h2>Para el asesor que trabaja solo <em>o en una oficina chica</em></h2>
            <div className="l-dos">
              <ul className="lista-check"><li>Asesores independientes que manejan su propio Instagram.</li><li>Asesores de inmobiliaria que tienen que publicar por su cuenta.</li><li>Quien empieza en bienes raíces y quiere verse profesional desde el día 1.</li></ul>
              <ul className="l-x"><li>No es para ti si buscas que alguien maneje tus redes por ti.</li><li>No es un curso de anuncios pagados.</li><li>No promete ventas: te ahorra el tiempo de crear contenido para que te vean constante.</li></ul>
            </div>
          </div>
        </section>

        {/* Precio */}
        <section className="l-sec l-precio" id="precio">
          <div className="l-ancho l-precio-caja">
            <div className="tarjeta oscura l-oferta">
              <div className="cap">Publica y Capta</div>
              <h3>Tus 90 días de contenido, <em>con tu marca</em></h3>
              <ul className="lista-check">
                <li>90 publicaciones con el texto completo</li>
                <li>Calendario de 90 días</li>
                <li>40 diseños con tu logo y tus colores</li>
                <li>30 guiones de reels (15 sin salir a cámara)</li>
                <li>Generador de posts e historias para cada propiedad</li>
                <li>Versión para Instagram, Facebook y WhatsApp</li>
                <li>Guía &quot;Empieza aquí&quot;</li>
                <li>Bonos: Perfil que capta en 1 hora y 20 prompts para tu colonia</li>
              </ul>
              <div className="l-monto"><span className="serif">{PRECIO}</span><span className="cap">Pago único</span></div>
              <Comprar className="boton ancho">Quiero mi pack <span className="flecha" aria-hidden /></Comprar>
              <p className="ayuda">Precio en pesos mexicanos. Pago único, sin suscripción: ordena tus próximos 3 meses de contenido.</p>
              <p className="ayuda">Antes de pagar, lee los <a href="/terminos">términos y condiciones</a>.</p>
            </div>
            <div className="l-garantia">
              <div className="l-sello"><b>7</b><span>días</span></div>
              <div><h3>Reembolso en <em>7 días</em></h3><p>Si el pack no te sirve, escríbenos<ASoporte /> dentro de los 7 días naturales siguientes a tu compra y te devolvemos lo que pagaste. Al reembolsarte se desactiva tu acceso.</p></div>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section className="l-sec l-faq" id="preguntas">
          <div className="l-ancho">
            <div className="cap">Preguntas frecuentes</div>
            <h2>Lo que nos preguntan <em>antes de comprar</em></h2>
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
            <Comprar className="boton">Quiero mi pack · {PRECIO} <span className="flecha" aria-hidden /></Comprar>
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
