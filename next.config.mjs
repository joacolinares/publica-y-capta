/** @type {import('next').NextConfig} */
export default {
  // resvg trae un binario nativo: se carga desde node_modules y no se empaqueta.
  serverExternalPackages: ["@resvg/resvg-js"],
  outputFileTracingIncludes: { "/api/**": ["./fonts/**", "./fotos/**", "./content/**"] },
  // La página oscura estuvo de prueba en /v2 y ahora es la raíz: los anuncios y enlaces viejos a /v2 llegan aquí.
  // Next pasa la query tal cual (?utm_..., fbclid), así que no se pierde de dónde vino la visita.
  async redirects() {
    return [{ source: "/v2", destination: "/", permanent: true }];
  },
};
