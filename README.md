# Publica y Capta · app

El asesor paga en Impul Tienda, entra con su correo (link mágico, sin contraseña), llena un formulario y descarga un ZIP (si hay Resend, también le llega el link por correo) con 90 publicaciones, calendario, 40 diseños con su marca y guiones. Con "Nueva propiedad" arma el post de cada casa que capta (con el bloque NOM-247 en venta).

## Cómo está armada

| Parte | Dónde |
|---|---|
| Textos base (90 días) | `content/textos-90-dias.md` → `npm run textos` → `content/textos.json` |
| Reemplazo de datos y chequeo de palabras prohibidas | `lib/personalizar.ts` |
| Adaptación de tono con Claude (solo días no técnicos, se descarta si rompe reglas) | `lib/ia.ts` |
| 40 diseños (JSX → PNG con satori + resvg) | `lib/disenos.tsx`, `lib/render.ts`, `fonts/` |
| Post de propiedad | `lib/propiedad.tsx` |
| ZIP | `lib/paquete.ts` |
| Firebase servidor (compras, perfiles, imágenes, sesión) | `lib/servidor.ts` |
| Impul (firma del webhook y búsqueda de órdenes de respaldo) | `lib/impul.ts` |
| Correos (Resend) | `lib/correo.ts` |
| Pantallas | `app/page.tsx` (página de venta), `app/entrar`, `app/panel`, `app/privacidad`, `app/terminos` |
| Precio, checkout, vendedor y soporte | `lib/oferta.ts` (variables `NEXT_PUBLIC_` de `.env.example`) |
| API | `app/api/webhooks/impul`, `acceso`, `perfil`, `generar`, `propiedad` |

## Pack de ejemplo

`muestra/pack-ejemplo-Laura.zip`: lo que recibe una asesora inventada (Laura Gómez, Zapopan) con bump y kit.

## Probar sin cuentas

```bash
npm install
npm run demo -- salida              # ZIP de ejemplo con un asesor inventado
npm run demo:propiedad -- salida    # post de propiedad de ejemplo
```

## Prueba completa sin cuentas

`npm run prueba` levanta los emuladores de Firebase (necesita Java 11+), simula los webhooks de Impul y prueba: firma del webhook, acceso solo con el link, intento de robo de cuenta, perfil, generación (y que no se pueda generar dos veces a la vez), descarga, "Nueva propiedad", reembolso y compra nueva.

## Poner en marcha

1. **Firebase:** crear proyecto. Activar Authentication → Correo electrónico → "Vínculo de correo electrónico (acceso sin contraseña)". Agregar el dominio de Railway en Authentication → Configuración → Dominios autorizados. En Authentication → Plantillas, poner el idioma en español; en Configuración del proyecto, el "nombre público" en "Publica y Capta". La app solo acepta sesiones con el correo verificado por el link, y crea la cuenta del comprador apenas llega el pago (si alguien se había registrado con ese correo, esa cuenta se borra). Como protección extra, en Authentication → Configuración → Acciones del usuario, desactiva "Habilitar creación (registro)". Crear Firestore y Storage. Descargar una cuenta de servicio (JSON).
2. **Reglas de Firestore y Storage:** cerradas para el navegador (todo pasa por el servidor):
   `allow read, write: if false;`
