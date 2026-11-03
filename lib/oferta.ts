// Lo que la página de venta promete y cobra. Si cambia el producto o el precio en Impul, se cambia aquí.
// Las NEXT_PUBLIC_ se fijan al construir: cárgalas antes de desplegar (ver .env.example).
export const PRECIO_MXN = process.env.NEXT_PUBLIC_PRECIO_MXN || "279";
// Respaldo: no lo dejes vacío (Comprar.tsx arma una URL con él). Cámbialo por el link del producto en cuanto lo tengas.
export const CHECKOUT = process.env.NEXT_PUBLIC_CHECKOUT_URL || "https://publica-y-capta.impultienda.ar/checkout";
export const SOPORTE = (process.env.NEXT_PUBLIC_CORREO_SOPORTE || "").trim();
// ID del píxel de Meta (el mismo que cargas en Impul). Vacío: la página de venta no mide nada, pero Impul sigue
// mandando las compras a Meta si lo tienes configurado allá (por eso el aviso de privacidad habla de Meta siempre).
export const PIXEL_META = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();

/** Quién vende (la LFPC pide mostrarlo antes de la compra). El dato que falte no se muestra. */
export const PROVEEDOR = {
  nombre: (process.env.NEXT_PUBLIC_PROVEEDOR_NOMBRE || "").trim(),
  domicilio: (process.env.NEXT_PUBLIC_PROVEEDOR_DOMICILIO || "").trim(),
  telefono: (process.env.NEXT_PUBLIC_PROVEEDOR_TELEFONO || "").trim(),
};

/** Fecha de la última versión de los términos. */
export const LEGAL_ACTUALIZADO = "19 de octubre de 2026";
/** Fecha de la última versión del aviso de privacidad. */
export const PRIVACIDAD_ACTUALIZADO = "3 de noviembre de 2026";
