import { z } from "zod";

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color en formato #RRGGBB");

export const PerfilSchema = z.object({
  nombre: z.string().trim().min(2).max(60),
  nombreComercial: z.string().max(60).optional().default(""),
  whatsapp: z.string().min(8).max(25),
  correo: z.string().email(),
  domicilio: z.string().min(5).max(140),
  ciudad: z.string().min(2).max(60),
  zona: z.string().min(2).max(60),
  colonias: z.array(z.string().min(2).max(50)).min(1).max(3),
  colorPrincipal: color,
  colorAcento: color,
  especialidad: z.enum(["venta", "renta", "ambas"]),
  cliente: z.enum(["primera_casa", "familias", "inversionistas", "mixto"]),
  tono: z.enum(["cercano", "formal"]),
  genero: z.enum(["a", "o", "neutro"]).default("neutro"),
  aniosExperiencia: z.string().max(20).optional().default(""),
  historia: z.string().max(400).optional().default(""),
  usuarioRedes: z.string().max(40).optional().default(""),
  logoUrl: z.string().url().optional(),
  fotoUrl: z.string().url().optional(),
});

export type Perfil = z.infer<typeof PerfilSchema>;

export const PERFIL_EJEMPLO: Perfil = {
  nombre: "Laura Gómez",
  nombreComercial: "Laura Gómez Bienes Raíces",
  // Datos de contacto claramente ficticios: salen en las imágenes públicas de la página de venta.
  whatsapp: "33 0000 0000",
  correo: "laura@example.com",
  domicilio: "Av. Ejemplo 100, Zapopan, Jal.",
  ciudad: "Zapopan",
  zona: "Zapopan",
  colonias: ["Ciudad Granja", "Jardines Universidad", "Puerta de Hierro"],
  colorPrincipal: "#1F3A5F",
  colorAcento: "#E8A33D",
  especialidad: "ambas",
  cliente: "familias",
  tono: "cercano",
  genero: "a",
  aniosExperiencia: "8",
  historia: "",
  usuarioRedes: "@laura.ejemplo",
};
