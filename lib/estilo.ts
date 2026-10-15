// Estilo de los diseños (guía de estilo visual, 2026-10-14): base neutra "de lujo" y el color del asesor solo como acento.
import { contraste, mezclar } from "./colores";

export const NEUTROS = {
  crema: "#F4EFE8",
  arena: "#E4DACC",
  linea: "#D9CFC1",
  /** Líneas y bordes. Para texto sobre fondo claro va topoTexto: 5.6:1 sobre crema, 4.7:1 sobre arena. */
  topo: "#8A7F72",
  topoTexto: "#665D51",
  carbon: "#2B2A28",
  blanco: "#FFFDF9",
};

export const SERIF = "Cormorant";
export const SCRIPT = "Pinyon";
export const SANS = "Montserrat";
export const NUM = "Playfair";

export type Estilo = typeof NEUTROS & {
  /** Palabras en manuscrita, números y detalles sobre fondo claro (se lee: 3:1 o más sobre crema). */
  acento: string;
  /** Texto chico en color sobre fondo claro (4.5:1). */
  acentoTexto: string;
  /** Detalles sobre fondo oscuro o foto: el color del asesor si se lee, si no arena. */
  acentoOscuro: string;
};

/** Oscurece un color hasta que se lea sobre el fondo con el contraste pedido. */
function legible(color: string, fondo: string, minimo: number) {
  let c = color;
  for (let t = 0.1; contraste(c, fondo) < minimo && t <= 1; t += 0.1) c = mezclar(color, NEUTROS.carbon, t);
  return c;
}

export function estilo(principal: string, acento: string): Estilo {
  const { crema, carbon, arena } = NEUTROS;
  // De los dos colores del asesor, el que mejor se lee sobre crema hace de acento.
  const base = contraste(principal, crema) >= contraste(acento, crema) ? principal : acento;
  const otro = base === principal ? acento : principal;
  const sobreOscuro = [otro, base].find((c) => contraste(c, carbon) >= 4.5 && contraste(c, crema) < 3);
  return {
    ...NEUTROS,
    acento: legible(base, crema, 3),
    acentoTexto: legible(base, crema, 4.5),
    acentoOscuro: sobreOscuro ?? arena,
  };
}
