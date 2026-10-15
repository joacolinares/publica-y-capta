// opentype.js (la misma copia que usa satori) no trae tipos: solo usamos parse().
declare module "@shuding/opentype.js" {
  const opentype: { parse(buffer: ArrayBuffer): unknown };
  export default opentype;
}
