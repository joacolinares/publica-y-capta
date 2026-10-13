// Adapta el tono y los ejemplos de los textos NO técnicos al perfil del asesor.
// Los días técnicos (créditos, escrituras, impuestos, NOM-247) no pasan por la IA: van tal cual, revisados.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Perfil } from "./perfil";
import { revisar, type Dia } from "./personalizar";

const MODELO = process.env.CLAUDE_MODEL || "claude-opus-5-5";

const Salida = z.object({
  textos: z.array(z.object({ dia: z.number(), post: z.string(), whatsapp: z.string() })),
});

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

export async function adaptarConIA(dias: Dia[], p: Perfil): Promise<Map<number, { post: string; whatsapp: string }>> {
  const out = new Map<number, { post: string; whatsapp: string }>();
  if (!process.env.ANTHROPIC_API_KEY) return out;
  const client = new Anthropic({ timeout: 120_000, maxRetries: 1 });
  const candidatos = dias.filter((d) => !d.tecnico && d.publico !== "Propiedad");
  const lotes: Dia[][] = [];
  for (let i = 0; i < candidatos.length; i += 12) lotes.push(candidatos.slice(i, i + 12));

  await Promise.all(
    lotes.map(async (lote) => {
      try {
        const res = await client.beta.messages.parse({
          model: MODELO,
          max_tokens: 16000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "low", format: zodOutputFormat(Salida) },
          system: SISTEMA,
          messages: [{
            role: "user",
            content: `${describir(p)}\n\nTextos a adaptar (JSON):\n${JSON.stringify(lote.map(({ dia, post, whatsapp }) => ({ dia, post, whatsapp })))}`,
          }],
        });
        if (res.stop_reason !== "end_turn" || !res.parsed_output) return;
        for (const t of res.parsed_output.textos) {
          const orig = lote.find((d) => d.dia === t.dia);
          if (!orig) continue;
          // Se descarta la versión de la IA si rompe una regla o pierde corchetes.
          const corchetesOk = (orig.post.match(/\[[^\]]+\]/g) ?? []).every((c) => t.post.includes(c));
          if (revisar(t.post + t.whatsapp).length === 0 && corchetesOk) out.set(t.dia, { post: t.post, whatsapp: t.whatsapp });
        }
      } catch (e) {
        console.error("IA: lote con error, se usa el texto base", e instanceof Error ? e.message : e);
      }
    }),
  );
  return out;
}
