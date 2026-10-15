// Lo que la página de venta promete y cobra. Si cambia el producto o el precio en Impul, se cambia aquí.
// Las NEXT_PUBLIC_ se fijan al construir: cárgalas antes de desplegar (ver .env.example).
export const PRECIO_MXN = process.env.NEXT_PUBLIC_PRECIO_MXN || "279";
// Respaldo: no lo dejes vacío (Comprar.tsx arma una URL con él). Cámbialo por el link del producto en cuanto lo tengas.
export const CHECKOUT = process.env.NEXT_PUBLIC_CHECKOUT_URL || "https://publica-y-capta.impultienda.ar/checkout";
export const SOPORTE = (process.env.NEXT_PUBLIC_CORREO_SOPORTE || "").trim();

/** Quién vende (la LFPC pide mostrarlo antes de la compra). El dato que falte no se muestra. */
export const PROVEEDOR = {
  nombre: (process.env.NEXT_PUBLIC_PROVEEDOR_NOMBRE || "").trim(),
  domicilio: (process.env.NEXT_PUBLIC_PROVEEDOR_DOMICILIO || "").trim(),
  telefono: (process.env.NEXT_PUBLIC_PROVEEDOR_TELEFONO || "").trim(),
};

/** Fecha de la última versión del aviso de privacidad y de los términos. */
export const LEGAL_ACTUALIZADO = "15 de octubre de 2026";
