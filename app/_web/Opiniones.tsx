// "Lo que dicen quienes ya lo aplicaron": conversaciones reales de content/opiniones.json.
// Solo van opiniones reales y con permiso de quien las escribió (permiso: true). Nunca inventadas.
// Si no hay ninguna, la sección no se muestra.
import type { ReactNode } from "react";
import datos from "@/content/opiniones.json";

type Mensaje = { de: "cliente" | "nosotros"; texto: string; hora?: string };
type Opinion = { nombre: string; detalle?: string; permiso: boolean; mensajes: Mensaje[] };

const OPINIONES = (datos as Opinion[]).filter((o) => o.permiso === true && o.mensajes?.length);

export function Opiniones({ children }: { children?: ReactNode }) {
  if (!OPINIONES.length) return null;
  return (
    <section className="l-sec l-opiniones" id="opiniones">
      <div className="l-ancho">
        <div className="cap">Opiniones</div>
        <h2>Lo que dicen quienes <em>ya lo aplicaron</em></h2>
        <div className="l-chats">
          {OPINIONES.map((o, i) => (
            <article key={i} className="l-chat">
              <header className="l-chat-cab">
                <span className="l-chat-ini" aria-hidden>{o.nombre.trim().charAt(0)}</span>
                <div><h3>{o.nombre}</h3>{o.detalle && <span>{o.detalle}</span>}</div>
              </header>
              <ol className="l-chat-msjs">
                {o.mensajes.map((m, k) => (
                  <li key={k} className={m.de === "nosotros" ? "nuestro" : undefined}>
                    <span className="l-solo-lector">{m.de === "nosotros" ? "Publica y Capta: " : `${o.nombre}: `}</span>
                    {m.texto}
                    {m.hora && <time>{m.hora}</time>}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        {children && <div className="l-accion">{children}</div>}
      </div>
    </section>
  );
}
