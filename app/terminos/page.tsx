// Términos y condiciones de la compra. Quién vende y cómo contactarlo salen de lib/oferta.ts (variables de entorno):
// si falta un dato, se omite. Conviene que lo revise un abogado mexicano antes de lanzar.
import { BarraApp } from "../_web/BarraApp";
import { ASoporte, DatosProveedor } from "../_web/Contacto";
import { LEGAL_ACTUALIZADO, PRECIO_MXN, PROVEEDOR, SOPORTE } from "@/lib/oferta";

export const metadata = { title: "Términos y condiciones" };

export default function Terminos() {
  const hayContacto = Boolean(SOPORTE || PROVEEDOR.telefono);
  return (
    <>
    <BarraApp />
    <main className="legal">
      <div className="cap">Publica y Capta</div>
      <h1>Términos y <em>condiciones</em></h1>
      <h2>Quién vende</h2>
      {PROVEEDOR.nombre ? null : <p>Publica y Capta se vende en línea a través de Impul Tienda.</p>}
      <DatosProveedor />
      <h2>Qué compras</h2>
      <p>Un pack digital de contenido para asesores inmobiliarios, armado con tus datos, tu logo y tus colores:</p>
      <ul>
        <li>90 publicaciones con el texto completo</li>
        <li>Calendario de 90 días</li>
        <li>40 diseños con tu logo y tus colores</li>
        <li>30 guiones de reels (15 sin salir a cámara)</li>
        <li>Generador de posts e historias para cada propiedad</li>
        <li>Versión para Instagram, Facebook y WhatsApp</li>
        <li>Guía &quot;Empieza aquí&quot;</li>
        <li>Bonos: Perfil que capta en 1 hora y 20 prompts para tu colonia</li>
      </ul>
      <p>Si al pagar agregas un extra opcional, también entra en tu pack y lo ves en tu panel.</p>
      <h2>Precio y pago</h2>
      <p>${PRECIO_MXN} MXN, pago único en Impul Tienda, sin suscripción. Los extras opcionales se cobran aparte, solo si los eliges.</p>
      <h2>Entrega</h2>
      <p>Al aprobarse el pago te llega un correo con tu acceso. Entras a la app con el mismo correo con el que pagaste, llenas el formulario y armas y descargas tu pack. El link del ZIP vale 7 días; si vence, vuelves a armarlo desde tu panel.</p>
      <h2>Acceso a la app</h2>
      <p>Puedes volver a armar y descargar tu pack durante al menos 12 meses desde tu compra.</p>
      <h2>Uso permitido</h2>
      <p>Puedes publicar los textos y diseños en tus redes, tus anuncios y tu WhatsApp, a tu nombre o al de tu oficina. No puedes revenderlos, regalarlos ni compartir el pack o tu acceso con otros asesores.</p>
      <h2>Reembolso</h2>
      <p>Si el pack no te sirve, escríbenos<ASoporte /> dentro de los 7 días naturales siguientes a tu compra y te devolvemos lo que pagaste. Al reembolsarte se desactiva tu acceso.</p>
      <h2>Resultados</h2>
      <p>El pack no garantiza ventas ni un número de clientes.</p>
      {hayContacto ? (<>
        <h2>Dudas y quejas</h2>
        <p>
          {SOPORTE ? <>Escríbenos<ASoporte />{PROVEEDOR.telefono ? <> o llámanos al {PROVEEDOR.telefono}</> : null}.</> : <>Llámanos al {PROVEEDOR.telefono}.</>}
        </p>
      </>) : null}
      <h2>Tus datos</h2>
      <p>Cómo usamos tus datos está en el <a href="/privacidad">aviso de privacidad</a>.</p>
      <p className="ayuda">Última actualización: {LEGAL_ACTUALIZADO}.</p>
    </main>
    </>
  );
}
