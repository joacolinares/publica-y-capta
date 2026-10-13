// Paleta derivada de los 2 colores del asesor, con contraste verificado (WCAG).
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

function luminancia(h: string) {
  const [r, g, b] = hex(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function mezclar(a: string, b: string, t: number) {
  const A = hex(a), B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}

const OSCURO = "#14201E";
const CLARO = "#FFFFFF";

/** Texto legible sobre un fondo: blanco u oscuro, el que contraste más. */
export const textoSobre = (fondo: string) => (contraste(fondo, CLARO) >= contraste(fondo, OSCURO) ? CLARO : OSCURO);

export type Paleta = {
  principal: string; acento: string; fondo: string; suave: string;
  tinta: string; gris: string; sobrePrincipal: string; sobreAcento: string; acentoLegible: string;
};

export function paleta(principal: string, acento: string): Paleta {
  const fondo = mezclar(principal, "#FFFFFF", 0.94);
  const suave = mezclar(principal, "#FFFFFF", 0.85);
  // El acento como texto sobre fondo claro: oscurecerlo hasta que se lea (4.5:1).
  let acentoLegible = acento;
  for (let t = 0; contraste(acentoLegible, fondo) < 4.5 && t <= 1; t += 0.1) acentoLegible = mezclar(acento, OSCURO, t);
  if (contraste(acentoLegible, fondo) < 4.5) acentoLegible = principal;
  return {
    principal, acento, fondo, suave,
    tinta: OSCURO, gris: "#55625F",
    sobrePrincipal: textoSobre(principal),
    sobreAcento: textoSobre(acento),
    acentoLegible,
  };
}
