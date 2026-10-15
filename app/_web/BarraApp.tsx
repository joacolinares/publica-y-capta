// Barra de arriba de la app (entrar, panel, privacidad): la marca y, si hace falta, una acción a la derecha.
import type { ReactNode } from "react";

export function BarraApp({ children }: { children?: ReactNode }) {
  return (
    <header className="barra-app">
      <a className="marca" href="/" aria-label="Publica y Capta, inicio"><span className="monograma">P<i>y</i>C</span><b>Publica y Capta</b></a>
      {children}
    </header>
  );
}
