// Adapta el tono y los ejemplos de los textos NO técnicos al perfil del asesor.
// Los días técnicos (créditos, escrituras, impuestos, NOM-247) no pasan por la IA: van tal cual, revisados.
// Cada lote adaptado se guarda: si el perfil y los textos no cambiaron, volver a armar el pack no llama a la IA.
import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Perfil } from "./perfil";
import { revisar, type Dia } from "./personalizar";

const MODELO = process.env.CLAUDE_MODEL || "claude-opus-5-5";

const Salida = z.object({
  textos: z.array(z.object({ dia: z.number(), post: z.string(), whatsapp: z.string() })),
});
type Adaptado = { dia: number; post: string; whatsapp: string };

/** Dónde se guardan los lotes ya adaptados, por clave de lote. */
export type CacheIA = { leer(): Promise<Record<string, Adaptado[]>>; guardar(lotes: Record<string, Adaptado[]>): Promise<void> };

const SISTEMA = `Adaptas publicaciones de redes sociales para un asesor inmobiliario en México.
Recibes textos ya escritos y revisados. Tu trabajo es solo ajustar el tono y los ejemplos al perfil del asesor.
Reglas:
- Español de México, de "tú". Mantén la estructura, el largo aproximado, los emojis, la palabra clave en MAYÚSCULAS de la llamada a la acción y los hashtags.
- No agregues datos, cifras, porcentajes, plazos, requisitos ni promesas que no estén en el texto original.
- No uses superlativos ("el mejor", "única", "increíble"), ni "garantizado", "certificado" u "oficial".
- No inventes testimonios, clientes ni resultados.
- Conserva tal cual cualquier texto entre [corchetes].
- Si un texto ya encaja con el perfil, devuélvelo igual.`;

function describir(p: Perfil) {
  const cliente = { primera_casa: "gente que compra su primera casa", familias: "familias", inversionistas: "inversionistas", mixto: "todo tipo de clientes" }[p.cliente];
  const esp = { venta: "venta", renta: "renta", ambas: "venta y renta" }[p.especialidad];
  return `Asesor: ${p.nombre}. Ciudad: ${p.ciudad}. Zona: ${p.zona}. Colonias: ${p.colonias.join(", ")}.
Trabaja en ${esp}. Su cliente principal: ${cliente}. Tono: ${p.tono === "cercano" ? "cercano y amable" : "formal y profesional"}.${p.historia ? `\nSu historia (úsala solo en textos de marca personal): ${p.historia}` : ""}`;
}

/** Las palabras clave de la llamada a la acción ("palabra CONSEJO"), en orden. */
const clave = (s: string) => [...s.matchAll(/[Pp]alabra ([A-ZÁÉÍÓÚÑ]{3,})/g)].map((m) => m[1]).join("|");

/** La versión de la IA sirve si no rompe una regla, no pierde corchetes y conserva la palabra clave (la piden el guion y los diseños). */
function aceptable(orig: Dia, t: Adaptado) {
  const corchetesOk = (orig.post.match(/\[[^\]]+\]/g) ?? []).every((c) => t.post.includes(c));
  return revisar(t.post + t.whatsapp).length === 0 && corchetesOk && clave(t.post) === clave(orig.post);
}

export async function adaptarConIA(dias: Dia[], p: Perfil, cache?: CacheIA): Promise<{ textos: Map<number, { post: string; whatsapp: string }>; llamadas: number }> {
  const out = new Map<number, { post: string; whatsapp: string }>();
  if (!process.env.ANTHROPIC_API_KEY) return { textos: out, llamadas: 0 };
  const client = new Anthropic({ timeout: 240_000, maxRetries: 0 });
  const candidatos = dias.filter((d) => !d.tecnico && d.publico !== "Propiedad");
  const lotes: Dia[][] = [];
  for (let i = 0; i < candidatos.length; i += 12) lotes.push(candidatos.slice(i, i + 12));

  const perfil = describir(p);
  const entrada = (lote: Dia[]) => `${perfil}\n\nTextos a adaptar (JSON):\n${JSON.stringify(lote.map(({ dia, post, whatsapp }) => ({ dia, post, whatsapp })))}`;
  // La clave cambia si cambia el modelo, las reglas, el perfil o los textos base del lote.
  const claveLote = (lote: Dia[]) => createHash("sha256").update(JSON.stringify([MODELO, SISTEMA, entrada(lote)])).digest("hex").slice(0, 32);
  const previos: Record<string, Adaptado[]> = await cache?.leer().catch((e) => { console.error("IA: no se pudo leer lo guardado", e instanceof Error ? e.message : e); return {}; }) ?? {};
  const nuevos: Record<string, Adaptado[]> = {};
  let llamadas = 0;

  await Promise.all(
    lotes.map(async (lote) => {
      const k = claveLote(lote);
      let textos = previos[k];
      if (!textos) {
        try {
          llamadas++;
          const res = await client.beta.messages.parse({
            model: MODELO,
            max_tokens: 16000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: { effort: "low", format: zodOutputFormat(Salida) },
            system: SISTEMA,
            messages: [{ role: "user", content: entrada(lote) }],
          });
          if (res.stop_reason !== "end_turn" || !res.parsed_output) return;
          textos = res.parsed_output.textos.filter((t) => { const orig = lote.find((d) => d.dia === t.dia); return orig && aceptable(orig, t); });
        } catch (e) {
          console.error("IA: lote con error, se usa el texto base", e instanceof Error ? e.message : e);
          return;
        }
      }
      nuevos[k] = textos;
      for (const t of textos) {
        const orig = lote.find((d) => d.dia === t.dia);
        if (orig && aceptable(orig, t)) out.set(t.dia, { post: t.post, whatsapp: t.whatsapp });
      }
    }),
  );
  // Solo quedan los lotes de este perfil: los de un perfil anterior ya no sirven.
  if (cache && llamadas && Object.keys(nuevos).length) await cache.guardar(nuevos).catch((e) => console.error("IA: no se pudo guardar", e instanceof Error ? e.message : e));
  return { textos: out, llamadas };
}
