// Datos de contacto y de quién vende, para la página de venta, la app y las páginas legales.
// Salen de lib/oferta.ts (variables de entorno): lo que no esté configurado no se muestra.
import { Fragment } from "react";
import { PROVEEDOR, SOPORTE } from "@/lib/oferta";

/** Link al correo de soporte, o nada si no está configurado. */
export function CorreoSoporte() {
  return SOPORTE ? <a href={`mailto:${SOPORTE}`}>{SOPORTE}</a> : null;
}

/** " a correo@…" para frases como "Escríbenos a…": vacío si no hay correo. */
export function ASoporte() {
  return SOPORTE ? <> a <CorreoSoporte /></> : null;
}

/** Párrafo con quién vende, domicilio, teléfono y correo, separados por " · ". Sin ningún dato, nada. */
export function DatosProveedor({ marca = true, className }: { marca?: boolean; className?: string }) {
  const partes = [
    PROVEEDOR.nombre && (marca ? <>Publica y Capta es un producto de {PROVEEDOR.nombre}</> : PROVEEDOR.nombre),
    PROVEEDOR.domicilio,
    PROVEEDOR.telefono && <span style={{ whiteSpace: "nowrap" }}>Tel. <a href={`tel:${PROVEEDOR.telefono.replace(/[^\d+]/g, "")}`}>{PROVEEDOR.telefono}</a></span>,
    SOPORTE && <CorreoSoporte />,
  ].filter(Boolean);
  if (!partes.length) return null;
  return <p className={className}>{partes.map((x, i) => <Fragment key={i}>{i ? " · " : null}{x}</Fragment>)}</p>;
}
