// Fotos de los diseños: las de stock (dominio público, ver fotos/CREDITOS.md) y las del asesor o la propiedad.
// Cada foto se recorta con sharp al tamaño exacto del hueco: se ve mejor y el render es más rápido.
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type Etiqueta =
  | "sala" | "cocina" | "recamara" | "bano" | "comedor" | "terraza" | "jardin" | "fachada" | "edificio"
  | "calle" | "puerta" | "llaves" | "escritorio" | "firma" | "detalle" | "ventana";

type FotoStock = { archivo: string; etiqueta: Etiqueta; posicion?: string };

const dir = process.env.FOTOS_DIR || path.join(process.cwd(), "fotos");
let manifiesto: FotoStock[] | null = null;
const lista = () => (manifiesto ??= JSON.parse(readFileSync(path.join(dir, "fotos.json"), "utf8")) as FotoStock[]);

// Si una etiqueta no tiene foto, se usa la más parecida.
const PARECIDAS: Record<Etiqueta, Etiqueta[]> = {
  sala: ["comedor", "ventana"], cocina: ["comedor", "sala"], recamara: ["sala", "ventana"], bano: ["recamara", "sala"],
  comedor: ["sala", "cocina"], terraza: ["jardin", "sala"], jardin: ["terraza", "detalle"], fachada: ["puerta", "calle"],
  edificio: ["fachada", "calle"], calle: ["fachada", "detalle"], puerta: ["fachada", "llaves"], llaves: ["puerta", "detalle"],
  escritorio: ["firma", "comedor"], firma: ["escritorio", "llaves"], detalle: ["jardin", "sala"], ventana: ["sala", "recamara"],
};

/** Foto de stock para una etiqueta. `n` elige entre las que hay (se usa para no repetir la misma en piezas seguidas). */
export function stock(etiqueta: Etiqueta, n = 0): FotoStock {
  const todas = lista();
  for (const e of [etiqueta, ...PARECIDAS[etiqueta]]) {
    const de = todas.filter((f) => f.etiqueta === e);
    if (de.length) return de[n % de.length];
  }
  return todas[n % todas.length];
}

/** Lo que pide cada diseño: la etiqueta de la foto y su layout (arco, panel, historia…). */
export type Pedida = { etiqueta: Etiqueta; estilo: string };

/**
 * Reparte las fotos de stock entre los diseños del pack, en orden: cada uno toma la foto menos usada de su etiqueta
 * o, si esa ya salió, una parecida que no se haya usado. Así la misma foto no sale en días seguidos
 * y nunca se repite con el mismo layout (dos diseños casi idénticos).
 */
export function repartir(pedidas: Pedida[]): string[] {
  const usos = new Map<string, number>();
  const conEstilo = new Set<string>();
  let anterior = "";
  return pedidas.map(({ etiqueta: e, estilo }) => {
    const candidatas = [e, ...PARECIDAS[e]].flatMap((t, k) => lista().filter((f) => f.etiqueta === t).map((f) => ({ f, castigo: k === 0 ? 0 : k + 0.5 })));
    if (!candidatas.length) return (anterior = stock(e).archivo);
    let mejor = candidatas[0], puntos = Infinity;
    for (const x of candidatas) {
      const p = (usos.get(x.f.archivo) ?? 0) * 3 + x.castigo + (x.f.archivo === anterior ? 3 : 0) + (conEstilo.has(`${x.f.archivo}|${estilo}`) ? 10 : 0);
      if (p < puntos) { mejor = x; puntos = p; }
    }
    usos.set(mejor.f.archivo, (usos.get(mejor.f.archivo) ?? 0) + 1);
    conEstilo.add(`${mejor.f.archivo}|${estilo}`);
    return (anterior = mejor.f.archivo);
  });
}

/** "50% 30%" → posición de recorte para sharp (de 0 a 1). */
function punto(pos = "50% 50%") {
  const [x, y] = pos.split(/\s+/).map((v) => Math.min(100, Math.max(0, parseFloat(v))) / 100);
  return { x: Number.isFinite(x) ? x : 0.5, y: Number.isFinite(y) ? y : 0.5 };
}

const cache = new Map<string, Promise<string>>();

/** Recorta una imagen (Buffer) a ancho×alto tomando como centro el punto dado. Devuelve un data URI JPEG. */
async function recortar(buf: Buffer, w: number, h: number, pos: string | "atencion", oscurecer = 0, desenfocar = 0) {
  let img = sharp(buf).rotate();
  if (pos === "atencion") {
    img = img.resize(w, h, { fit: "cover", position: sharp.strategy.attention });
  } else {
    const meta = await sharp(buf).rotate().metadata();
    const W = meta.autoOrient?.width ?? meta.width ?? w, H = meta.autoOrient?.height ?? meta.height ?? h;
    const escala = Math.max(w / W, h / H);
    const rw = Math.round(W * escala), rh = Math.round(H * escala);
    const p = punto(pos);
    const left = Math.round(Math.min(rw - w, Math.max(0, p.x * rw - w / 2)));
    const top = Math.round(Math.min(rh - h, Math.max(0, p.y * rh - h / 2)));
    img = img.resize(rw, rh).extract({ left, top, width: w, height: h });
  }
  if (desenfocar) img = img.blur(desenfocar);
  if (oscurecer) img = img.modulate({ brightness: 1 - oscurecer });
  const out = await img.jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

export type Opciones = { oscurecer?: number; desenfocar?: number };

/** Foto de stock recortada al hueco. `archivo` (de repartir) manda sobre la etiqueta. */
export function fotoStock(etiqueta: Etiqueta, n: number, w: number, h: number, o: Opciones = {}, archivo?: string) {
  const f = (archivo && lista().find((x) => x.archivo === archivo)) || stock(etiqueta, n);
  const clave = `${f.archivo}|${w}x${h}|${o.oscurecer ?? 0}|${o.desenfocar ?? 0}`;
  if (!cache.has(clave)) cache.set(clave, recortar(readFileSync(path.join(dir, f.archivo)), w, h, f.posicion ?? "50% 50%", o.oscurecer, o.desenfocar));
  return cache.get(clave)!;
}

/** Foto que sube el asesor (su foto o la de una propiedad), recortada al hueco. Para caras se usa el recorte por atención. */
export async function fotoPropia(dataUrl: string, w: number, h: number, o: Opciones = {}) {
  const m = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
  if (!m) throw new Error("Foto inválida");
  return recortar(Buffer.from(m[2], "base64"), w, h, "atencion", o.oscurecer, o.desenfocar);
}
