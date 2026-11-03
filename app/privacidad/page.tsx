// Aviso de privacidad (LFPDPPP). Responsable, domicilio y correo salen de lib/oferta.ts (variables de entorno):
// si falta un dato, la frase se arma sin él. Conviene que lo revise un abogado mexicano antes de lanzar.
// Lo de Meta va siempre, aunque NEXT_PUBLIC_META_PIXEL_ID esté vacío: Impul Tienda le manda las compras a Meta
// desde su propia configuración, sin pasar por esta página.
import { BarraApp } from "../_web/BarraApp";
import { ASoporte, CorreoSoporte } from "../_web/Contacto";
import { PRIVACIDAD_ACTUALIZADO, PROVEEDOR, SOPORTE } from "@/lib/oferta";

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
      <p>Tu correo y los datos de tu compra que nos manda Impul Tienda (número de orden, productos, fecha y estado del pago). Lo que llenas en el formulario: nombre, nombre comercial, cómo te presentas, WhatsApp, correo para tus anuncios, domicilio de tu oficina, ciudad, zona y colonias, años de experiencia, especialidad, tipo de cliente, tono, colores, usuario de redes, tu logo y, si la subes, tu foto. También los datos y la foto de las propiedades que cargues y el registro de cada pack que armas. Lo que registra Meta cuando visitas la página y cuando pagas te lo explicamos en «Meta y nuestros anuncios». No pedimos datos sensibles.</p>
      <h2>Para qué</h2>
      <p>Para armar tu contenido (publicaciones, diseños y guiones), darte acceso a lo que compraste y atender tus dudas y tus solicitudes de reembolso. También guardamos el registro de tu compra y de tus descargas por si hay una aclaración o un contracargo. Todo esto es necesario para darte el servicio que compraste: no vendemos tus datos, y lo que llenas en el formulario de tu pack no se usa ni se comparte para publicidad.</p>
      <p>Además, para medir nuestros anuncios y mostrarlos a ti o a personas parecidas a ti, usamos el píxel de Meta y algunos datos que das al pagar en Impul Tienda (ver «Meta y nuestros anuncios»). Esto no es necesario para darte el servicio: si no quieres que usemos tus datos para esto, escríbenos<ASoporte />. Negarte no cambia tu compra ni tu acceso. Si no te opones, entendemos que estás de acuerdo.</p>
      <h2>Con quién se comparten</h2>
      <p>Con los proveedores que hacen funcionar el servicio, solo para eso: el alojamiento y la base de datos (Google Firebase y Railway), el envío de correos (Resend), la tienda donde pagaste (Impul Tienda), que nos manda los datos de tu compra, y el servicio de inteligencia artificial que adapta el tono de los textos (Anthropic), que recibe tu nombre, ciudad, zona, colonias, especialidad, tipo de cliente y tono. Aparte, compartimos datos con Meta (Facebook e Instagram) para medir nuestros anuncios y mostrarlos a ti o a personas parecidas a ti. Meta no es un proveedor del servicio: también usa esos datos para sus propios fines, según su política de privacidad (te lo explicamos abajo).</p>
      <h2>Meta y nuestros anuncios</h2>
      <p>La página de venta y el pago en Impul Tienda usan el píxel de Meta (Facebook e Instagram), una tecnología de rastreo. Registra que visitaste la página, si tocaste el botón de compra, si iniciaste o completaste el pago y su monto, y datos técnicos de tu navegador y tu dispositivo.</p>
      {/* Lo que Impul manda a Meta según el panel del conjunto de datos (3 nov 2026). Si agrega el teléfono, súmalo aquí y cambia PRIVACIDAD_ACTUALIZADO. */}
      <p>Cuando pagas, Impul Tienda también le manda a Meta, por encargo nuestro, tu compra y su monto, con tu correo, tu nombre, tu ciudad, tu estado y tu país. Además van tu IP, datos de tu navegador, un código de cliente de la tienda y las cookies de Meta que conectan la compra con el anuncio que viste. Con eso, Meta puede reconocerte y saber si compraste después de ver uno de nuestros anuncios.</p>
      <p>Usamos todo esto para saber qué anuncios funcionan y para mostrar nuestros anuncios a ti o a personas parecidas a ti. Meta trata esos datos según su propia política de privacidad. Para que el píxel no mande nada desde tu navegador, usa un bloqueador de rastreadores o de anuncios; la página funciona igual. Eso no frena lo que Impul Tienda manda al pagar. Para que Meta no conecte esta actividad con tu cuenta, entra al Centro de cuentas de Facebook o Instagram y, en tu actividad fuera de las tecnologías de Meta, desconéctala. También puedes escribirnos<ASoporte /> para que no usemos tus datos en nuestros anuncios.</p>
      <h2>Cómo limitar el uso de tus datos</h2>
      <p>Puedes pedirnos que dejemos de usar o que borremos tus datos, tu logo o tu foto escribiéndonos<ASoporte />.</p>
      <h2>Tus derechos (ARCO)</h2>
      <p>Puedes pedir acceder a tus datos, corregirlos, cancelarlos u oponerte a su uso. Escríbenos<ASoporte /> con tu nombre, el correo con el que compraste, qué derecho quieres ejercer y sobre qué datos, y una identificación oficial (o la de tu representante y el documento que lo acredite). Te respondemos en un máximo de 20 días hábiles y, si procede, lo hacemos efectivo dentro de los 15 días hábiles siguientes. Por el mismo medio puedes revocar tu consentimiento.</p>
      <h2>Tu logo y tus fotos</h2>
      <p>Al subirlos confirmas que tienes derecho a usarlos. Solo los usamos para armar tu contenido.</p>
      <h2>Cambios a este aviso</h2>
      <p>Si lo cambiamos, publicamos la versión nueva en esta página con su fecha y, si el cambio es importante, te avisamos por correo.</p>
      <p className="ayuda">Última actualización: {PRIVACIDAD_ACTUALIZADO}. Lee también los <a href="/terminos">términos y condiciones</a>.</p>
    </main>
    </>
  );
}
