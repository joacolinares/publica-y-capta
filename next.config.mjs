/** @type {import('next').NextConfig} */
export default {
  // resvg trae un binario nativo: se carga desde node_modules y no se empaqueta.
  serverExternalPackages: ["@resvg/resvg-js"],
  outputFileTracingIncludes: { "/api/**": ["./fonts/**", "./content/**"] },
};
