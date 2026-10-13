"use client";
// Panel del asesor: 1) su marca (formulario), 2) descargar el pack, 3) nueva propiedad.
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { achicar, api, auth, coloresDeLogo } from "@/lib/cliente";
import type { Perfil } from "@/lib/perfil";

type Productos = { pack: boolean; bump: boolean; upsell: boolean };
type Pestana = "marca" | "descargar" | "propiedad";

const VACIO: Perfil = {
  nombre: "", nombreComercial: "", whatsapp: "", correo: "", domicilio: "", ciudad: "", zona: "", colonias: [""],
  colorPrincipal: "#1F3A5F", colorAcento: "#E8A33D", especialidad: "ambas", cliente: "familias", tono: "cercano",
  genero: "neutro", aniosExperiencia: "", historia: "", usuarioRedes: "",
};

export default function Panel() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [productos, setProductos] = useState<Productos | null>(null);
  const [perfil, setPerfil] = useState<Perfil>(VACIO);
  const [guardado, setGuardado] = useState(false);
  const [pestana, setPestana] = useState<Pestana>("marca");

  useEffect(() => onAuthStateChanged(auth(), async (u) => {
    if (!u) { location.replace("/"); return; }
    try {
      const j = await (await api("/api/acceso")).json();
      setProductos(j.productos);
      if (j.perfil) { setPerfil({ ...VACIO, ...j.perfil }); setGuardado(true); setPestana("descargar"); }
      else setPerfil((p) => ({ ...p, correo: u.email ?? "" }));
    } catch (e) { setError((e as Error).message); }
    setCargando(false);
  }), []);

  if (cargando) return <main><p>Cargando...</p></main>;
  if (error) return <main><h1>Publica y Capta</h1><div className="error">{error}</div><button className="sec" onClick={() => signOut(auth()).then(() => location.replace("/"))}>Entrar con otro correo</button></main>;

  return (
    <main>
      <h1>Hola{perfil.nombre ? `, ${perfil.nombre.split(" ")[0]}` : ""}</h1>
      <div className="tabs">
        <button className={pestana === "marca" ? "activa" : ""} onClick={() => setPestana("marca")}>1. Tu marca</button>
        <button className={pestana === "descargar" ? "activa" : ""} onClick={() => setPestana("descargar")} disabled={!guardado}>2. Descargar</button>
        <button className={pestana === "propiedad" ? "activa" : ""} onClick={() => setPestana("propiedad")} disabled={!guardado}>Nueva propiedad</button>
      </div>
      {pestana === "marca" && <Formulario inicial={perfil} onGuardado={(p) => { setPerfil(p); setGuardado(true); setPestana("descargar"); }} />}
      {pestana === "descargar" && productos && <Descargar productos={productos} />}
      {pestana === "propiedad" && <NuevaPropiedad />}
    </main>
  );
}

