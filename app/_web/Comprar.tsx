"use client";
// Botón de compra: lleva al checkout de Impul con los parámetros del anuncio (utm, fbclid) para no perder de dónde vino.
import { useEffect, useState, type ReactNode } from "react";
import { CHECKOUT } from "@/lib/oferta";

function conParametros() {
  const q = new URLSearchParams(location.search);
  if (![...q.keys()].length) return CHECKOUT;
  const u = new URL(CHECKOUT);
  q.forEach((v, k) => u.searchParams.set(k, v));
  return u.toString();
}

export function Comprar({ children, className = "boton", tabIndex }: { children: ReactNode; className?: string; tabIndex?: number }) {
  const [href, setHref] = useState(CHECKOUT);
  useEffect(() => setHref(conParametros()), []);
  return <a className={className} href={href} tabIndex={tabIndex}>{children}</a>;
}

/** Barra fija abajo en el celular, aparece cuando ya bajaste del primer botón. */
export function BarraCompra({ precio }: { precio: string }) {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const f = () => setVer(window.scrollY > 700 && window.innerHeight + window.scrollY < document.body.scrollHeight - 500);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`l-barra-compra${ver ? " ver" : ""}`} aria-hidden={!ver}>
      <div><b>{precio}</b><span>Pago único</span></div>
      {/* Escondida, no se puede llegar con el teclado. */}
      <Comprar className="boton" tabIndex={ver ? undefined : -1}>Quiero mi pack</Comprar>
    </div>
  );
}
