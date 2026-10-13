"use client";
// Destino del link mágico: termina el acceso y lleva al panel.
import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/cliente";

export default function Entrar() {
  const [pedirCorreo, setPedirCorreo] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function completar(correo: string) {
    try {
      await signInWithEmailLink(auth(), correo, location.href);
      localStorage.removeItem("correo");
      location.replace("/panel");
    } catch {
      setError("Este link ya se usó o venció. Vuelve a pedir uno.");
    }
  }

  useEffect(() => {
    if (!isSignInWithEmailLink(auth(), location.href)) { location.replace("/"); return; }
    const guardado = localStorage.getItem("correo");
    if (guardado) completar(guardado); else setPedirCorreo(true);
  }, []);

  return (
    <main>
      <h1>Entrando...</h1>
      {pedirCorreo && !error && (
        <form onSubmit={(e) => { e.preventDefault(); completar(email.trim()); }}>
          <p>Abriste el link en otro dispositivo. Confirma tu correo para entrar.</p>
          <label htmlFor="email">Tu correo</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button>Entrar</button>
        </form>
      )}
      {error && <><div className="error">{error}</div><a className="boton" href="/">Pedir otro link</a></>}
    </main>
  );
}
