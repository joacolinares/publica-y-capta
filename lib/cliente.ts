"use client";
// Firebase en el navegador: acceso con link mágico por correo y llamadas a la API con el token.
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const auth = () => {
  const a = getAuth(getApps()[0] ?? initializeApp(config));
  a.languageCode = "es"; // el correo con el link de acceso sale en español
  return a;
};

export async function api(ruta: string, init: RequestInit = {}) {
  const token = await auth().currentUser?.getIdToken();
  let r: Response;
  try {
    r = await fetch(ruta, { ...init, headers: { ...(init.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...init.headers } });
  } catch {
    throw new Error(ruta === "/api/generar"
      ? "Se cortó la conexión. Espera unos minutos: si te llegó el correo con el link, úsalo; si no, vuelve a armar tu pack."
      : "No hay conexión. Revisa tu internet e intenta de nuevo.");
  }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || "No se pudo completar. Intenta de nuevo.");
  }
  return r;
}

/** Achica una imagen en el navegador para que suba rápido desde el celular. */
export function achicar(file: File, max: number, tipo: "image/png" | "image/jpeg"): Promise<string> {
  return new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL(tipo, 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => mal(new Error("No pudimos leer esa imagen. Prueba con un PNG o JPG."));
    img.src = URL.createObjectURL(file);
  });
}

/** Saca 2 colores del logo: el más frecuente con color, y otro bien distinto. */
export function coloresDeLogo(dataUrl: string): Promise<[string, string] | null> {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const x = c.getContext("2d")!;
      x.drawImage(img, 0, 0, 64, 64);
      const d = x.getImageData(0, 0, 64, 64).data;
      const cubetas = new Map<string, { n: number; r: number; g: number; b: number }>();
      for (let i = 0; i < d.length; i += 4) {
        const [r, g, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (a < 200 || max - min < 40 || max > 245 || max < 25) continue; // sin fondo, grises ni blanco
        const k = `${r >> 5},${g >> 5},${b >> 5}`;
        const v = cubetas.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
        v.n++; v.r += r; v.g += g; v.b += b;
        cubetas.set(k, v);
      }
      const orden = [...cubetas.values()].sort((a, b) => b.n - a.n).map((v) => [v.r / v.n, v.g / v.n, v.b / v.n]);
      if (!orden.length) return ok(null);
      const hex = (c: number[]) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
      const otro = orden.find((c) => Math.hypot(c[0] - orden[0][0], c[1] - orden[0][1], c[2] - orden[0][2]) > 120);
      ok([hex(orden[0]), otro ? hex(otro) : "#E8A33D"]);
    };
    img.onerror = () => ok(null);
    img.src = dataUrl;
  });
}

/** true si el logo casi seguro trae fondo (blanco o de color) en vez de transparente: es opaco casi entero, o lo son el borde
 *  y una franja un poco más adentro. Así un logo transparente con un marco fino no da aviso, y uno con fondo redondeado sí. */
export function tieneFondo(dataUrl: string): Promise<boolean> {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => {
      const N = 64, c = document.createElement("canvas");
      c.width = c.height = N;
      const x = c.getContext("2d")!;
      x.drawImage(img, 0, 0, N, N);
      const d = x.getImageData(0, 0, N, N).data;
      const opaco = (px: number, py: number) => d[(py * N + px) * 4 + 3] > 240;
      const anillo = (k: number) => {
        let n = 0, t = 0;
        for (let i = k; i < N - k; i++) for (const [px, py] of [[i, k], [i, N - 1 - k], [k, i], [N - 1 - k, i]]) { t++; if (opaco(px, py)) n++; }
        return n / t;
      };
      let total = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 240) total++;
      ok(total / (N * N) >= 0.93 || (anillo(0) >= 0.85 && anillo(4) >= 0.85));
    };
    img.onerror = () => ok(false);
    img.src = dataUrl;
  });
}
