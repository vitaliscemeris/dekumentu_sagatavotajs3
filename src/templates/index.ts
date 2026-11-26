import type { Template } from "../model.ts";
import { iesniegums } from "./iesniegums.ts";
import { izzina } from "./izzina.ts";
import { pilnvara } from "./pilnvara.ts";
import { rekins } from "./rekins.ts";

export const templates: Template[] = [iesniegums, pilnvara, rekins, izzina];

export function getTemplate(id: string): Template {
  return templates.find((template) => template.id === id) ?? templates[0];
}
