"use client";
// Panel del asesor: 1) su marca (formulario), 2) descargar el pack, 3) nueva propiedad.
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { achicar, api, auth, coloresDeLogo, tieneFondo } from "@/lib/cliente";
import type { Perfil } from "@/lib/perfil";
import { BarraApp } from "../_web/BarraApp";
import { CorreoSoporte } from "../_web/Contacto";
import { PROVEEDOR, SOPORTE } from "@/lib/oferta";

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
    if (!u) { location.replace("/entrar"); return; }
    try {
      const j = await (await api("/api/acceso")).json();
      setProductos(j.productos);
      if (j.perfil) { setPerfil({ ...VACIO, ...j.perfil }); setGuardado(true); setPestana("descargar"); }
      else setPerfil((p) => ({ ...p, correo: u.email ?? "" }));
    } catch (e) { setError((e as Error).message); }
    setCargando(false);
  }), []);

  const salir = () => signOut(auth()).then(() => location.replace("/entrar"));
  const barra = <BarraApp><button className="salir" type="button" onClick={salir}>Salir</button></BarraApp>;
  if (cargando) return <>{barra}<main className="app"><div className="cargando"><div className="punto" /><div className="cap">Abriendo tu panel</div></div></main></>;
  if (error) return <>{barra}<main className="app"><div className="cap">Tu acceso</div><h1>Algo no <em>cuadra</em></h1><div className="error">{error}</div><button style={{ width: "100%", marginTop: 20 }} onClick={() => location.reload()}>Intentar de nuevo</button><button className="sec" style={{ width: "100%", marginTop: 12 }} onClick={salir}>Entrar con otro correo</button></main></>;

  const nombre = perfil.nombre.trim().split(/\s+/)[0];
  const SUB: Record<Pestana, string> = {
    marca: "Llena tus datos una vez. Todo lo que escribas aparece en tus publicaciones y diseños.",
    descargar: "Tu pack de 90 días con tu nombre, tu logo y tus colores.",
    propiedad: "Cada vez que captes una casa, arma aquí su post y su historia.",
  };
  const tabs: [Pestana, string, string][] = [["marca", "1", "Tu marca"], ["descargar", "2", "Tu pack"], ["propiedad", "3", "Propiedades"]];

  return (
    <>
      {barra}
      <main className="app">
        <div className="cap">Tu panel</div>
        <h1>Hola{nombre ? <>, <em>{nombre}</em></> : null}.</h1>
        <p className="subtitulo">{SUB[pestana]}</p>
        <div className="tabs" role="tablist">
          {tabs.map(([k, n, t]) => (
            <button key={k} role="tab" aria-selected={pestana === k} className={pestana === k ? "activa" : ""} onClick={() => setPestana(k)} disabled={k !== "marca" && !guardado}>
              <span className="num">{n}</span>{t}
            </button>
          ))}
        </div>
        {pestana === "marca" && <Formulario inicial={perfil} onGuardado={(p) => { setPerfil(p); setGuardado(true); setPestana("descargar"); }} />}
        {pestana === "descargar" && productos && <Descargar productos={productos} />}
        {pestana === "propiedad" && <NuevaPropiedad />}
      </main>
      <p className="pie-app">{SOPORTE ? <>¿Dudas? <CorreoSoporte /> · </> : null}<a href="/privacidad">Aviso de privacidad</a></p>
    </>
  );
}