function Formulario({ inicial, onGuardado }: { inicial: Perfil; onGuardado: (p: Perfil) => void }) {
  const [p, setP] = useState<Perfil>(inicial);
  const [logo, setLogo] = useState<string>();
  const [foto, setFoto] = useState<string>();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Perfil>(k: K, v: Perfil[K]) => setP((x) => ({ ...x, [k]: v }));

  async function subirLogo(f?: File) {
    if (!f) return;
    try {
      const d = await achicar(f, 800, "image/png");
      setLogo(d);
      const c = await coloresDeLogo(d);
      if (c) setP((x) => ({ ...x, colorPrincipal: c[0], colorAcento: c[1] }));
    } catch (e) { setError((e as Error).message); }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setEnviando(true);
    const limpio = { ...p, colonias: p.colonias.map((c) => c.trim()).filter(Boolean) };
    try {
      await api("/api/perfil", { method: "PUT", body: JSON.stringify({ perfil: limpio, logo, foto }) });
      onGuardado(limpio);
    } catch (e) { setError((e as Error).message); }
    setEnviando(false);
  }

  return (
    <form onSubmit={guardar}>
      <p className="ayuda">Esto tarda unos 5 minutos. Todo lo que escribas aparece en tus publicaciones y diseños.</p>

      <h2>Tus datos</h2>
      <label>Tu nombre</label>
      <input type="text" required minLength={2} value={p.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Laura Gómez" />
      <label>Nombre comercial (opcional)</label>
      <input type="text" value={p.nombreComercial} onChange={(e) => set("nombreComercial", e.target.value)} placeholder="Laura Gómez Bienes Raíces" />
      <label>¿Cómo te presentas?</label>
      <div className="opciones">
        {([["a", "Asesora"], ["o", "Asesor"], ["neutro", "Prefiero no decir"]] as const).map(([v, t]) => (
          <label key={v}><input type="radio" name="genero" checked={p.genero === v} onChange={() => set("genero", v)} />{t}</label>
        ))}
      </div>
      <div className="fila">
        <div><label>WhatsApp</label><input type="tel" required minLength={8} value={p.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="33 1234 5678" /></div>
        <div><label>Años de experiencia</label><input type="text" value={p.aniosExperiencia} onChange={(e) => set("aniosExperiencia", e.target.value)} placeholder="8" /></div>
      </div>
      <label>Correo para tus anuncios</label>
      <input type="email" required value={p.correo} onChange={(e) => set("correo", e.target.value)} />
      <label>Domicilio de tu oficina</label>
      <input type="text" required minLength={5} value={p.domicilio} onChange={(e) => set("domicilio", e.target.value)} placeholder="Av. Patria 1234, Zapopan, Jal." />
      <p className="ayuda">La NOM-247 pide tu nombre, domicilio, teléfono y correo en los anuncios de casas en venta. Por eso van en esos diseños.</p>
      <label>Tu usuario de Instagram o Facebook (opcional)</label>
      <input type="text" value={p.usuarioRedes} onChange={(e) => set("usuarioRedes", e.target.value)} placeholder="@laura.bienesraices" />

      <h2>Tu zona</h2>
      <div className="fila">
        <div><label>Ciudad</label><input type="text" required value={p.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Zapopan" /></div>
        <div><label>Zona</label><input type="text" required value={p.zona} onChange={(e) => set("zona", e.target.value)} placeholder="Zona Poniente" /></div>
      </div>
      <label>Hasta 3 colonias donde trabajas</label>
      {[0, 1, 2].map((i) => (
        <input key={i} type="text" style={{ marginTop: i ? 8 : 0 }} required={i === 0} value={p.colonias[i] ?? ""} placeholder={["Ciudad Granja", "Jardines Universidad", "Puerta de Hierro"][i]}
          onChange={(e) => { const c = [...p.colonias]; c[i] = e.target.value; set("colonias", c); }} />
      ))}

      <h2>Tu trabajo</h2>
      <label>¿Qué haces más?</label>
      <div className="opciones">
        {([["venta", "Venta"], ["renta", "Renta"], ["ambas", "Las dos"]] as const).map(([v, t]) => (
          <label key={v}><input type="radio" name="esp" checked={p.especialidad === v} onChange={() => set("especialidad", v)} />{t}</label>
        ))}
      </div>
      <label>Tu cliente principal</label>
      <select value={p.cliente} onChange={(e) => set("cliente", e.target.value as Perfil["cliente"])}>
        <option value="primera_casa">Gente que compra su primera casa</option>
        <option value="familias">Familias que buscan una casa más grande</option>
        <option value="inversionistas">Inversionistas</option>
        <option value="mixto">De todo un poco</option>
      </select>
      <label>¿Cómo le hablas a tus clientes?</label>
      <div className="opciones">
        {([["cercano", "Cercano"], ["formal", "Formal"]] as const).map(([v, t]) => (
          <label key={v}><input type="radio" name="tono" checked={p.tono === v} onChange={() => set("tono", v)} />{t}</label>
        ))}
      </div>

      <h2>Tu imagen</h2>
      <label>Tu logo (PNG o JPG)</label>
      <input type="file" accept="image/png,image/jpeg" onChange={(e) => subirLogo(e.target.files?.[0])} />
      <p className="ayuda">Si no tienes logo, ponemos tu nombre con letras. Al subirlo sacamos tus colores de ahí.</p>
      {logo && <img className="vista" src={logo} alt="Tu logo" style={{ maxHeight: 120, marginTop: 10, background: "#fff" }} />}
      <div className="fila">
        <div><label>Color principal</label><div className="color"><input type="color" value={p.colorPrincipal} onChange={(e) => set("colorPrincipal", e.target.value.toUpperCase())} /><span>{p.colorPrincipal}</span></div></div>
        <div><label>Color de acento</label><div className="color"><input type="color" value={p.colorAcento} onChange={(e) => set("colorAcento", e.target.value.toUpperCase())} /><span>{p.colorAcento}</span></div></div>
      </div>
      <label>Una foto tuya (opcional)</label>
      <input type="file" accept="image/png,image/jpeg" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setFoto(await achicar(f, 1200, "image/jpeg")); }} />
      <p className="ayuda">Va en los posts de "Conóceme". Si no subes, usamos tus iniciales.</p>

      <p className="ayuda" style={{ marginTop: 22 }}>Al guardar confirmas que tienes derecho a usar este logo y esta foto. Usamos tus datos solo para armar tu contenido. Ver el <a href="/privacidad">aviso de privacidad</a>.</p>
      <button disabled={enviando}>{enviando ? "Guardando..." : "Guardar y seguir"}</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

function Descargar({ productos }: { productos: Productos }) {
  const [estado, setEstado] = useState<"" | "armando" | "listo">("");
  const [error, setError] = useState("");

  const [correo, setCorreo] = useState(false);
  const [url, setUrl] = useState("");

  async function generar() {
    setError(""); setEstado("armando");
    try {
      const j = await (await api("/api/generar", { method: "POST" })).json();
      setCorreo(Boolean(j.correo));
      setUrl(j.url);
      const a = document.createElement("a");
      a.href = j.url; a.rel = "noopener"; a.click();
      setEstado("listo");
    } catch (e) { setError((e as Error).message); setEstado(""); }
  }

  return (
    <div>
      <div className="tarjeta">
        <b>Tu pack de 90 días</b>
        <p className="ayuda">90 publicaciones con tu nombre y tu zona, calendario, 40 diseños con tu logo y tus colores, y guiones de reels.</p>
        {productos.pack ? (
          <button onClick={generar} disabled={estado === "armando"}>{estado === "armando" ? "Armando tu pack, tarda 1 o 2 minutos..." : "Armar y descargar mi pack"}</button>
        ) : <p className="ayuda">Tu compra no incluye el pack.</p>}
        {estado === "listo" && <><div className="ok">Listo. Abre el archivo descargado y empieza por <b>00 EMPIEZA AQUI</b>.{correo ? " También te mandamos el link a tu correo." : ""} Si cambias tus datos, vuelve a armarlo.</div><a className="boton" href={url}>Si no bajó solo, toca aquí</a></>}
        {error && <div className="error">{error}</div>}
      </div>
      {productos.bump && <div className="tarjeta"><b>Del mensaje a la visita</b><p className="ayuda">50 respuestas de WhatsApp. Vienen dentro de tu pack.</p></div>}
      {productos.upsell && <div className="tarjeta"><b>Kit Captación Exclusiva</b><p className="ayuda">Viene dentro de tu pack, con tu marca: presentación para dueños, opinión de valor, guion de exclusiva, checklist de documentos y 10 publicaciones.</p></div>}
    </div>
  );
}

const CARACT = ["", "", ""];

function NuevaPropiedad() {
  const [x, setX] = useState({ operacion: "venta", etiqueta: "Recién captada", tipo: "Casa", colonia: "", recamaras: "", banos: "", m2: "", precio: "", caracteristicas: CARACT, creditos: [] as string[], foto: "" });
  const [res, setRes] = useState<{ imagen: string; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const set = (k: keyof typeof x, v: unknown) => setX((p) => ({ ...p, [k]: v }));

  async function armar(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setEnviando(true); setRes(null);
    try {
      const cuerpo = { ...x, caracteristicas: x.caracteristicas.map((c) => c.trim()).filter(Boolean), foto: x.foto || undefined, creditos: x.operacion === "venta" ? x.creditos : [] };
      setRes(await (await api("/api/propiedad", { method: "POST", body: JSON.stringify(cuerpo) })).json());
    } catch (e) { setError((e as Error).message); }
    setEnviando(false);
  }

  return (
    <form onSubmit={armar}>
      <p className="ayuda">Cada vez que captes una casa, llena esto y te armamos el diseño y el texto con tus datos.</p>
      <label>Operación</label>
      <div className="opciones">
        {["venta", "renta"].map((v) => <label key={v}><input type="radio" name="op" checked={x.operacion === v} onChange={() => set("operacion", v)} />{v === "venta" ? "Venta" : "Renta"}</label>)}
      </div>
      <div className="fila">
        <div><label>Tipo</label><select value={x.tipo} onChange={(e) => set("tipo", e.target.value)}>{["Casa", "Departamento", "Terreno", "Local"].map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label>Etiqueta</label><select value={x.etiqueta} onChange={(e) => set("etiqueta", e.target.value)}>{["Recién captada", "Nueva en mi zona", "Precio actualizado", "Vendida", "Rentada"].map((t) => <option key={t}>{t}</option>)}</select></div>
      </div>
      <label>Colonia</label>
      <input type="text" required value={x.colonia} onChange={(e) => set("colonia", e.target.value)} />
      <div className="fila">
        <div><label>Recámaras</label><input type="text" inputMode="numeric" value={x.recamaras} onChange={(e) => set("recamaras", e.target.value)} /></div>
        <div><label>Baños</label><input type="text" inputMode="decimal" value={x.banos} onChange={(e) => set("banos", e.target.value)} /></div>
        <div><label>m²</label><input type="text" inputMode="numeric" value={x.m2} onChange={(e) => set("m2", e.target.value)} /></div>
      </div>
      <label>Precio en pesos{x.operacion === "renta" ? " (al mes)" : ""}</label>
      <input type="text" inputMode="numeric" required value={x.precio} onChange={(e) => set("precio", e.target.value.replace(/[^\d.,]/g, ""))} placeholder="2,450,000" />
      <label>3 cosas que destacan (opcional)</label>
      {x.caracteristicas.map((c, i) => (
        <input key={i} type="text" style={{ marginTop: i ? 8 : 0 }} value={c} placeholder={["Cocina integral", "2 lugares de estacionamiento", "A 5 minutos del parque"][i]}
          onChange={(e) => { const v = [...x.caracteristicas]; v[i] = e.target.value; set("caracteristicas", v); }} />
      ))}
      {x.operacion === "venta" && (<>
        <label>Créditos que acepta</label>
        <div className="opciones">
          {["bancario", "Infonavit", "Fovissste"].map((c) => (
            <label key={c}><input type="checkbox" checked={x.creditos.includes(c)} onChange={(e) => set("creditos", e.target.checked ? [...x.creditos, c] : x.creditos.filter((y) => y !== c))} />{c === "bancario" ? "Bancario" : c}</label>
          ))}
        </div>
      </>)}
      <label>Foto principal</label>
      <input type="file" accept="image/png,image/jpeg" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set("foto", await achicar(f, 1400, "image/jpeg")); }} />
      <button disabled={enviando}>{enviando ? "Armando..." : "Armar mi publicación"}</button>
      {error && <div className="error">{error}</div>}
      {res && (
        <div style={{ marginTop: 20 }}>
          <img className="vista" src={res.imagen} alt="Diseño de la propiedad" />
          <a className="boton" href={res.imagen} download={`Propiedad ${x.colonia}.png`}>Descargar diseño</a>
          <pre className="texto">{res.texto}</pre>
          <button type="button" className="sec" onClick={() => navigator.clipboard.writeText(res.texto).then(() => setCopiado(true))}>{copiado ? "Texto copiado" : "Copiar texto"}</button>
          {x.operacion === "venta" && <p className="ayuda">Este anuncio ya trae tu nombre, domicilio, teléfono, correo y el precio en pesos, como pide la NOM-247.</p>}
        </div>
      )}
    </form>
  );
}
