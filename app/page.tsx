"use client";
// Entrada: el asesor escribe el correo con el que pagó y recibe un link para entrar, sin contraseña.
import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/cliente";

export default function Inicio() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"" | "enviando" | "enviado">("");
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setEstado("enviando");
    try {
      await sendSignInLinkToEmail(auth(), email.trim(), { url: `${location.origin}/entrar`, handleCodeInApp: true });
      localStorage.setItem("correo", email.trim());
      setEstado("enviado");
    } catch {
      setEstado(""); setError("No pudimos mandar el correo. Revisa que esté bien escrito.");
    }
  }

  return (
    <main>
      <h1>Publica y Capta</h1>
      <p>Llenas un formulario y en minutos descargas 90 días de contenido con tu logo, tus colores y tus datos.</p>
      {estado === "enviado" ? (
        <div className="ok">Listo. Te mandamos un link a <b>{email}</b>. Ábrelo desde este mismo celular o compu. Si no lo ves, revisa spam o promociones.</div>
      ) : (
        <form onSubmit={enviar}>
          <label htmlFor="email">Tu correo</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="el mismo que usaste al pagar" />
          <button disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando..." : "Mandarme el link para entrar"}</button>
          {error && <div className="error">{error}</div>}
        </form>
      )}
      <p className="ayuda" style={{ marginTop: 24 }}>Usa el mismo correo con el que compraste. No necesitas contraseña.</p>
    </main>
  );
}