function Formulario({ inicial, onGuardado }: { inicial: Perfil; onGuardado: (p: Perfil) => void }) {
  const [p, setP] = useState<Perfil>(inicial);
  const [logo, setLogo] = useState<string>();
  const [foto, setFoto] = useState<string>();
  const [conFondo, setConFondo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Perfil>(k: K, v: Perfil[K]) => setP((x) => ({ ...x, [k]: v }));

  async function subirLogo(f?: File) {
    if (!f) return;
    try {
      const d = await achicar(f, 800, "image/png");
      setLogo(d);
      setConFondo(await tieneFondo(d));
      const c = await coloresDeLogo(d);
      if (c) setP((x) => ({ ...x, colorPrincipal: c[0], colorAcento: c[1] }));
    } catch (e) { setError((e as Error).message); }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setEnviando(true);
    const limpio = { ...p, nombre: p.nombre.trim(), colonias: p.colonias.map((c) => c.trim()).filter(Boolean) };
    try {
      await api("/api/perfil", { method: "PUT", body: JSON.stringify({ perfil: limpio, logo, foto }) });
      onGuardado(limpio);
    } catch (e) { setError((e as Error).message); }
    setEnviando(false);
  }

  return (
    <form onSubmit={guardar}>
      <p className="ayuda" style={{ marginTop: 18 }}>Toma unos 5 minutos. Puedes cambiarlo cuando quieras y volver a armar tu pack.</p>

      <div className="seccion-form" style={{ marginTop: 26 }}>
      <h2>Tus <em>datos</em></h2>
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
        <div><label>WhatsApp</label><input type="tel" required minLength={8} value={p.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="33 0000 0000" /></div>
        <div><label>Años de experiencia</label><input type="text" inputMode="numeric" value={p.aniosExperiencia} onChange={(e) => set("aniosExperiencia", e.target.value)} placeholder="8" /></div>
      </div>
      <label>Correo para tus anuncios</label>
      <input type="email" required value={p.correo} onChange={(e) => set("correo", e.target.value)} />
      <label>Domicilio de tu oficina</label>
      <input type="text" required minLength={5} value={p.domicilio} onChange={(e) => set("domicilio", e.target.value)} placeholder="Av. Ejemplo 100, Zapopan, Jal." />
      <p className="ayuda">La NOM-247 pide tu nombre, domicilio, teléfono y correo en los anuncios de casas en venta. Por eso van en esos diseños.</p>
      <label>Tu usuario de Instagram o Facebook (opcional)</label>
      <input type="text" value={p.usuarioRedes} onChange={(e) => set("usuarioRedes", e.target.value)} placeholder="@laura.ejemplo" />

      </div>
      <div className="seccion-form">
      <h2>Tu <em>zona</em></h2>
      <div className="fila">
        <div><label>Ciudad</label><input type="text" required value={p.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Zapopan" /></div>
        <div><label>Zona</label><input type="text" required value={p.zona} onChange={(e) => set("zona", e.target.value)} placeholder="Zona Poniente" /></div>
      </div>
      <label>Hasta 3 colonias donde trabajas</label>
      {[0, 1, 2].map((i) => (
        <input key={i} type="text" style={{ marginTop: i ? 8 : 0 }} required={i === 0} value={p.colonias[i] ?? ""} placeholder={["Ciudad Granja", "Jardines Universidad", "Puerta de Hierro"][i]}
          onChange={(e) => { const c = [...p.colonias]; c[i] = e.target.value; set("colonias", c); }} />
      ))}

      </div>
      <div className="seccion-form">
      <h2>Tu <em>trabajo</em></h2>
      <label>¿Qué haces más?</label>
      <div className="opciones">
        {([["venta", "Venta"], ["renta", "Renta"], ["ambas", "Las dos"]] as const).map(([v, t]) => (
          <label key={v}><input type="radio" name="esp" checked={p.especialidad === v} onChange={() => set("especialidad", v)} />{t}</label>
        ))}
      </div>
      <label>Tu cliente principal</label>
      <select value={p.cliente} onChange={(e) => set("cliente", e.target.value as Perfil["cliente"])}>
        <option value="primera_casa">Gente que compra su primera casa</option>
        <option value="familias">Familias que buscan más espacio</option>
        <option value="inversionistas">Inversionistas</option>
        <option value="mixto">De todo un poco</option>
      </select>
      <label>¿Cómo le hablas a tus clientes?</label>
      <div className="opciones">
        {([["cercano", "Cercano"], ["formal", "Formal"]] as const).map(([v, t]) => (
          <label key={v}><input type="radio" name="tono" checked={p.tono === v} onChange={() => set("tono", v)} />{t}</label>
        ))}
      </div>

      </div>
      <div className="seccion-form">
      <h2>Tu <em>imagen</em></h2>
      <label>Tu logo, sin fondo (PNG transparente)</label>
      <Archivo texto="Elegir logo" onElegir={subirLogo} />
      <p className="ayuda">Súbelo <b>sin fondo</b>: un PNG transparente, no con fondo blanco ni de color. Así se ve limpio sobre cada diseño. Si no tienes logo, ponemos tus iniciales en un monograma. Al subirlo tomamos tus colores de ahí.</p>
      {logo && <img className="vista" src={logo} alt="Tu logo" style={{ maxHeight: 120, marginTop: 10, background: "var(--crema)" }} />}
      {logo && conFondo && <div className="error" role="alert">Parece que tu logo tiene fondo y se va a ver como un recuadro en los diseños. Quítale el fondo (por ejemplo, gratis en remove.bg) y súbelo de nuevo en PNG.</div>}
      <p className="ayuda" style={{ marginTop: 14 }}>Los diseños usan una base crema y neutra, y tu color como acento (títulos, líneas y botones). Así se ven elegantes con cualquier color.</p>
      <div className="fila">
        <div><label>Color principal</label><div className="color"><input type="color" value={p.colorPrincipal} onChange={(e) => set("colorPrincipal", e.target.value.toUpperCase())} /><span>{p.colorPrincipal}</span></div></div>
        <div><label>Color de acento</label><div className="color"><input type="color" value={p.colorAcento} onChange={(e) => set("colorAcento", e.target.value.toUpperCase())} /><span>{p.colorAcento}</span></div></div>
      </div>
      <label>Una foto tuya (opcional)</label>
      <Archivo texto="Elegir foto" onElegir={async (f) => { try { setFoto(await achicar(f, 1200, "image/jpeg")); } catch (err) { setError((err as Error).message); } }} />
      <p className="ayuda">Va en el post de &quot;Conóceme&quot; y en las 2 historias de preguntas. Si no subes una, el post lleva tus iniciales y las historias, una foto de ambiente.</p>
      {foto && <img className="vista" src={foto} alt="Tu foto" style={{ maxHeight: 160, marginTop: 10 }} />}
      </div>

      <p className="ayuda" style={{ marginTop: 22 }}>
        Al guardar confirmas que tienes derecho a usar este logo y esta foto. {PROVEEDOR.nombre ? `${PROVEEDOR.nombre} usa` : "Usamos"} estos datos para armar tu contenido y darte acceso a tu compra.
        {SOPORTE ? <> Puedes pedir que los borremos escribiendo a <CorreoSoporte />.</> : " Puedes pedir que los borremos cuando quieras."} Lee el <a href="/privacidad">aviso de privacidad</a>.
      </p>
      <button type="submit" disabled={enviando} style={{ marginTop: 18 }}>{enviando ? "Guardando..." : "Guardar y seguir"}</button>
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
    <div style={{ marginTop: 22 }}>
      <div className="tarjeta oscura">
        <div className="cap" style={{ color: "var(--arena)" }}>Publica y Capta</div>
        <h3>Tu pack de <em>90 días</em></h3>
        <ul className="lista-check">
          <li>90 publicaciones con tus datos ya puestos y su versión para WhatsApp</li>
          <li>Calendario de 90 días</li>
          <li>40 diseños con tu logo y tus colores: carruseles, posts e historias</li>
          <li>30 guiones de reels con el texto para publicar</li>
          <li>Bonos: Perfil que capta en 1 hora y 20 prompts para tu colonia</li>
          {productos.bump && <li>Del mensaje a la visita: 50 respuestas de WhatsApp</li>}
          {productos.upsell && <li>Kit Captación Exclusiva: presentación para dueños, opinión de valor, guion de exclusiva, checklist y 10 publicaciones</li>}
        </ul>
        {productos.pack ? (
          estado === "armando" ? (
            <div aria-live="polite">
              <p style={{ margin: "18px 0 0" }}>Armando tu pack. Puede tardar unos minutos: no cierres esta pantalla.</p>
              <div className="progreso" style={{ background: "rgba(228,218,204,.25)" }}><i style={{ background: "var(--blanco)" }} /></div>
            </div>
          ) : (
            <button type="button" onClick={generar} style={{ width: "100%", marginTop: 14 }}>{estado === "listo" ? "Volver a armar mi pack" : "Armar y descargar mi pack"}</button>
          )
        ) : <p className="ayuda">Tu compra no incluye el pack.</p>}
        {error && <div className="error">{error}</div>}
      </div>
      {estado === "listo" && (
        <div className="ok" aria-live="polite">
          Listo. Abre el archivo descargado y empieza por <b>00 EMPIEZA AQUI</b>.{correo ? " También te mandamos el link a tu correo." : ""} Si cambias tus datos, vuelve a armarlo.
          <div><a className="boton claro" href={url} style={{ width: "100%", marginTop: 14 }}>Descargar otra vez</a></div>
        </div>
      )}
      <p className="ayuda" style={{ marginTop: 18 }}>El archivo es un ZIP. En el celular, ábrelo desde la app Archivos (iPhone) o Files de Google (Android).</p>
    </div>
  );
}

/** Botón para elegir una imagen, en español en cualquier navegador (el nativo sale en el idioma del sistema). */
function Archivo({ onElegir, required, texto = "Elegir imagen" }: { onElegir: (f: File) => void; required?: boolean; texto?: string }) {
  const [nombre, setNombre] = useState("");
  return (
    <label className="archivo">
      <input type="file" accept="image/png,image/jpeg" required={required} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setNombre(f.name); onElegir(f); } }} />
      <span className="archivo-boton">{texto}</span>
      <span className="archivo-nombre">{nombre || "Ningún archivo elegido"}</span>
    </label>
  );
}

