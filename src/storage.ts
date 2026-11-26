import { cloneDraft, type Draft } from "./model.ts";

const STORAGE_KEY = "dokumentu-sagatavotajs.v1";

export interface Persisted {
  templateId: string;
  drafts: Record<string, Draft>;
}

function cleanValues(values: unknown, fallback: Record<string, string>): Record<string, string> {
  const next = { ...fallback };
  if (!values || typeof values !== "object") return next;
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") next[key] = value;
  }
  return next;
}

function cleanItems(items: unknown): Draft["items"] | null {
  if (!Array.isArray(items)) return null;
  return items.map((item) => {
    const next: Draft["items"][number] = {};
    if (item && typeof item === "object") {
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === "string") next[key] = value;
      }
    }
    return next;
  });
}

export function mergeDraft(base: Draft, saved: unknown): Draft {
  if (!saved || typeof saved !== "object") return cloneDraft(base);
  const candidate = saved as Partial<Draft>;
  const items = cleanItems(candidate.items);
  return {
    values: cleanValues(candidate.values, base.values),
    items: items ?? base.items.map((item) => ({ ...item })),
  };
}

export function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (!parsed || typeof parsed.templateId !== "string" || !parsed.drafts || typeof parsed.drafts !== "object") {
      return null;
    }
    return { templateId: parsed.templateId, drafts: parsed.drafts };
  } catch {
    return null;
  }
}

export function savePersisted(data: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Privātajā režīmā krātuve var būt slēgta. Melnraksts paliek tikai šajā sesijā.
  }
}