3. **Claude:** crear una clave en console.anthropic.com. Por defecto usa `claude-opus-5-5`; con `CLAUDE_MODEL=claude-haiku-5-5` cuesta bastante menos.
4. **Railway:** conectar el repo con "Add variables" (no "Deploy Now"), cargar las variables de `.env.example` y desplegar. `NEXT_PUBLIC_CHECKOUT_URL` (el link del checkout de tu producto en Impul) tiene que estar cargada antes del primer despliegue: si no, los botones de compra no llevan a tu tienda. Lo mismo con `NEXT_PUBLIC_CORREO_SOPORTE` y los datos del vendedor (`NEXT_PUBLIC_PROVEEDOR_NOMBRE`, `_DOMICILIO`, `_TELEFONO`): la LFPC pide mostrarlos antes de la compra y salen en la página, el aviso de privacidad y los términos. Las `NEXT_PUBLIC_` se fijan al construir: si cambias una, vuelve a desplegar. Los servicios nuevos de Railway ya no leen `railway.json`: en Settings poner Builder = Railpack, Custom Start Command = `npm start` y Healthcheck Path = `/`.
5. **Resend (correo):** crear cuenta en resend.com, verificar tu dominio y crear una API key. Cargar `RESEND_API_KEY`, `CORREO_REMITENTE` (por ejemplo `Publica y Capta <hola@tudominio.com>`) y `APP_URL` (con `https://` y sin barra final; usa tu dominio, el mismo que verificaste en Resend, para que los correos no muestren el de Railway). Carga también `CORREO_RESPUESTAS`: es donde te llegan las respuestas y las solicitudes de reembolso. Sin dominio verificado, Resend solo entrega a tu propio correo: sirve para probar.
6. **Impul:** en el panel, Webhooks → URL `https://TU-DOMINIO/api/webhooks/impul`, eventos `order.approved`, `order.refunded`, `order.chargeback`. Los webhooks son solo del plan Max. Copiar la "Clave de firma" a `IMPULTIENDA_WEBHOOK_SECRET`. Impul todavía no tiene API pública, así que `IMPULTIENDA_API_KEY` queda vacío. Poner los ids de producto del pack, el bump y el upsell en `IMPUL_PRODUCTO_PACK`, `IMPUL_PRODUCTO_BUMP` y `IMPUL_PRODUCTO_UPSELL` (con `IMPUL_PRODUCTO_PACK` cargado, un producto desconocido no da acceso). Entrega del producto: "Link externo" a `https://TU-DOMINIO/entrar` (no a la raíz: ahí está la página de venta). En la tienda, pon el checkout en español y la moneda en MXN con el mismo precio de `NEXT_PUBLIC_PRECIO_MXN`, y cambia las insignias de "garantía" por "Reembolso en 7 días".

## Colecciones

- `compras/{correo}`: productos vigentes (`pack`, `bump`, `upsell`) y órdenes. Un reembolso o contracargo los apaga y es definitivo para esa orden.
- `busquedas/{correo}`: última consulta de respaldo a la API de Impul (una cada 10 minutos por correo).
- `limites/{uid}`: una generación a la vez y hasta 10 por día.
- `perfiles/{uid}`: el formulario. Logo y foto en Storage `usuarios/{uid}/logo|foto`.
- `adaptaciones/{uid}`: los textos que ya adaptó la IA para ese perfil. Si el perfil no cambia, volver a armar el pack no llama a la IA (`llamadasIA` en `generaciones` dice cuántas llamadas hizo cada armado).
- `webhooks/{id}`: entregas ya procesadas (Impul puede reenviar).
- `generaciones`: registro de cada ZIP armado (sirve como prueba de entrega en una disputa).

## Contenido

Fuente de verdad: `/mnt/project-files/proyecto/fase4/pack/` del proyecto. Se copia a `content/` y se corre `npm run textos`:
`textos-90-dias.md` (90 días, 20 guiones), `guiones-extra.md` (10), `bonos.md` (2), `bump-whatsapp.md` (50 respuestas), `upsell-captacion.md` (kit). El bump y el upsell entran al ZIP solo si la compra los incluye.

## Pendiente

- Confirmar en el panel de Impul la firma y la API (se leyeron del código de su sitio).
- Aviso de privacidad (`app/privacidad`) y términos (`app/terminos`): cargar los datos del vendedor y revisarlos con un abogado mexicano. El plazo de acceso de 12 meses de los términos lo confirma Joaquín.
- Compra de prueba con tarjeta mexicana: lo cobrado tiene que ser exactamente el precio en MXN de la página.
- Volver a armar las imágenes de `public/web` con `scripts/imagenes-web.tsx` (la marca de ejemplo ya usa datos ficticios).
- Revisión técnica de un asesor mexicano (`revision-tecnica.md` + dudas del bump y del kit).
- Compra de prueba completa con Firebase y Impul reales.