const CARACT = ["", "", ""];

function NuevaPropiedad() {
  const [x, setX] = useState({ operacion: "venta", etiqueta: "Recién captada", tipo: "Casa", colonia: "", recamaras: "", banos: "", m2: "", precio: "", caracteristicas: CARACT, creditos: [] as string[], foto: "" });
  const [res, setRes] = useState<{ imagen: string; historia?: string; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const set = (k: keyof typeof x, v: unknown) => setX((p) => ({ ...p, [k]: v }));

  async function armar(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setEnviando(true); setRes(null); setCopiado(false);
    try {
      const cuerpo = { ...x, caracteristicas: x.caracteristicas.map((c) => c.trim()).filter(Boolean), foto: x.foto || undefined, creditos: x.operacion === "venta" ? x.creditos : [] };
      setRes(await (await api("/api/propiedad", { method: "POST", body: JSON.stringify(cuerpo) })).json());
    } catch (e) { setError((e as Error).message); }
    setEnviando(false);
  }

  const ext = (d: string) => (d.startsWith("data:image/jpeg") ? "jpg" : "png");
  const nombre = (x.colonia || "propiedad").replace(/[^\p{L}\p{N} ]/gu, "").trim() || "propiedad";

  return (
    <form onSubmit={armar} style={{ marginTop: 18 }}>
      <label>Operación</label>
      <div className="opciones">
        {["venta", "renta"].map((v) => <label key={v}><input type="radio" name="op" checked={x.operacion === v} onChange={() => set("operacion", v)} />{v === "venta" ? "Venta" : "Renta"}</label>)}
      </div>
      <div className="fila apilar">
        <div><label>Tipo</label><select value={x.tipo} onChange={(e) => set("tipo", e.target.value)}>{["Casa", "Departamento", "Terreno", "Local"].map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label>Etiqueta</label><select value={x.etiqueta} onChange={(e) => set("etiqueta", e.target.value)}>{["Recién captada", "Nueva en mi zona", "Precio actualizado", "Vendida", "Rentada"].map((t) => <option key={t}>{t}</option>)}</select></div>
      </div>
      <label>Colonia</label>
      <input type="text" required value={x.colonia} onChange={(e) => set("colonia", e.target.value)} />
      <div className="fila tres">
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
      <Archivo texto="Elegir foto" required onElegir={async (f) => { try { set("foto", await achicar(f, 1400, "image/jpeg")); } catch (err) { setError((err as Error).message); } }} />
      <p className="ayuda">Una foto horizontal y con luz de día se ve mejor. Pide permiso al dueño y que no se vea la dirección.</p>
      <button type="submit" disabled={enviando} style={{ marginTop: 24 }}>{enviando ? "Armando tu publicación..." : "Armar mi publicación"}</button>
      {enviando && <div className="progreso"><i /></div>}
      {error && <div className="error">{error}</div>}
      {res && (
        <div style={{ marginTop: 34 }}>
          <div className="cap">Tu publicación</div>
          <div className="vistas">
            <figure>
              <img className="vista" src={res.imagen} alt="Post de la propiedad" />
              <figcaption className="cap">Post</figcaption>
              <a className="boton" href={res.imagen} download={`${nombre} - post.${ext(res.imagen)}`}>Descargar</a>
            </figure>
            {res.historia && (
              <figure>
                <img className="vista" src={res.historia} alt="Historia de la propiedad" />
                <figcaption className="cap">Historia</figcaption>
                <a className="boton claro" href={res.historia} download={`${nombre} - historia.${ext(res.historia)}`}>Descargar</a>
              </figure>
            )}
          </div>
          <label style={{ marginTop: 26 }}>Texto para publicar</label>
          <pre className="texto" style={{ marginTop: 0 }}>{res.texto}</pre>
          <button type="button" className="sec" style={{ width: "100%", marginTop: 12 }} onClick={() => navigator.clipboard.writeText(res.texto).then(() => setCopiado(true))}>{copiado ? "Texto copiado" : "Copiar texto"}</button>
          {x.operacion === "venta" && <p className="ayuda" style={{ marginTop: 14 }}>El post y la historia de venta ya traen tu nombre, domicilio, teléfono, correo y el precio en pesos. Si aceptas crédito, el texto avisa que el precio total depende del crédito y de los gastos notariales, como pide la NOM-247.</p>}
        </div>
      )}
    </form>
  );
}
