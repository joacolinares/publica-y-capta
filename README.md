# Publica y Capta · app

El asesor paga en Impul Tienda, entra con su correo (link mágico, sin contraseña), llena un formulario y descarga un ZIP (también le llega el link por correo) con 90 publicaciones, calendario, 40 diseños con su marca y guiones. Con "Nueva propiedad" arma el post de cada casa que capta (con el bloque NOM-247 en venta).

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
| Pantallas | `app/page.tsx` (entrar), `app/entrar`, `app/panel`, `app/privacidad` |
| API | `app/api/webhooks/impul`, `acceso`, `perfil`, `generar`, `propiedad` |

## Pack de ejemplo

`muestra/pack-ejemplo-Laura.zip`: lo que recibe una asesora inventada (Laura Gómez, Zapopan) con bump y kit.

## Probar sin cuentas

```bash
npm install
npm run demo -- salida              # ZIP de ejemplo con un asesor inventado
npm run demo:propiedad -- salida    # post de propiedad de ejemplo
```

## Poner en marcha

1. **Firebase:** crear proyecto. Activar Authentication → Correo electrónico → "Vínculo de correo electrónico (acceso sin contraseña)". Agregar el dominio de Railway en Authentication → Configuración → Dominios autorizados. Crear Firestore y Storage. Descargar una cuenta de servicio (JSON).
2. **Reglas de Firestore y Storage:** cerradas para el navegador (todo pasa por el servidor):
   `allow read, write: if false;`
3. **Claude:** crear una clave en console.anthropic.com. Por defecto usa `claude-opus-5-5`; con `CLAUDE_MODEL=claude-haiku-5-5` cuesta bastante menos.
4. **Railway:** conectar el repo, cargar las variables de `.env.example` y desplegar (`railway.json` ya trae build y start).
5. **Resend (correo):** crear cuenta en resend.com, verificar tu dominio y crear una API key. Cargar `RESEND_API_KEY`, `CORREO_REMITENTE` (por ejemplo `Publica y Capta <hola@tudominio.com>`) y `APP_URL` (la URL de Railway). Sin dominio verificado, Resend solo entrega a tu propio correo: sirve para probar.
6. **Impul:** en el panel, Webhooks → URL `https://TU-DOMINIO/api/webhooks/impul`, eventos `order.approved`, `order.refunded`, `order.chargeback`. Copiar el secreto a `IMPULTIENDA_WEBHOOK_SECRET`. Crear una API key (`itd_...`) para el respaldo. Poner los ids de producto del bump y el upsell en `IMPUL_PRODUCTO_BUMP` y `IMPUL_PRODUCTO_UPSELL`. Entrega del producto: "Link externo" a `https://TU-DOMINIO`.

## Colecciones

- `compras/{correo}`: productos vigentes (`pack`, `bump`, `upsell`) y órdenes. Un reembolso o contracargo los apaga.
- `perfiles/{uid}`: el formulario. Logo y foto en Storage `usuarios/{uid}/logo|foto`.
- `webhooks/{id}`: entregas ya procesadas (Impul puede reenviar).
- `generaciones`: registro de cada ZIP armado (sirve como prueba de entrega en una disputa).

## Contenido

Fuente de verdad: `/mnt/project-files/proyecto/fase4/pack/` del proyecto. Se copia a `content/` y se corre `npm run textos`:
`textos-90-dias.md` (90 días, 20 guiones), `guiones-extra.md` (10), `bonos.md` (2), `bump-whatsapp.md` (50 respuestas), `upsell-captacion.md` (kit). El bump y el upsell entran al ZIP solo si la compra los incluye.

## Pendiente

- Confirmar en el panel de Impul la firma y la API (se leyeron del código de su sitio).
- Aviso de privacidad en `app/privacidad`: borrador, completar y revisar con un abogado mexicano.
- Revisión técnica de un asesor mexicano (`revision-tecnica.md` + dudas del bump y del kit).
- Compra de prueba completa con Firebase y Impul reales.
