"use client";
// Entrar: el asesor escribe el correo con el que pagó y recibe un link para entrar, sin contraseña.
// Solo se manda a correos con compra. La misma página termina el acceso cuando abre el link del correo.
import { useEffect, useState } from "react";
import { isSignInWithEmailLink, onAuthStateChanged, sendSignInLinkToEmail, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/cliente";
import { BarraApp } from "../_web/BarraApp";
import { CorreoSoporte } from "../_web/Contacto";
import { SOPORTE } from "@/lib/oferta";

type Modo = "cargando" | "pedir" | "enviado" | "entrando" | "confirmar";
const ESPERA = 60;

function mensajeDeError(code: string) {
  if (code === "auth/admin-restricted-operation" || code === "auth/user-not-found") return "No encontramos una compra con este correo. Entra con el mismo correo que usaste al pagar.";
  if (code === "auth/invalid-email") return "Ese correo no coincide con el del link. Escribe el mismo correo al que te llegó.";
  return "Este link ya se usó o venció. Pide uno nuevo aquí abajo.";
}

export default function Entrar() {
  const [modo, setModo] = useState<Modo>("cargando");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");
  const [reciente, setReciente] = useState(false);
  const [faltan, setFaltan] = useState(0);

  async function completar(correo: string) {
    setModo("entrando"); setError("");
    try {
      await signInWithEmailLink(auth(), correo, location.href);
      localStorage.removeItem("correo");
      location.replace("/panel");
    } catch (e) {
      setError(mensajeDeError((e as { code?: string }).code ?? ""));
      history.replaceState(null, "", "/entrar");
      setModo("pedir");
    }
  }

  useEffect(() => {
    if (isSignInWithEmailLink(auth(), location.href)) {
      let guardado: string | null = null;
      try { guardado = localStorage.getItem("correo"); } catch {}
      if (guardado) completar(guardado); else setModo("confirmar");
      return;
    }
    // Si ya tiene la sesión abierta, directo al panel.
    return onAuthStateChanged(auth(), (u) => { if (u) location.replace("/panel"); else setModo("pedir"); });
  }, []);

  useEffect(() => {
    if (faltan <= 0) return;
    const t = setTimeout(() => setFaltan((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [faltan]);

  async function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    const correo = email.trim();
    setError(""); setEnviando(true);
    try {
      // Con correo propio configurado, el servidor manda el link con la marca; si no, lo manda Firebase.
      const r = (await fetch("/api/enlace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: correo }) }).then((x) => x.json()).catch(() => null)) as { modo?: string } | null;
      const modo = r?.modo;
      if (modo === "sin-compra") {
        setModo("pedir");
        setError(<>No encontramos una compra con <b>{correo}</b>. Escribe el mismo correo con el que pagaste; si acabas de pagar, espera unos minutos y vuelve a intentarlo. ¿Todavía no tienes tu pack? <a href="/">Consíguelo aquí</a>.{SOPORTE ? <> Si ya pagaste y no te deja, escríbenos a <CorreoSoporte />.</> : null}</>);
      } else if (modo === "invalido") {
        setError("Revisa el correo: parece que le falta algo o tiene un error.");
      } else if (modo === "limite") {
        setError("Hiciste muchos intentos seguidos. Espera un rato y vuelve a intentarlo con el correo con el que pagaste.");
      } else if (modo === "propio" || modo === "firebase" || modo === "espera") {
        if (modo === "firebase") await sendSignInLinkToEmail(auth(), correo, { url: `${location.origin}/entrar`, handleCodeInApp: true });
        try { localStorage.setItem("correo", correo); } catch {}
        setReciente(modo === "espera");
        setModo("enviado"); setFaltan(ESPERA);
      } else {
        throw new Error();
      }
    } catch {
      setModo("pedir");
      setError("No pudimos mandar el correo. Revisa que esté bien escrito e intenta de nuevo.");
    }
    setEnviando(false);
  }

  return (
    <div className="entrar">
      <div className="lado-img" aria-hidden><img src="/web/entrar.webp" alt="" /></div>
      <div className="lado-form">
        <BarraApp />
        <div className="caja">
          {modo === "cargando" || modo === "entrando" ? (
            <div className="cargando">
              <div className="punto" />
              <div className="cap">{modo === "entrando" ? "Entrando a tu cuenta" : "Un momento"}</div>
            </div>
          ) : modo === "enviado" ? (
            <>
              <div className="sobre" aria-hidden>
                <svg width="30" height="22" viewBox="0 0 30 22"><rect x="0.7" y="0.7" width="28.6" height="20.6" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M1 1l14 11L29 1" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
              </div>
              <h1>Revisa tu <em>correo</em></h1>
              <p className="subtitulo">{reciente ? "Ya te mandamos un link hace un momento" : "Te mandamos un link"} para entrar a <b>{email.trim()}</b>. Ábrelo desde este mismo celular o compu.</p>
              <ul className="lista-check">
                <li>Si no lo ves en unos minutos, busca en spam o promociones.</li>
                <li>El link sirve una sola vez. Si lo abres después de mucho tiempo, pide otro.</li>
                <li>Tiene que ser el mismo correo con el que pagaste.</li>
              </ul>
              <button className="sec" type="button" style={{ width: "100%", marginTop: 12 }} disabled={faltan > 0 || enviando} onClick={() => enviar()}>
                {faltan > 0 ? `Volver a mandar en ${faltan} s` : enviando ? "Enviando..." : "Volver a mandar el link"}
              </button>
              <p className="ayuda" style={{ marginTop: 18 }}><a href="#" onClick={(e) => { e.preventDefault(); setModo("pedir"); }}>Usar otro correo</a></p>
            </>
          ) : modo === "confirmar" ? (
            <>
              <div className="cap">Un paso más</div>
              <h1>Confirma tu <em>correo</em></h1>
              <p className="subtitulo">Abriste el link en otro navegador o dispositivo. Escribe el correo al que te llegó para entrar.</p>
              <form onSubmit={(e) => { e.preventDefault(); completar(email.trim()); }}>
                <label htmlFor="email">Tu correo</label>
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" style={{ marginTop: 22 }}>Entrar</button>
              </form>
            </>
          ) : (
            <>
              <div className="cap">Tu pack de 90 días</div>
              <h1>Entra a tu <em>pack</em></h1>
              <p className="subtitulo">Escribe el correo con el que compraste y te mandamos un link para entrar. No necesitas contraseña.</p>
              <form onSubmit={enviar}>
                <label htmlFor="email">Tu correo</label>
                <input id="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="El mismo que usaste al pagar" />
                <button type="submit" disabled={enviando} style={{ marginTop: 22 }}>{enviando ? "Enviando..." : "Mandarme el link"}</button>
                {error && <div className="error" role="alert">{error}</div>}
              </form>
              <p className="ayuda" style={{ marginTop: 26 }}>¿Todavía no tienes tu pack? <a href="/" style={{ whiteSpace: "nowrap" }}>Conoce Publica y Capta</a>.</p>
            </>
          )}
        </div>
        <p className="pie-app">{SOPORTE ? <>¿Dudas? <CorreoSoporte /> · </> : null}<a href="/privacidad">Aviso de privacidad</a></p>
      </div>
    </div>
  );
}
