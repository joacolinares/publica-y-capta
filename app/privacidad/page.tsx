// BORRADOR del aviso de privacidad (LFPDPPP). Tiene que revisarlo un abogado mexicano antes de lanzar.
// Completar lo que está entre [corchetes].
import { BarraApp } from "../_web/BarraApp";

export const metadata = { title: "Aviso de privacidad" };

export default function Privacidad() {
  return (
    <>
    <BarraApp />
    <main className="legal">
      <div className="cap">Publica y Capta</div>
      <h1>Aviso de <em>privacidad</em></h1>
      <p><b>Responsable:</b> [Nombre o razón social], con domicilio en [domicilio], es responsable del uso de tus datos personales. Contacto: [correo de privacidad].</p>
      <h2>Qué datos usamos</h2>
      <p>Tu correo, nombre, nombre comercial, teléfono de WhatsApp, domicilio de oficina, ciudad, zona y colonias donde trabajas, tu usuario de redes, tu logo y, si la subes, tu foto. También los datos de las propiedades que cargues.</p>
      <h2>Para qué</h2>
      <p>Solo para armar tu contenido (publicaciones, diseños y guiones), darte acceso a lo que compraste y atender tus dudas. No vendemos ni compartimos tus datos con terceros para publicidad.</p>
      <h2>Con quién se comparten</h2>
      <p>Con los proveedores que hacen funcionar el servicio: alojamiento y base de datos (Google Firebase, Railway), el envío de correos (Resend), la tienda donde pagaste (Impul Tienda) y el servicio de inteligencia artificial que adapta el tono de los textos (Anthropic). Ellos procesan los datos por nuestra cuenta.</p>
      <h2>Tus derechos (ARCO)</h2>
      <p>Puedes pedir acceder, corregir, cancelar u oponerte al uso de tus datos escribiendo a [correo de privacidad]. Te respondemos en un máximo de 20 días hábiles.</p>
      <h2>Tu logo y tus fotos</h2>
      <p>Al subirlos confirmas que tienes derecho a usarlos. Solo los usamos para armar tu contenido.</p>
      <p className="ayuda">Última actualización: [fecha].</p>
    </main>
    </>
  );
}
