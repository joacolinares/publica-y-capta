/** APP_URL sin barra final y con https:// aunque lo hayan cargado sin esquema (Railway muestra el dominio así). Vacío si no hay. */
export function appUrl() {
  const crudo = (process.env.APP_URL || "").trim().replace(/\/+$/, "");
  return !crudo || /^https?:\/\//.test(crudo) ? crudo : `https://${crudo}`;
}
