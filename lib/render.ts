import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";
import { fuentes } from "./fuentes";

export async function png(el: ReactNode, width: number, height: number): Promise<Buffer> {
  const svg = await satori(el as React.ReactElement, { width, height, fonts: fuentes(), embedFont: true });
  return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
}
