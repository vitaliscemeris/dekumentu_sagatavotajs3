export interface Segment {
  text: string;
  muted?: boolean;
  strong?: boolean;
}

export interface Field {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "email" | "tel" | "number" | "select";
  section: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  rows?: number;
  span?: "full";
  options?: { value: string; label: string }[];
  showWhen?: { key: string; equals: string };
  autoComplete?: string;
}

export interface LineColumn {
  key: string;
  label: string;
  placeholder?: string;
  numeric?: boolean;
}

export interface LineItemsConfig {
  title: string;
  afterSection: string;
  addLabel: string;
  columns: LineColumn[];
}

export type LineItem = Record<string, string>;

export interface Draft {
  values: Record<string, string>;
  items: LineItem[];
}

export interface SummaryRow {
  label: string;
  value: string;
  strong?: boolean;
}

export interface Template {
  id: string;
  name: string;
  kind: string;
  blurb: string;
  fileStem: string;
  nameKey?: string;
  fields: Field[];
  lineItems?: LineItemsConfig;
  empty: Draft;
  sample: Draft;
  render: (draft: Draft) => DocumentModel;
  totals?: (draft: Draft) => SummaryRow[];
}

export type DocumentBlock =
  | { type: "right"; lines: Segment[][] }
  | { type: "title"; kicker?: string; title: string; subtitle?: Segment[] }
  | { type: "paragraph"; lines: Segment[][]; align?: "left" | "justify" }
  | { type: "headline"; leftTitle: string; left: Segment[][]; rightTitle: string; right: Segment[][] }
  | { type: "party"; title: string; lines: Segment[][] }
  | {
      type: "table";
      columns: { header: string; align: "left" | "right"; width: number }[];
      rows: string[][];
      totals?: SummaryRow[];
    }
  | { type: "note"; title?: string; lines: Segment[][] }
  | { type: "sign"; dateLine?: Segment[]; name: Segment; role?: string; caption?: string }
  | { type: "gap" };

export interface DocumentModel {
  blocks: DocumentBlock[];
}

export function text(value: string): Segment {
  return { text: value };
}

export function strong(value: string): Segment {
  return { text: value, strong: true };
}

export function placeholder(value = "____________________"): Segment {
  return { text: value, muted: true };
}

export function valueOrBlank(value: string | undefined, blank = "____________________"): Segment {
  const trimmed = value?.trim();
  return trimmed ? { text: trimmed } : { text: blank, muted: true };
}

export function strongOrBlank(value: string | undefined, blank = "____________________"): Segment {
  const trimmed = value?.trim();
  return trimmed ? { text: trimmed, strong: true } : { text: blank, muted: true };
}

export function proseLines(value: string | undefined, empty: string): Segment[][] {
  const trimmed = value?.trim();
  if (!trimmed) return [[{ text: empty, muted: true }]];
  return trimmed.split("\n").map((line) => [{ text: line.length ? line : " " }]);
}

export function prefixed(prefix: string, value: string | undefined): Segment[] | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return [{ text: `${prefix}${trimmed}` }];
}

const MONTHS = {
  locative: [
    "janvārī",
    "februārī",
    "martā",
    "aprīlī",
    "maijā",
    "jūnijā",
    "jūlijā",
    "augustā",
    "septembrī",
    "oktobrī",
    "novembrī",
    "decembrī",
  ],
  genitive: [
    "janvāra",
    "februāra",
    "marta",
    "aprīļa",
    "maija",
    "jūnija",
    "jūlija",
    "augusta",
    "septembra",
    "oktobra",
    "novembra",
    "decembra",
  ],
} as const;

export type DateCase = keyof typeof MONTHS;

export function formatDate(iso: string | undefined, grammar: DateCase): string {
  if (!iso?.trim()) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso.trim();
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return iso.trim();
  return `${year}. gada ${day}. ${MONTHS[grammar][month - 1]}`;
}

export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function placeDate(place: string | undefined, iso: string | undefined): Segment[] {
  const placeText = place?.trim();
  const dateText = formatDate(iso, "locative");
  if (placeText && dateText) return [{ text: `${placeText}, ${dateText}` }];
  if (placeText) return [{ text: `${placeText}, ` }, placeholder("____. gada __. ________")];
  if (dateText) return [{ text: dateText }];
  return [placeholder("______________, ____. gada __. ________")];
}

export function parseNum(value: string | undefined): number {
  if (!value?.trim()) return 0;
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function money(value: number): string {
  const sign = value < 0 ? "−" : "";
  const [whole, cents] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${grouped},${cents} €`;
}

export function formatQty(value: string | undefined): string {
  if (!value?.trim()) return "—";
  const amount = parseNum(value);
  return amount
    .toFixed(2)
    .replace(".", ",")
    .replace(/,00$/, "")
    .replace(/(,\d)0$/, "$1");
}

export function lineSum(item: LineItem): number {
  return parseNum(item.qty) * parseNum(item.price);
}

export function blankItem(columns: LineColumn[]): LineItem {
  return Object.fromEntries(columns.map((column) => [column.key, ""]));
}

export function cloneDraft(draft: Draft): Draft {
  return {
    values: { ...draft.values },
    items: draft.items.map((item) => ({ ...item })),
  };
}

const LETTERS: Record<string, string> = {
  ā: "a",
  č: "c",
  ē: "e",
  ģ: "g",
  ī: "i",
  ķ: "k",
  ļ: "l",
  ņ: "n",
  š: "s",
  ū: "u",
  ž: "z",
};

export function documentFileName(template: Template, draft: Draft): string {
  const source = template.nameKey ? (draft.values[template.nameKey] ?? "") : "";
  const slug = source
    .trim()
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (letter) => LETTERS[letter] ?? letter)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `${template.fileStem}-${slug}.docx` : `${template.fileStem}.docx`;
}
