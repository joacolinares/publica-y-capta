// Aviso de privacidad (LFPDPPP). Responsable, domicilio y correo salen de lib/oferta.ts (variables de entorno):
// si falta un dato, la frase se arma sin él. Conviene que lo revise un abogado mexicano antes de lanzar.
import { BarraApp } from "../_web/BarraApp";
import { ASoporte, CorreoSoporte } from "../_web/Contacto";
import { LEGAL_ACTUALIZADO, PIXEL_META, PROVEEDOR, SOPORTE } from "@/lib/oferta";

export const metadata = { title: "Aviso de privacidad" };

export default function Privacidad() {
  const { nombre, domicilio } = PROVEEDOR;
  return (
    <>
    <BarraApp />
    <main className="legal">
      <div className="cap">Publica y Capta</div>
      <h1>Aviso de <em>privacidad</em></h1>
      <p>
        <b>Responsable:</b> {nombre || "Publica y Capta"}{domicilio ? <>, con domicilio en {domicilio},</> : null} es responsable del uso de tus datos personales.
        {SOPORTE ? <> Contacto: <CorreoSoporte />.</> : null}
      </p>
      <h2>Qué datos usamos</h2>
      <p>Tu correo y los datos de tu compra que nos manda Impul Tienda (número de orden, productos, fecha y estado del pago). Lo que llenas en el formulario: nombre, nombre comercial, cómo te presentas, WhatsApp, correo para tus anuncios, domicilio de tu oficina, ciudad, zona y colonias, años de experiencia, especialidad, tipo de cliente, tono, colores, usuario de redes, tu logo y, si la subes, tu foto. También los datos y la foto de las propiedades que cargues y el registro de cada pack que armas. No pedimos datos sensibles.</p>
      <h2>Para qué</h2>
      <p>Para armar tu contenido (publicaciones, diseños y guiones), darte acceso a lo que compraste y atender tus dudas y tus solicitudes de reembolso. También guardamos el registro de tu compra y de tus descargas por si hay una aclaración o un contracargo. Todo esto es necesario para darte el servicio que compraste: no vendemos tus datos{PIXEL_META ? <>, y lo que llenas en el formulario no se usa ni se comparte para publicidad. Para medir nuestros anuncios usamos el píxel de Meta (ver abajo).</> : " ni los usamos o compartimos para publicidad."}</p>
      <h2>Con quién se comparten</h2>
      <p>Con los proveedores que hacen funcionar el servicio, solo para eso: el alojamiento y la base de datos (Google Firebase y Railway), el envío de correos (Resend), la tienda donde pagaste (Impul Tienda), que nos manda los datos de tu compra, y el servicio de inteligencia artificial que adapta el tono de los textos (Anthropic), que recibe tu nombre, ciudad, zona, colonias, especialidad, tipo de cliente y tono.</p>
      {PIXEL_META ? <>
        <h2>Píxel de Meta</h2>
        <p>La página de venta y el pago en Impul Tienda usan el píxel de Meta (Facebook e Instagram), una tecnología de rastreo que registra que visitaste la página, si tocas el botón de compra, si iniciaste o completaste el pago y su monto, y datos técnicos de tu navegador y tu dispositivo. Lo usamos para saber qué anuncios funcionan y para mostrar nuestros anuncios a personas parecidas. Meta trata esos datos según su propia política de privacidad. Puedes evitarlo bloqueando las cookies de terceros en tu navegador o desde la configuración de anuncios de tu cuenta de Meta; la página funciona igual.</p>
      </> : null}
      <h2>Cómo limitar el uso de tus datos</h2>
      <p>Puedes pedirnos que dejemos de usar o que borremos tus datos, tu logo o tu foto escribiéndonos<ASoporte />.</p>
      <h2>Tus derechos (ARCO)</h2>
      <p>Puedes pedir acceder a tus datos, corregirlos, cancelarlos u oponerte a su uso. Escríbenos<ASoporte /> con tu nombre, el correo con el que compraste, qué derecho quieres ejercer y sobre qué datos, y una identificación oficial (o la de tu representante y el documento que lo acredite). Te respondemos en un máximo de 20 días hábiles y, si procede, lo hacemos efectivo dentro de los 15 días hábiles siguientes. Por el mismo medio puedes revocar tu consentimiento.</p>
      <h2>Tu logo y tus fotos</h2>
      <p>Al subirlos confirmas que tienes derecho a usarlos. Solo los usamos para armar tu contenido.</p>
      <h2>Cambios a este aviso</h2>
      <p>Si lo cambiamos, publicamos la versión nueva en esta página con su fecha y, si el cambio es importante, te avisamos por correo.</p>
      <p className="ayuda">Última actualización: {LEGAL_ACTUALIZADO}. Lee también los <a href="/terminos">términos y condiciones</a>.</p>
    </main>
    </>
  );
}
